import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

const MODERATION_TABS = [
  { label: 'Venues', to: '/admin/moderation/venues' },
  { label: 'Reviews', to: '/admin/moderation/reviews' },
  { label: 'Images', to: '/admin/moderation/images' },
];

function AdminLayout() {
  const { pathname } = useLocation();

  return (
    <main className="flex h-full flex-col overflow-hidden bg-zinc-50 text-gray-900">
      <header className="border-b border-zinc-200 bg-white px-4 py-4 shadow-sm sm:px-6">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-normal text-primary-600">
              Internal moderation
            </p>
            <h1 className="text-2xl font-semibold">Admin console</h1>
          </div>

          <nav aria-label="Moderation sections">
            <ul className="flex flex-wrap gap-2">
              {MODERATION_TABS.map((tab) => (
                <li key={tab.to}>
                  <NavLink
                    to={tab.to}
                    className={({ isActive }) =>
                      clsx(
                        'inline-flex h-10 items-center rounded-full border px-4 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                        isActive
                          ? 'border-primary-500 bg-primary-100 text-primary-700'
                          : 'border-zinc-200 bg-white text-zinc-700 hover:border-primary-300 hover:text-primary-700'
                      )
                    }
                  >
                    {tab.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <section className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        <div className="mx-auto w-full max-w-7xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}

export default AdminLayout;
