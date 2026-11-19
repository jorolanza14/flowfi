import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Flowfi — Daily Pocket & Cashflow Tracker',
    short_name: 'Flowfi',
    description: '3-tap daily spending pace and multi-wallet tracker for GCash, Maya, BPI & Cash.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFF9EC',
    theme_color: '#FFF9EC',
    orientation: 'portrait',
    icons: [
      { src: '/icon', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  };
}
