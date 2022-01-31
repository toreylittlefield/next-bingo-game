import { NextPage } from 'next';
import React, { useContext, useEffect, useState } from 'react';
import AuthContext from '../stores/netlifyIdentityContext';
import netlifyIdentity from 'netlify-identity-widget';
import Router from 'next/router';
import { Center, VStack, Spinner, Text, Flex, Container } from '@chakra-ui/react';

const Rooms: NextPage = () => {
  const { user, authReady } = useContext(AuthContext);
  const [transition, setTransition] = useState(false);
  useEffect(() => {
    // if (!authReady) return;
    let timerID = setTimeout(() => {
      if (netlifyIdentity.currentUser() === null || !user?.token?.access_token) {
        Router.push('/');
        netlifyIdentity.open();
        return;
      } else if (netlifyIdentity.currentUser() != null && user.token.access_token != null) {
        setTransition(true);
      }
    }, 300);
    return () => {
      if (timerID) clearTimeout(timerID);
    };
  }, [user, authReady]);

  if ((authReady && !user?.token?.access_token) || !transition)
    return (
      <Center h={'100vh'}>
        <VStack>
          <Text fontSize="3xl">Loading User Profile</Text>
          <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" />
        </VStack>
      </Center>
    );
  else if (transition && user) {
    return (
      <Flex>
        <Container>
          <Text>Rooms</Text>
        </Container>
      </Flex>
    );
  } else {
    return null;
  }
};

export default Rooms;
