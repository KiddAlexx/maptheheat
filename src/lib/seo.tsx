import { Helmet } from 'react-helmet-async';

const SITE_OG_IMAGE = `${import.meta.env.VITE_SITE_URL ?? ''}/og-image.png`;

interface PageSeoProps {
  title: string;
  description: string;
  ogImage?: string;
}

export function PageSeo({ title, description, ogImage }: PageSeoProps) {
  const image = ogImage ?? SITE_OG_IMAGE;
  const url = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      {url && <meta property="og:url" content={url} />}
      <meta property="og:type" content="website" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
