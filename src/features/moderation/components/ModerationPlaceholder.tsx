interface ModerationPlaceholderProps {
  title: string;
  description: string;
}

function ModerationPlaceholder({
  title,
  description,
}: ModerationPlaceholderProps) {
  return (
    <section className="rounded-xl border border-app-border bg-app-card p-5 text-sm shadow-md">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm text-app-muted">{description}</p>
    </section>
  );
}

export default ModerationPlaceholder;
