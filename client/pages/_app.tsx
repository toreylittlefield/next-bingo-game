import { ChakraProvider, CSSReset } from '@chakra-ui/react';
import type { AppProps } from 'next/app';
import NavigationBar from '../components/NavBar/NavBar';
import { AuthContextProvider } from '../stores/netlifyIdentityContext';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <CSSReset />
      <AuthContextProvider>
        {/* <Nav /> */}
        <NavigationBar />
        <Component {...pageProps} />
      </AuthContextProvider>
    </ChakraProvider>
  );
}

export default MyApp;
