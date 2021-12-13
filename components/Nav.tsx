import { Box, Button, Flex, Heading, Stack, Text, Tooltip } from '@chakra-ui/react';
import Image from 'next/image';
import React, { Fragment, useContext } from 'react';
import AuthContext from '../stores/netlifyIdentityContext';

import { AiOutlineLogin as LoginIcon, AiOutlineLogout as Logout } from 'react-icons/ai';
import UserSettings from './UserSettings';
const Nav = () => {
  const { user, login, logout, authReady } = useContext(AuthContext);

  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      wrap="wrap"
      padding="1.5rem"
      bgGradient="linear(to-l,#313084, #831F3B)"
    >
      <Flex align="center" mr={5} gap={5}>
        <Box>
          <Image
            src="https://res.cloudinary.com/boar-images/image/upload/v1639182352/boar-coders-assets/boarcoders-tshirt_oshejd.png"
            alt="boar coders logo"
            width={80}
            height={80}
          />
        </Box>
        <Heading as="h1" size="lg" letterSpacing={'-.1rem'} color="whiteAlpha.900">
          Boar Coders Bingo
        </Heading>
      </Flex>
      <Stack align="center" direction="row" spacing={4}>
        {authReady && !user && (
          <Button onClick={login} leftIcon={<LoginIcon />} colorScheme="teal" variant="solid">
            Login
          </Button>
        )}
        {user && <UserSettings user={user} />}
        {user && (
          <Fragment>
            <Button onClick={logout} rightIcon={<Logout />} color="red.400" colorScheme="cyan" variant="outline">
              Logout
            </Button>
          </Fragment>
        )}
      </Stack>
    </Flex>
  );
};

export default Nav;
