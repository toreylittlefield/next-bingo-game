import { Box, BoxProps, Flex, IconButton, Text, useColorModeValue } from '@chakra-ui/react';
import Image from 'next/image';
import NextLink from 'next/link';
import { AiOutlineClose } from 'react-icons/ai';
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
      w={{ base: 'full', lg: 60 }}
      pos="fixed"
      h="full"
      display={{ base: 'flex', md: 'block' }}
      flexDir={{ base: 'column', md: 'row' }}
      justifyContent={{ base: 'space-between', md: 'center' }}
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
          color={'whiteAlpha.800'}
          fontSize={{ base: 'md', md: 'sm', lg: 'lg' }}
          letterSpacing={{ base: '0rem', lg: '-.1rem' }}
        >
          Boar Coders Bingo
        </Text>
      </Flex>
      <Flex
        display={{ base: 'flex', md: 'flex' }}
        h={{ base: undefined, md: undefined, lg: 'auto' }}
        alignItems="center"
        justifyContent={{ base: 'center', md: 'space-evenly' }}
        alignContent={{ base: 'center' }}
        flexWrap={'wrap'}
        py={{ base: 4, md: 0 }}
        pr={{ base: 0, md: 3 }}
        gap={{ base: 6, md: 0 }}
        flexBasis={{ base: undefined, md: '60%' }}
      >
        {LinkItems.map((link) => (
          <NavItem key={link.name} href={link.href} icon={link.icon}>
            {link.name}
          </NavItem>
        ))}
        <Box width={'full'} display={{ base: 'grid', md: 'none' }} placeContent={'center'}>
          <IconButton
            aria-label="Close Drawer"
            display={{ base: 'flex', md: 'none' }}
            size="lg"
            onClick={onClose}
            icon={<AiOutlineClose size={'75%'} />}
            isRound
            color={'whiteAlpha.800'}
            variant="outline"
          />
        </Box>
      </Flex>
    </Box>
  );
};

export { SideBarOrLinks };
