import { NextPage } from 'next';
import React, { useContext, useEffect, useState } from 'react';
import AuthContext from '../stores/netlifyIdentityContext';
import netlifyIdentity from 'netlify-identity-widget';
import { Center, VStack, Spinner, Text } from '@chakra-ui/react';
import Router from 'next/router';

const Login: NextPage = () => {
  const { user, authReady } = useContext(AuthContext);
  const [transition, setTransition] = useState(false);

  useEffect(() => {
    // if (!authReady) return;
    let timerID = setTimeout(() => {
      if (netlifyIdentity.currentUser() != null && user?.token?.access_token != null) {
        Router.push('/');
        setTransition(true);
      }
      netlifyIdentity.open();
    }, 300);
    return () => {
      if (timerID) clearTimeout(timerID);
    };
  }, [user, authReady]);

  if ((authReady && !user?.token?.access_token) || !transition)
    return (
      <Center h={'100vh'}>
        <VStack>
          <Text fontSize="3xl">Logging In</Text>
          <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" />
        </VStack>
      </Center>
    );
  else if (transition && user) {
    // return <UserSettings user={user} />;
    return null;
  } else {
    return null;
  }
};

export default Login;
