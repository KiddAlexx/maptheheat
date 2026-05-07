import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import AdminLayout from '@/features/moderation/components/AdminLayout';
import AllProviders from 'tests/AllProviders';

function renderAdminLayout(initialPath = '/admin/moderation/reviews') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/admin/moderation" element={<AdminLayout />}>
          <Route path="venues" element={<h2>Venue queue</h2>} />
          <Route path="reviews" element={<h2>Review queue</h2>} />
          <Route path="images" element={<h2>Image queue</h2>} />
        </Route>
      </Routes>
    </MemoryRouter>,
    { wrapper: AllProviders }
  );
}

describe('AdminLayout', () => {
  it('renders moderation section tabs with the current tab marked active', () => {
    renderAdminLayout();

    expect(
      screen.getByRole('heading', { name: /admin console/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('navigation', { name: /moderation sections/i })
    ).toBeInTheDocument();

    expect(screen.getByRole('link', { name: /venues/i })).toHaveAttribute(
      'href',
      '/admin/moderation/venues'
    );
    expect(screen.getByRole('link', { name: /reviews/i })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(screen.getByRole('link', { name: /images/i })).toHaveAttribute(
      'href',
      '/admin/moderation/images'
    );
    expect(
      screen.getByRole('heading', { name: /review queue/i })
    ).toBeInTheDocument();
  });

  it('navigates between moderation tabs', async () => {
    const user = userEvent.setup();
    renderAdminLayout();

    await user.click(screen.getByRole('link', { name: /images/i }));

    expect(
      screen.getByRole('heading', { name: /image queue/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /images/i })).toHaveAttribute(
      'aria-current',
      'page'
    );
  });
});
