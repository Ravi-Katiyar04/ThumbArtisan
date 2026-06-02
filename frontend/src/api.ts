const API_BASE_URL = '/api';

export type ThumbnailVariants = {
  youtube: string;
  shorts: string;
  square: string;
};

export type ThumbnailReadyEvent = {
  thumbnail_id: string;
  style_name: string;
  imagekit_url: string;
  variants: ThumbnailVariants | null;
};

export type ThumbnailFailedEvent = {
  thumbnail_id: string;
  style_name: string;
  error: string | null;
};

type CreateJobResponse = {
  job_id: string;
};

type UploadResponse = {
  url: string;
};

async function parseError(response: Response): Promise<string> {
  const text = await response.text();
  if (!text) return `Request failed (${response.status})`;
  try {
    const json = JSON.parse(text) as { detail?: string };
    return json.detail ?? text;
  } catch {
    return text;
  }
}

export async function uploadHeadshot(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`${API_BASE_URL}/upload-headshot`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  const data = (await response.json()) as UploadResponse;
  return data.url;
}

export async function createJob(
  prompt: string,
  numThumbnails: number,
  headshotUrl: string,
): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      num_thumbnails: numThumbnails,
      headshot_url: headshotUrl,
    }),
  });
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  const data = (await response.json()) as CreateJobResponse;
  return data.job_id;
}

export function subscribeToJob(
  jobId: string,
  handlers: {
    onThumbnailReady: (data: ThumbnailReadyEvent) => void;
    onThumbnailFailed: (data: ThumbnailFailedEvent) => void;
    onJobCompleted: () => void;
    onError: (error: Error) => void;
  },
): () => void {
  const source = new EventSource(`${API_BASE_URL}/jobs/${jobId}/stream`);

  source.addEventListener('thumbnail_ready', (event) => {
    const data = JSON.parse((event as MessageEvent).data) as ThumbnailReadyEvent;
    handlers.onThumbnailReady(data);
  });

  source.addEventListener('thumbnail_failed', (event) => {
    const data = JSON.parse((event as MessageEvent).data) as ThumbnailFailedEvent;
    handlers.onThumbnailFailed(data);
  });

  source.addEventListener('job_completed', () => {
    handlers.onJobCompleted();
    source.close();
  });

  source.onerror = () => {
    if (source.readyState === EventSource.CLOSED) return;
    handlers.onError(new Error('Lost connection while streaming generated thumbnails.'));
    source.close();
  };

  return () => source.close();
}
