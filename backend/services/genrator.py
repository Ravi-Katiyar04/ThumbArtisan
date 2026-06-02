import asyncio
import logging

from sqlmodel import Session, select
from database import engine
from models import Job, Thumbnail
from services.openai_service import generate_thumbnail
from services.imagekit_service import upload_file

logger = logging.getLogger(__name__)

STYLES = {
    "bold_dramatic":(
        "create a bold dramatic YouTube thumbnail with high contrast, "
        "cinematic lighting, and dynamic composition. The thumbnail should feature a close-up of the person's face with intense expressions, "
        "The person face should be prominent with a dramatic expression."
    ),
    "clean_modern":(
        "create a clean modern YouTube thumbnail with bright colors, simple composition, and clear typography"
        "white/light background, mordern professional aesthetic, plenty of "
        "white space, sharp clean composition. The person should look approachable and professional, with a clear and friendly expression. The person's face should be prominent and well-lit, with a clean and modern style."
    ),
    "vibrant_energetic":(
        "create a vibrant energetic YouTube thumbnail with bold colors, dynamic composition, and exciting visuals. The thumbnail should feature a close-up of the person's face with an enthusiastic expression, "
        "dynamic angle, eye-catching pop-art style colors and energetic vibe."
        "The person's face should be prominent and well-lit, with a vibrant and energetic style."
    ),
}

STYLE_ORDER = ["bold_dramatic", "clean_modern", "vibrant_energetic"]

async def generate_single_thumbnail(thumbnail_id: str, prompt: str, headshot_url: str):
    """DB- MARKER: Generate a single thumbnail"""
    with Session(engine) as session:
        thumb= session.get(Thumbnail, thumbnail_id)
        thumb.status = "generating"
        style_name = thumb.style_name
        session.add(thumb)
        session.commit()

    style_prompt = STYLES[style_name]

    # AI Call
    try:
        image_bytes = await generate_thumbnail(prompt, style_prompt, headshot_url)
        with Session(engine) as session:
            thumb = session.get(Thumbnail, thumbnail_id)
            job_id = thumb.job_id

            # Upload to ImageKit
            url = upload_file(
                file_bytes=image_bytes,
                file_name=f"{thumbnail_id}.jpeg",
                folder=f"thumbnails/{job_id}/"
            )

            # DB call save the url+ mark uploaded
            with Session(engine) as session:
                thumb = session.get(Thumbnail, thumbnail_id)
                thumb.imagekit_url = url
                thumb.status = "uploaded"
                session.add(thumb)
                session.commit()
            logger.info(f"Thumbnail {thumbnail_id} generated and uploaded successfully.")

    except Exception as e:
        logger.error(f"Error generating thumbnail {thumbnail_id}: {e}")
        with Session(engine) as session:
            thumb = session.get(Thumbnail, thumbnail_id)
            thumb.status = "failed"
            thumb.error_message = str(e)[:500]  # Truncate error message to fit in DB
            session.add(thumb)
            session.commit()


async def process_job(job_id: str):
    """DB- MARKER: Process a job by generating all its thumbnails."""
    with Session(engine) as session:
        job = session.get(Job, job_id)
        if not job:
            logger.error(f"Job {job_id} not found.")
            return
        prompt = job.prompt
        headshot_url = job.headshot_url
        session.commit()  # Ensure we have the latest data

        thumbnails = session.exec(
            select(Thumbnail).where(Thumbnail.job_id == job_id)
        ).all()
        thumbnails_ids = [t.id for t in thumbnails]

        tasks = [
            generate_single_thumbnail(tid, prompt, headshot_url)
            for tid in thumbnails_ids
        ]

        await asyncio.gather(*tasks, return_exceptions=True)

        with Session(engine) as session:
            thumbnails = session.exec(
                select(Thumbnail).where(Thumbnail.job_id == job_id)
            ).all()
            all_failed = all(t.status == "failed" for t in thumbnails)
            job = session.get(Job, job_id)
            job.status = "failed" if all_failed else "completed"
            session.add(job)
            session.commit()