import { Link } from 'react-router-dom';

function Terms() {
  return (
    <main className="flex w-full justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl rounded-xl border border-gray-200 bg-white p-6 shadow-md sm:p-10">
        <h1 className="mb-2 text-3xl font-bold text-gray-800">Terms of Service</h1>
        <p className="mb-8 text-sm text-gray-400">Last updated: April 2026</p>

        <section className="mb-8">
          <h2 className="mb-2 text-xl font-semibold text-gray-700">1. User-Generated Content</h2>
          <p className="text-gray-600">
            All venue listings and reviews on MapTheHeat are submitted by members of the community.
            We do not independently verify the accuracy, completeness, or reliability of any venue
            information or review. Reviews represent the personal opinions of individual users only
            and do not reflect the views of MapTheHeat.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-xl font-semibold text-gray-700">2. No Guarantees</h2>
          <p className="text-gray-600">
            Venue details such as opening hours, menus, and contact information may be out of date.
            We make no guarantees regarding the accuracy of any content on this site. Always
            verify important information directly with the venue before visiting.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-xl font-semibold text-gray-700">3. Content Moderation</h2>
          <p className="text-gray-600">
            MapTheHeat reserves the right to remove, edit, or hide any venue listing, review,
            photo, or user account at any time and without notice, at our sole discretion. This
            includes content that is inaccurate, inappropriate, spam, or otherwise in violation
            of community standards.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-xl font-semibold text-gray-700">4. Your Responsibilities</h2>
          <p className="text-gray-600">
            By submitting a venue or review you confirm that:
          </p>
          <ul className="mt-2 list-disc pl-6 text-gray-600">
            <li>The information you provide is accurate and honest to the best of your knowledge.</li>
            <li>You are not submitting spam, fake reviews, or content intended to mislead others.</li>
            <li>You grant MapTheHeat a non-exclusive licence to display and use your submitted content on the platform.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-xl font-semibold text-gray-700">5. Limitation of Liability</h2>
          <p className="text-gray-600">
            MapTheHeat is not liable for any decisions you make based on content found on this
            site, including dining choices, health outcomes, or any other consequences arising
            from reliance on user-submitted information.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-xl font-semibold text-gray-700">6. Changes to These Terms</h2>
          <p className="text-gray-600">
            We may update these terms at any time. Continued use of the site after any changes
            constitutes your acceptance of the updated terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-xl font-semibold text-gray-700">7. Privacy & Personal Data</h2>
          <p className="text-gray-600">
            Your use of MapTheHeat is also governed by our{' '}
            <Link to="/privacy" className="text-primary underline">
              Privacy Policy
            </Link>
            , which explains what personal data we collect, why, and your rights under GDPR.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-gray-700">8. Contact</h2>
          <p className="text-gray-600">
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
