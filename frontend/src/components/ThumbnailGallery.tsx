import ThumbnailCard from './ThumbnailCard';

type Thumbnail = {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
  tag: string;
  status: 'ready' | 'failed';
};

type ThumbnailGalleryProps = {
  items: Thumbnail[];
};

export default function ThumbnailGallery({ items }: ThumbnailGalleryProps) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl shadow-black/20">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Generated Thumbnails</h2>
        <span className="rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-xs text-zinc-300">
          {items.length} result{items.length === 1 ? '' : 's'}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-950/60 p-8 text-center">
          <p className="text-sm text-zinc-400">
            No thumbnails yet. Use the form to generate your first design.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {items.map((item) => (
            <ThumbnailCard
              key={item.id}
              title={item.title}
              imageUrl={item.imageUrl}
              description={item.description}
              tag={item.tag}
              status={item.status}
            />
          ))}
        </div>
      )}
    </section>
  );
}
