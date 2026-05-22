import { Link } from 'react-router-dom';
import { PageSeo } from '@/lib/seo';

function Privacy() {
  return (
    <main className="flex w-full justify-center px-4 py-12 sm:px-6 lg:px-8">
      <PageSeo
        title="Privacy Policy | MapTheHeat"
        description="MapTheHeat Privacy Policy — how we collect, use, and protect your personal data in accordance with GDPR and applicable data protection law."
      />
      <div className="w-full max-w-3xl rounded-xl border border-app-border bg-app-card p-6 shadow-md sm:p-10">
        <h1 className="mb-2 text-3xl font-bold text-foreground">Privacy Policy</h1>
        <p className="mb-8 text-sm text-app-muted">Last updated: April 2026</p>

        <section className="mb-8">
          <h2 className="mb-2 text-xl font-semibold text-foreground">1. Who We Are</h2>
          <p className="text-app-muted">
            MapTheHeat is a community-driven platform for discovering and reviewing venues that
            serve spicy food. For the purposes of the General Data Protection Regulation (GDPR),
            MapTheHeat is the data controller responsible for your personal data. If you have any
            questions or requests regarding your data, please use our{' '}
            <Link to="/contact" className="text-primary underline">
              contact form
            </Link>
            .
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-xl font-semibold text-foreground">2. What Data We Collect</h2>
          <p className="mb-2 text-app-muted">We collect the following personal data:</p>
          <ul className="list-disc pl-6 text-app-muted">
            <li>
              <span className="font-medium">Account data</span> — your email address, display
              name, and avatar image when you register or sign in with Google.
            </li>
            <li>
              <span className="font-medium">Content you submit</span> — venue listings (including
              address and location coordinates), reviews, ratings, and photos you upload.
            </li>
            <li>
              <span className="font-medium">Usage data</span> — session tokens and authentication
              logs managed by our hosting provider, Supabase.
            </li>
          </ul>
          <p className="mt-3 text-app-muted">
            We do not use cookies for tracking or advertising, and we do not run any analytics
            tools on this site.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-xl font-semibold text-foreground">3. Why We Collect It (Legal Basis)</h2>
          <ul className="list-disc pl-6 text-app-muted">
            <li>
              <span className="font-medium">Contract performance</span> — to provide you with an
              account and allow you to submit venues and reviews.
            </li>
            <li>
              <span className="font-medium">Legitimate interests</span> — to maintain the security
              and integrity of the platform, and to display community-submitted content to other
              users.
            </li>
            <li>
              <span className="font-medium">Consent</span> — for optional features such as sharing
              content via Facebook Messenger or WhatsApp, which only occur when you actively
              initiate them.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-xl font-semibold text-foreground">4. Third-Party Services</h2>
          <p className="mb-3 text-app-muted">
            We use the following third-party services to operate the platform:
          </p>
          <ul className="list-disc pl-6 text-app-muted space-y-2">
            <li>
              <span className="font-medium">Supabase</span> — our database, authentication, and
              file storage provider. Your account data, submitted content, and uploaded images are
              stored on Supabase infrastructure. Supabase is GDPR-compliant and acts as a data
              processor on our behalf. See{' '}
              <a
                href="https://supabase.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Supabase's privacy policy
              </a>
              .
            </li>
            <li>
              <span className="font-medium">OpenStreetMap Nominatim</span> — used to convert
              addresses into map coordinates when you submit a venue. The address you enter is
              sent to Nominatim's public API. No personal account data is transmitted. See{' '}
              <a
                href="https://osmfoundation.org/wiki/Privacy_Policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                OSM's privacy policy
              </a>
              .
            </li>
            <li>
              <span className="font-medium">Esri ArcGIS</span> — provides the map tile images
              displayed on the map. Your browser requests tiles based on the area of the map you
              are viewing. No personal data is sent. See{' '}
              <a
                href="https://www.esri.com/en-us/privacy/privacy-statements/privacy-statement"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Esri's privacy policy
              </a>
              .
            </li>
            <li>
              <span className="font-medium">Facebook Messenger / WhatsApp</span> — only used if
              you explicitly choose to share a venue using those buttons. The venue URL and name
              are passed to the respective sharing service at that point.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-xl font-semibold text-foreground">5. How Long We Keep Your Data</h2>
          <p className="text-app-muted">
            Your data is retained for as long as your account is active. If you delete your
            account, your personal account data will be removed. Content you submitted (venues
            and reviews) may remain on the platform in anonymised or attributed form unless you
            specifically request its removal.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-xl font-semibold text-foreground">6. Your Rights Under GDPR</h2>
          <p className="mb-2 text-app-muted">As a user based in the EU you have the right to:</p>
          <ul className="list-disc pl-6 text-app-muted">
            <li><span className="font-medium">Access</span> — request a copy of the personal data we hold about you.</li>
            <li><span className="font-medium">Rectification</span> — ask us to correct inaccurate data.</li>
            <li><span className="font-medium">Erasure</span> — request deletion of your personal data ("right to be forgotten").</li>
            <li><span className="font-medium">Restriction</span> — ask us to limit how we use your data.</li>
            <li><span className="font-medium">Portability</span> — receive your data in a portable format.</li>
            <li><span className="font-medium">Objection</span> — object to processing based on legitimate interests.</li>
          </ul>
          <p className="mt-3 text-app-muted">
            To exercise any of these rights, please use our{' '}
            <Link to="/contact" className="text-primary underline">
              contact form
            </Link>
            . We will respond within 30 days. You also have the right to lodge a complaint with
            the Spanish data protection authority,{' '}
            <a
              href="https://www.aepd.es"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              AEPD (Agencia Española de Protección de Datos)
            </a>
            .
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-xl font-semibold text-foreground">7. Data Security</h2>
          <p className="text-app-muted">
            All data is transmitted over HTTPS. Authentication and data storage are handled by
            Supabase, which applies industry-standard security measures including encryption at
            rest and in transit.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-foreground">8. Changes to This Policy</h2>
          <p className="text-app-muted">
            We may update this policy from time to time. The date at the top of this page will
            reflect the most recent revision. Continued use of the site after changes constitutes
            acceptance of the updated policy.
          </p>
        </section>
      </div>
    </main>
  );
}

export default Privacy;
