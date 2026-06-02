import base64
from openai import AsyncOpenAI

from config import OPENAI_API_KEY, OPENAI_BASE_URL, OPENAI_MODEL

client = AsyncOpenAI(api_key=OPENAI_API_KEY, base_url=OPENAI_BASE_URL)

async def generate_thumbnail(prompt: str, style_prompt: str, headshot_url: str) -> bytes:
    """Generate thumbnail image using OpenAI's DALL-E API."""

    full_prompt = (
        f"{style_prompt}\n\n"
        f"user request: {prompt}\n\n"
        "IMPORTANT: The image should prominently feature the person. The person should be depicted in a style consistent with the artistic style described above, while maintaining the likeness and facial features"
        "shown in the provided headshot refrence image. keep their likeness accurate and the face clear and recognizable."
    )
    
    response = client.responses.create(
        model=OPENAI_MODEL,
        input=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": full_prompt},
                    {"type": "input_image", "source": headshot_url}
                ]
            }
        ],
        tools=[
            {
                "type": "image_generation",
                "model": "dall-e-3",
                "size": "1536x1024",
                "quality": "high",
                "output_format": "jpeg"

            }
        ],
    )

    for item in response.output:
        if item.type == "image_generation_call" and item.result:
            return base64.b64decode(item.result)
        
    raise ValueError("No image generation result found in the response.")