import { defineConfig } from 'sanity';

const config = defineConfig({
  projectId: 'dakigera', // Replace with your Sanity project ID
  dataset: 'production', // Replace with your Sanity dataset (usually "production")
  apiVersion: '2023-05-03', // use current UTC date - YYYY-MM-DD
  useCdn: process.env.NODE_ENV === 'production', // Enable CDN in production
});

export default config;