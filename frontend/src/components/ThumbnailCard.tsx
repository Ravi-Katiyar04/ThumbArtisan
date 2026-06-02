type ThumbnailCardProps = {
  title: string;
  imageUrl: string;
  description: string;
  tag: string;
  status?: 'ready' | 'failed';
};

export default function ThumbnailCard({
  title,
  imageUrl,
  description,
  tag,
  status = 'ready',
}: ThumbnailCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-xl">
      <div className="relative aspect-video w-full bg-zinc-800">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-zinc-400">
            Image unavailable
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-red-600/90 px-3 py-1 text-xs font-semibold text-white">
          {tag}
        </span>
        <span
          className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${
            status === 'ready'
              ? 'bg-emerald-500/90 text-white'
              : 'bg-amber-500/90 text-zinc-900'
          }`}
        >
          {status === 'ready' ? 'Ready' : 'Failed'}
        </span>
      </div>
      <div className="space-y-2 p-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-sm text-zinc-300">{description}</p>
      </div>
    </article>
  );
}
