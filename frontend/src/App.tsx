import { useState } from 'react';
import {
  createJob,
  subscribeToJob,
  uploadHeadshot,
  type ThumbnailFailedEvent,
  type ThumbnailReadyEvent,
} from './api';
import ThumbnailGallery from './components/ThumbnailGallery';
import UploadForm, { type UploadFormValues } from './components/UploadForm';

type Thumbnail = {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
  tag: string;
  status: 'ready' | 'failed';
};

function toDisplayStyle(style: string): string {
  return style
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function App() {
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleGenerate = async ({ file, prompt, numThumbnails }: UploadFormValues) => {
    setIsGenerating(true);
    setStatusMessage('Uploading image...');
    setThumbnails([]);

    try {
      const headshotUrl = await uploadHeadshot(file);
      setStatusMessage('Creating generation job...');
      const jobId = await createJob(prompt, numThumbnails, headshotUrl);

      setStatusMessage('Generating thumbnails...');

      await new Promise<void>((resolve, reject) => {
        const unsubscribe = subscribeToJob(jobId, {
          onThumbnailReady: (data: ThumbnailReadyEvent) => {
            setThumbnails((prev) => [
              {
                id: data.thumbnail_id,
                title: `${toDisplayStyle(data.style_name)} Thumbnail`,
                imageUrl: data.variants?.youtube ?? data.imagekit_url,
                description: prompt,
                tag: toDisplayStyle(data.style_name),
                status: 'ready',
              },
              ...prev.filter((item) => item.id !== data.thumbnail_id),
            ]);
          },
          onThumbnailFailed: (data: ThumbnailFailedEvent) => {
            setThumbnails((prev) => [
              {
                id: data.thumbnail_id,
                title: `${toDisplayStyle(data.style_name)} Thumbnail`,
                imageUrl: '',
                description: data.error ?? 'Failed to generate this variation.',
                tag: toDisplayStyle(data.style_name),
                status: 'failed',
              },
              ...prev.filter((item) => item.id !== data.thumbnail_id),
            ]);
          },
          onJobCompleted: () => {
            setStatusMessage('Generation completed.');
            unsubscribe();
            resolve();
          },
          onError: (error: Error) => {
            unsubscribe();
            reject(error);
          },
        });
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate thumbnails.';
      setStatusMessage(message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100 sm:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="space-y-3">
          <p className="inline-flex rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-red-400">
            ThumbArtisan
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Professional Thumbnail Studio
          </h1>
          <p className="max-w-3xl text-zinc-400">
            Upload a headshot, add your prompt, and ThumbArtisan generates professional thumbnail
            variations for your video.
          </p>
          {statusMessage && (
            <p className="text-sm text-red-300" role="status">
              {statusMessage}
            </p>
          )}
        </header>

        <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <UploadForm onGenerate={handleGenerate} isGenerating={isGenerating} />
          <ThumbnailGallery items={thumbnails} />
        </section>
      </div>
    </main>
  );
}

export default App;

