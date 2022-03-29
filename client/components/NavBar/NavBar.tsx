import {
  Box,
  Button,
  Drawer,
  DrawerContent,
  Flex,
  FlexProps,
  HStack,
  IconButton,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import React, { Fragment, useContext } from 'react';
import { AiOutlineLogin as LoginIcon, AiOutlineLogout as Logout } from 'react-icons/ai';
import { FiMenu } from 'react-icons/fi';
import AuthContext from '../../stores/netlifyIdentityContext';
import { Logo } from './Logo';
import { SideBarOrLinks } from './SideBarOrLinks';
import { UserMenu } from './UserMenu';

export default function NavBar() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box position={{ base: 'fixed', md: 'static' }} bottom={{ base: 0 }} width={{ base: '100%', md: 'full' }}>
      {/* Sliding Drawer On Mobile Or Links On Medium Up Screens */}
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
        closeOnEsc
      >
        <DrawerContent
          bg={'whiteAlpha.50'}
          bgGradient="linear(to-l,#313084be, #831f3bbe)"
          backdropFilter={'saturate(10%) blur(3px)'}
        >
          <SideBarOrLinks onClose={onClose} />
        </DrawerContent>
      </Drawer>

      <NavigationBar onOpen={onOpen} onClose={onClose} />
    </Box>
  );
}

interface NavigationBarProps extends FlexProps {
  onOpen: () => void;
  onClose: () => void;
}
const NavigationBar = ({ onOpen, onClose, ...rest }: NavigationBarProps) => {
  const { user, login, logout } = useContext(AuthContext);
  return (
    <Flex
      ml={{ base: 0, lg: 0 }}
      pr={{ base: 4, lg: 4 }}
      pl={{ base: 4, lg: 0 }}
      py={{ base: 4, md: 3, lg: 2 }}
      alignItems="center"
      color="whiteAlpha.900"
      bgGradient="linear(to-l,#313084, #831F3B)"
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
      justifyContent={{ base: 'space-between', lg: 'flex-end' }}
      {...rest}
    >
      <SideBarOrLinks
        onClose={() => onClose}
        display={{ base: 'none', md: 'flex' }}
        borderRight={{ base: 'none', lg: 'none' }}
        position="static"
        flex={'auto'}
        alignItems="center"
        justifyContent={'space-between'}
      />

      {/* Mobile Logo Only */}
      <Logo />

      <IconButton
        display={{ base: 'flex', md: 'none' }}
        onClick={onOpen}
        variant="outline"
        aria-label="open menu"
        size={'md'}
        icon={<FiMenu />}
      />

      <HStack spacing={{ base: '0', md: '6' }} flexDirection={{ base: 'row', md: 'column', lg: 'row' }}>
        {!user && (
          <Button onClick={login} leftIcon={<LoginIcon />} colorScheme="teal" variant="solid">
            Login
          </Button>
        )}

        {user ? <UserMenu {...user.faunaUser} userEmail={user.email} /> : null}
        {user && (
          <Fragment>
            <Button
              onClick={logout}
              rightIcon={<Logout />}
              display={{ base: 'none', md: 'block' }}
              fontSize={{ md: 'sm', lg: 'md' }}
              alignSelf={{ md: 'flex-end', lg: 'inherit' }}
              size={'md'}
              color="red.400"
              colorScheme="cyan"
              variant="outline"
            >
              Logout
            </Button>
          </Fragment>
        )}
      </HStack>
    </Flex>
  );
};
