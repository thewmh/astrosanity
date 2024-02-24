import { defineConfig } from 'astro/config';
import { sanityIntegration } from "@sanity/astro";

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  integrations: [sanityIntegration({
    projectId: '7m8frgh6',
    dataset: 'production',
    apiVersion: '2023-02-08',
    useCdn: false
  }), tailwind()],
  image: {
    domains: ['cdn.sanity.io']
  }
});