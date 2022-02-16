import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { AuthContextProvider } from '../stores/netlifyIdentityContext';
import Nav from '../components/Nav';
import { ChakraProvider, CSSReset } from '@chakra-ui/react';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <CSSReset />
      <AuthContextProvider>
        <Nav />
        <Component {...pageProps} />
      </AuthContextProvider>
    </ChakraProvider>
  );
}

export default MyApp;
