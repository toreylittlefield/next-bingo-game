import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { AuthContextProvider } from '../stores/netlifyIdentityContext';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthContextProvider>
      <Component {...pageProps} />
    </AuthContextProvider>
  );
}

export default MyApp;
