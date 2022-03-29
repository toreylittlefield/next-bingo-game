import { Box, ChakraProvider, CSSReset } from '@chakra-ui/react';
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
        <Box mb={{ base: 12, md: 0 }}>
          <NavigationBar />
          <Component {...pageProps} />
        </Box>
      </AuthContextProvider>
    </ChakraProvider>
  );
}

export default MyApp;
