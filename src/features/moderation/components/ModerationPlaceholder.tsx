interface ModerationPlaceholderProps {
  title: string;
  description: string;
}

function ModerationPlaceholder({
  title,
  description,
}: ModerationPlaceholderProps) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 text-sm shadow-md">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm text-zinc-600">{description}</p>
    </section>
  );
}

export default ModerationPlaceholder;
