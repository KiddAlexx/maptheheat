import { Link } from 'react-router-dom';
import { PageSeo } from '@/lib/seo';

function Terms() {
  return (
    <main className="flex w-full justify-center px-4 py-12 sm:px-6 lg:px-8">
      <PageSeo
        title="Terms of Service | MapTheHeat"
        description="Read the MapTheHeat Terms of Service. Understand your rights and responsibilities when using our community-driven spicy food venue platform."
      />
      <div className="w-full max-w-3xl rounded-xl border border-app-border bg-app-card p-6 shadow-md sm:p-10">
        <h1 className="mb-2 text-3xl font-bold text-foreground">Terms of Service</h1>
        <p className="mb-8 text-sm text-app-muted">Last updated: June 2026</p>

        <section className="mb-8">
          <h2 className="mb-2 text-xl font-semibold text-foreground">1. User-Generated Content</h2>
          <p className="text-app-muted">
            All venue listings and reviews on MapTheHeat are submitted by members of the community.
            We do not independently verify the accuracy, completeness, or reliability of any venue
            information or review. Reviews represent the personal opinions of individual users only
            and do not reflect the views of MapTheHeat.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-xl font-semibold text-foreground">2. No Guarantees</h2>
          <p className="text-app-muted">
            Venue details such as opening hours, menus, and contact information may be out of date.
            We make no guarantees regarding the accuracy of any content on this site. Always
            verify important information directly with the venue before visiting.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-xl font-semibold text-foreground">3. Content Moderation</h2>
          <p className="text-app-muted">
            MapTheHeat reserves the right to remove, edit, or hide any venue listing, review,
            photo, or user account at any time and without notice, at our sole discretion. This
            includes content that is inaccurate, inappropriate, spam, or otherwise in violation
            of community standards.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-xl font-semibold text-foreground">4. Your Responsibilities</h2>
          <p className="text-app-muted">
            By submitting a venue or review you confirm that:
          </p>
          <ul className="mt-2 list-disc pl-6 text-app-muted">
            <li>The information you provide is accurate and honest to the best of your knowledge.</li>
            <li>You are not submitting spam, fake reviews, or content intended to mislead others.</li>
            <li>
              You own, or have permission to use, any photos you upload, and they do not infringe
              anyone else's copyright. For example, do not upload images copied from other websites
              or listings such as Google.
            </li>
            <li>
              You grant MapTheHeat a worldwide, royalty-free, non-exclusive licence to store,
              display, distribute, aggregate, and sublicense (to infrastructure providers such as
              our hosting and CDN services) any content you submit — including venue listings,
              reviews, ratings, and photos — for the purpose of operating and promoting the
              platform. You retain ownership of content you submit and may request its removal via
              our{' '}
              <Link to="/contact" className="text-primary underline">
                contact form
              </Link>
              .
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-xl font-semibold text-foreground">5. Limitation of Liability</h2>
          <p className="text-app-muted">
            MapTheHeat is not liable for any decisions you make based on content found on this
            site, including dining choices, health outcomes, or any other consequences arising
            from reliance on user-submitted information.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-xl font-semibold text-foreground">6. Changes to These Terms</h2>
          <p className="text-app-muted">
            We may update these terms at any time. Continued use of the site after any changes
            constitutes your acceptance of the updated terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-xl font-semibold text-foreground">7. Privacy & Personal Data</h2>
          <p className="text-app-muted">
            Your use of MapTheHeat is also governed by our{' '}
            <Link to="/privacy" className="text-primary underline">
              Privacy Policy
            </Link>
            , which explains what personal data we collect, why, and your rights under GDPR.
          </p>
          <p className="mt-3 text-app-muted">
            If you choose to sign in with Google, we only access your name and email address to
            create and secure your account. We do not request access to your Google Drive, Gmail,
            contacts, or any other Google services. Your data is never sold or shared with third
            parties for marketing purposes.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-foreground">8. Contact</h2>
          <p className="text-app-muted">
            If you have any questions about these terms or wish to report content, please use our{' '}
            <Link to="/contact" className="text-primary underline">
              contact form
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  );
}

export default Terms;
