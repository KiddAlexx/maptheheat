import { useId } from 'react';
import { Link } from 'react-router-dom';

interface ModerationDetailMessageProps {
  backHref: string;
  backLabel: string;
  message: string;
  title: string;
}

function ModerationDetailMessage({
  backHref,
  backLabel,
  message,
  title,
}: ModerationDetailMessageProps) {
  const titleId = useId();

  return (
    <section
      role="alert"
      className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm shadow-md"
      aria-labelledby={titleId}
    >
      <h2 id={titleId} className="text-xl font-semibold">
        {title}
      </h2>
      <p className="mt-2 text-zinc-600">{message}</p>
      <Link
        to={backHref}
        className="mt-5 inline-flex min-h-10 items-center justify-center rounded-full bg-primary-100 px-4 text-sm font-medium text-primary-700 hover:bg-primary-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
      >
        {backLabel}
      </Link>
    </section>
  );
}

export default ModerationDetailMessage;
