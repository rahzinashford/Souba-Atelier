import { useEffect } from 'react';

const BRAND_NAME = 'Souba Atelier';

export const useSEO = ({ title, description }) => {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${BRAND_NAME}` : BRAND_NAME;
    document.title = fullTitle;

    let metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && description) {
      metaDescription.setAttribute('content', description);
    }

    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', fullTitle);
    }

    let ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription && description) {
      ogDescription.setAttribute('content', description);
    }

    let twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute('content', fullTitle);
    }

    let twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription && description) {
      twitterDescription.setAttribute('content', description);
    }

    return () => {
      document.title = BRAND_NAME;
    };
  }, [title, description]);
};

export const BRAND = BRAND_NAME;

export default useSEO;
