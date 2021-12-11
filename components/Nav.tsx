import { Button, Flex, Heading, Stack } from '@chakra-ui/react';
import Link from 'next/link';
import Image from 'next/image';
import React, { useContext } from 'react';
import AuthContext from '../stores/netlifyIdentityContext';

import { AiOutlineMail as EmailIcon } from 'react-icons/ai';
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
      color="whit(to-r, greee"
    >
      <Flex align="center" mr={5} gap={5}>
        <Image
          src="https://res.cloudinary.com/boar-images/image/upload/v1639182352/boar-coders-assets/boarcoders-tshirt_oshejd.png"
          alt="boar coders logo"
          width={80}
          height={80}
        />
        <Heading as="h1" size="lg" letterSpacing={'-.1rem'} color="whiteAlpha.900">
          Boar Coders Bingo
        </Heading>
      </Flex>
      <Stack direction="row" spacing={4}>
        <Button leftIcon={<EmailIcon />} colorScheme="teal" variant="solid">
          Email
        </Button>
        <Button rightIcon={<EmailIcon />} colorScheme="teal" variant="outline">
          Call us
        </Button>
      </Stack>
      {authReady && (
        <ul>
          <li>
            <Link href="/">
              <a>Home</a>
            </Link>
          </li>
          {!user && (
            <li onClick={login} className="btn">
              Login/Signup
            </li>
          )}
          {user && <li>{user.email}</li>}
          {user && (
            <li onClick={logout} className="btn">
              Logout
            </li>
          )}
        </ul>
      )}
    </Flex>
  );
};

export default Nav;
