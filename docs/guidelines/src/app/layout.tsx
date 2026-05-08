import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Git Guidelines · Eleos',
  description: 'Internal handbook: Git repository guidelines for Designers, Sales, and Developers at Eleos Health',
  viewport: 'width=device-width, initial-scale=1',
  robots: 'noindex, nofollow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-voice="signature" data-mood="clinic" data-warmth="humane">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&family=Source+Serif+4:ital,wght@0,300;0,600;1,300;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-eleos-paper text-eleos-ink antialiased">{children}</body>
    </html>
  )
}
