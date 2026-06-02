const API_BASE_URL = '/api';

export async function uploadHeadshot(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_BASE_URL}/upload-headshot`, {
        method: 'POST',
        body: formData,
    });
    if (!response.ok) {
        throw new Error(`Failed to upload headshot: ${response.statusText}`);
    }
    return response.text();
}

export async function createJob(prompt: string, numThumbnails: number, headshotUrl: string): Promise<number> {
    const response = await fetch(`${API_BASE_URL}/jobs`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt,
            num_thumbnails: numThumbnails,
            headshot_url: headshotUrl
        }),
    });
    if (!response.ok) {
        throw new Error(`Failed to create job: ${response.statusText}`);
    }
    return response.json();
}



export async function subscribeToJob(jobId: number, {onThumbnailReady, onThumbnailFailed, onJobCompleted, onError}: {onThumbnailReady: (thumbnailUrl: string) => void, onThumbnailFailed: (errorMessage: string) => void, onJobCompleted: (data: any) => void, onError: (error: Error) => void}) {
    const eventSource = new EventSource(`${API_BASE_URL}/jobs/${jobId}/stream`);    
    eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'thumbnail_ready') {
            onThumbnailReady(data.thumbnail_url);
        } else if (data.type === 'thumbnail_failed') {
            onThumbnailFailed(data.error_message);
        } else if (data.type === 'job_completed') {
            onJobCompleted(data);
        }
    };
    eventSource.onerror = (error) => {
        onError(new Error(`EventSource error for job ${jobId}: ${error}`));
    };
}
export async function getJobStatus(jobId: number): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/job-status/${jobId}`);
    if (!response.ok) {
        throw new Error(`Failed to get job status: ${response.statusText}`);
    }
    return response.text();
}
