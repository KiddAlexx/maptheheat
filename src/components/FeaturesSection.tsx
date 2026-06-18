import { Icon } from '@iconify/react';

const features = [
  {
    icon: 'lucide:map-pin',
    title: 'Discover Venues',
    description:
      'Browse an interactive map or scrollable list to find restaurants and shops serving spicy food in cities around the world.',
  },
  {
    icon: 'lucide:flame',
    title: 'Community Reviews',
    description:
      'Read honest heat ratings and quality scores from real people who live for the burn.',
  },
  {
    icon: 'solar:pen-linear',
    title: 'Add & Rate',
    description:
      'Sign in, including with Google, to submit new venues, upload photos, and leave your own reviews with heat ratings.',
  },
];

function FeaturesSection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-6 pb-16 pt-4 ">
      <div className="mb-8 ml-2 max-w-2xl">
        <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground">
          What is MapTheHeat?
        </h2>
        <p className="text-base leading-relaxed text-app-muted">
          MapTheHeat is a community-driven platform for discovering and sharing
          venues that serve spicy food. Browse an interactive map, read heat
          ratings left by fellow spice-lovers, and contribute your own reviews,
          all in one place.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {features.map(({ icon, title, description }) => (
          <div
            key={title}
            className="rounded-2xl border border-primary-100/80 bg-app-card/90 p-5 shadow-sm backdrop-blur-sm dark:border-zinc-700/60"
          >
            <Icon
              icon={icon}
              aria-hidden="true"
              className="text-primary-500 dark:text-primary-400"
              width={28}
              height={28}
            />
            <h3 className="mt-3 font-semibold text-foreground">{title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-app-muted">
              {description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default FeaturesSection;
