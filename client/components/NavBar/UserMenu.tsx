import {
  Avatar,
  Box,
  Flex,
  HStack,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
  useBreakpointValue,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import React from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { LoggedInUser } from '../../types/types';

const UserMenu = ({ name, alias, icon, lastUpdated, userEmail }: LoggedInUser['faunaUser'] & { userEmail: string }) => {
  const avatarSize = useBreakpointValue({ base: 'sm', lg: 'md' });
  return (
    <Flex alignItems={'center'}>
      <Menu>
        <MenuButton py={2} transition="all 0.3s" _focus={{ boxShadow: 'none' }}>
          {name ? (
            <HStack>
              <Avatar size={avatarSize} src={icon} />
              <VStack display={{ base: 'none', md: 'flex' }} alignItems="flex-start" spacing="1px" ml="2">
                <Text fontSize={{ base: 'sm', md: 'xx-small', lg: 'md' }}>{alias}</Text>
                <Text fontSize={{ base: 'xs', md: 'xx-small', lg: 'sm' }} color="whiteAlpha.600">
                  {userEmail}
                </Text>
              </VStack>
              <Box display={{ base: 'none', lg: 'flex' }}>
                <FiChevronDown />
              </Box>
            </HStack>
          ) : null}
        </MenuButton>
        <MenuList
          bg={useColorModeValue('white', 'gray.900')}
          color={'ButtonText'}
          borderColor={useColorModeValue('gray.200', 'gray.700')}
        >
          <NextLink replace href={`userprofile/me/${encodeURIComponent(name)}`}>
            <MenuItem>Profile</MenuItem>
          </NextLink>
          <MenuItem>Settings</MenuItem>
          <MenuItem>Billing</MenuItem>
          <MenuDivider />
          <MenuItem>Sign out</MenuItem>
        </MenuList>
      </Menu>
    </Flex>
  );
};

export { UserMenu };
