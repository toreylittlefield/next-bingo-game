import { Box, Button, Flex, Heading, Stack, Text, Tooltip } from '@chakra-ui/react';
import Image from 'next/image';
import React, { Fragment, useContext } from 'react';
import AuthContext from '../stores/netlifyIdentityContext';

import { AiOutlineLogin as LoginIcon, AiOutlineLogout as Logout } from 'react-icons/ai';
import SettingsButton from './SettingsButton';
import NextLink from 'next/link';

const Nav = () => {
  const { user, login, logout, authReady } = useContext(AuthContext);

  return (
    <Flex
      as="nav"
      align={{ base: 'flex-end', md: 'center' }}
      justify="space-between"
      wrap={{ base: 'nowrap', md: 'wrap' }}
      padding="1.5rem"
      bgGradient="linear(to-l,#313084, #831F3B)"
    >
      <Flex
        align={{ base: 'flex-start', md: 'center' }}
        flexDirection={{ base: 'column', md: 'row' }}
        mr={5}
        gap={{ base: '0', md: 5 }}
      >
        <NextLink href={'/'} passHref shallow>
          <Box w={{ base: '40%', md: 'auto' }} cursor="pointer">
            <Image
              src="/boar-coders-assets/boarcoders-tshirt_oshejd.png"
              alt="boar coders logo"
              width={80}
              height={80}
            />
          </Box>
        </NextLink>
        <Heading
          as="h1"
          fontSize={{ base: 'md', md: 'lg' }}
          letterSpacing={{ base: '0rem', md: '-.1rem' }}
          color="whiteAlpha.900"
        >
          Boar Coders Bingo
        </Heading>
      </Flex>
      <Stack align={{ base: 'flex-end', md: 'center' }} direction={{ base: 'column', md: 'row' }} spacing={4}>
        {!user && (
          <Button onClick={login} leftIcon={<LoginIcon />} colorScheme="teal" variant="solid">
            Login
          </Button>
        )}
        {user && <SettingsButton user={user} />}
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
