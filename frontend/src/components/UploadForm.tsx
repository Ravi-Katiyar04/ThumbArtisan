import { useRef, useState } from 'react';

export type UploadFormValues = {
  file: File;
  prompt: string;
  numThumbnails: number;
};

type UploadFormProps = {
  onGenerate: (values: UploadFormValues) => Promise<void>;
  isGenerating: boolean;
};

export default function UploadForm({ onGenerate, isGenerating }: UploadFormProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [numThumbnails, setNumThumbnails] = useState(3);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) return;
    await onGenerate({ file, prompt, numThumbnails });
  };

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-xl shadow-black/20">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">Create Thumbnails</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Upload your headshot and describe the thumbnail idea for your video.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <span className="text-sm font-medium text-zinc-300">Headshot Image</span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const selected = event.target.files?.[0];
              if (!selected) return;
              setFile(selected);
              setPreviewUrl(URL.createObjectURL(selected));
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full items-center justify-center rounded-lg border border-dashed border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-white"
          >
            {file ? 'Change image' : 'Choose image'}
          </button>
          {file && (
            <p className="text-xs text-zinc-400">
              Selected: <span className="text-zinc-200">{file.name}</span>
            </p>
          )}
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Headshot preview"
              className="mt-2 aspect-video w-full rounded-lg border border-zinc-700 object-cover"
            />
          )}
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-zinc-300">Prompt</span>
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            required
            rows={5}
            placeholder="e.g. shocked expression, bold text area on right, dramatic lighting, high CTR feel"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 outline-none ring-red-500/30 transition focus:border-red-500 focus:ring-2"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-zinc-300">Variations</span>
          <select
            value={numThumbnails}
            onChange={(event) => setNumThumbnails(Number(event.target.value))}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 outline-none ring-red-500/30 transition focus:border-red-500 focus:ring-2"
          >
            <option value={1}>1 variation</option>
            <option value={2}>2 variations</option>
            <option value={3}>3 variations</option>
          </select>
        </label>

        <button
          type="submit"
          disabled={isGenerating || !file || !prompt.trim()}
          className="inline-flex w-full items-center justify-center rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isGenerating ? 'Generating thumbnails...' : 'Generate thumbnails'}
        </button>
      </form>
    </section>
  );
}
