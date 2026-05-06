import { ReactNode } from 'react';
import { Button } from '@heroui/button';
import { useUser } from '@/features/authentication/hooks/useUser';
import { useModalContext } from '@/context/ModalContext';
import LoaderSpinner from '@/ui/LoaderSpinner';
import { useIsAdmin } from '../hooks/useIsAdmin';

interface AdminRouteProps {
  children: ReactNode;
}

interface AdminAccessMessageProps {
  title: string;
  message: string;
  action?: ReactNode;
}

function AdminAccessMessage({
  title,
  message,
  action,
}: AdminAccessMessageProps) {
  return (
    <main className="flex min-h-0 flex-1 items-center justify-center bg-zinc-50 px-4 py-10">
      <section
        className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 text-center text-sm shadow-md"
        aria-labelledby="admin-access-title"
      >
        <h1 id="admin-access-title" className="text-2xl font-semibold">
          {title}
        </h1>
        <p className="mt-3 text-sm text-zinc-600">{message}</p>
        {action && <div className="mt-5">{action}</div>}
      </section>
    </main>
  );
}

function AdminRoute({ children }: AdminRouteProps) {
  const { isPending: isUserPending, isAuthenticated } = useUser();
  const { openModal } = useModalContext();
  const {
    error,
    isAdmin,
    isPending: isAdminPending,
  } = useIsAdmin(isAuthenticated);

  function handleSignIn() {
    openModal('login');
  }

  if (isUserPending) return <LoaderSpinner message="Checking session" />;

  if (!isAuthenticated) {
    return (
      <AdminAccessMessage
        title="Sign in required"
        message="Use an admin account to access moderation tools."
        action={
          <Button
            size="sm"
            radius="full"
            onPress={handleSignIn}
            className="h-9 min-w-28 bg-success-300 text-sm font-medium text-success-foreground"
          >
            Sign In
          </Button>
        }
      />
    );
  }

  if (isAdminPending) {
    return <LoaderSpinner message="Checking admin access" />;
  }

  if (error || !isAdmin) {
    return (
      <AdminAccessMessage
        title="Access denied"
        message="Your account does not have permission to access moderation tools."
      />
    );
  }

  return children;
}

export default AdminRoute;
