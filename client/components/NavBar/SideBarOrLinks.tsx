import { Box, BoxProps, CloseButton, Flex, Text, useColorModeValue } from '@chakra-ui/react';
import Image from 'next/image';
import NextLink from 'next/link';
import { LinkItems } from './LinkItems';
import { NavItem } from './NavItem';

interface SidebarProps extends BoxProps {
  onClose: () => void;
}

const SideBarOrLinks = ({ onClose, ...rest }: SidebarProps) => {
  return (
    <Box
      transition="3s ease"
      borderRight="1px"
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      w={{ base: 'xs', lg: 60 }}
      pos="fixed"
      h="full"
      {...rest}
    >
      <Flex h="28" alignItems="center" mx="8" gap={{ base: '0', md: 5 }} justifyContent="space-between">
        <NextLink href={'/'} passHref shallow>
          <Box w={{ base: '30%', md: '100%', lg: 'auto' }} _hover={{ bg: 'whiteAlpha.500' }} cursor="pointer">
            <Image
              src="https://res.cloudinary.com/boar-images/image/upload/v1639182352/boar-coders-assets/boarcoders-tshirt_oshejd.png"
              alt="boar coders logo"
              width={80}
              height={80}
            />
          </Box>
        </NextLink>
        <Text
          fontWeight="bold"
          fontSize={{ base: 'md', md: 'sm', lg: 'lg' }}
          letterSpacing={{ base: '0rem', lg: '-.1rem' }}
        >
          Boar Coders Bingo
        </Text>
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>
      <Flex
        display={{ base: 'block', md: 'flex' }}
        h={{ base: '', lg: 'auto' }}
        alignItems="center"
        justifyContent="space-evenly"
        flexWrap={'wrap'}
        flex="auto"
      >
        {LinkItems.map((link) => (
          <NavItem key={link.name} href={link.href} icon={link.icon}>
            {link.name}
          </NavItem>
        ))}
      </Flex>
    </Box>
  );
};

export { SideBarOrLinks };

