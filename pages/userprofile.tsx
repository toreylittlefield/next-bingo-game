import { NextPage } from 'next';
import React, { useContext, useEffect } from 'react';
import UserSettings from '../components/UserSettings';
import AuthContext from '../stores/netlifyIdentityContext';
import netlifyIdentity from 'netlify-identity-widget';
import Router from 'next/router';
import { Center, VStack, Spinner, Text } from '@chakra-ui/react';

const UserProfile: NextPage = () => {
  const { user, authReady } = useContext(AuthContext);
  useEffect(() => {
    if (!authReady) return;
    if (netlifyIdentity.currentUser() === null || !user?.token?.access_token) {
      setTimeout(() => {
        Router.push('/');
      }, 2000);
    }
  }, [user, authReady]);

  if (authReady)
    return (
      <Center h={'100vh'}>
        <VStack>
          <Text fontSize="3xl">Loading User Profile</Text>
          <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" />
        </VStack>
      </Center>
    );
  else {
    return <UserSettings user={user} />;
  }
};

export default UserProfile;
