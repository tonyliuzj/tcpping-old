// src/pages/_app.tsx
import type { AppProps } from 'next/app'
import '../styles/globals.css'    // make sure this path points at your globals.css

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
