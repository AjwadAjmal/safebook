import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Safebook',
    short_name: 'Safebook',
    description: 'Dein privates Haushaltsbuch',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0070f3',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
