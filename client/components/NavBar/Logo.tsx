import { Box, Text } from '@chakra-ui/react';
import Image from 'next/image';
import NextLink from 'next/link';
import React from 'react';

const Logo = () => {
  return (
    <NextLink href={'/'} passHref shallow>
      <Box
        display={{ base: 'flex', md: 'none' }}
        alignItems="center"
        justifyContent={'center'}
        gap={2}
        cursor="pointer"
        flex={'auto'}
      >
        <Image
          src="https://res.cloudinary.com/boar-images/image/upload/v1639182352/boar-coders-assets/boarcoders-tshirt_oshejd.png"
          alt="boar coders logo"
          width={40}
          height={40}
        />
        <Text fontSize="x-small" fontWeight="bold">
          Boar Coders Bingo
        </Text>
      </Box>
    </NextLink>
  );
};

export { Logo };
