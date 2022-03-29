import { Flex, FlexProps, Icon, Link } from '@chakra-ui/react';
import NextLink from 'next/link';
import { ReactText } from 'react';
import { IconType } from 'react-icons';

interface NavItemProps extends FlexProps {
  icon: IconType;
  href: string;
  children: ReactText;
}
const NavItem = ({ icon, href, children, ...rest }: NavItemProps) => {
  return (
    <NextLink href={href} passHref>
      <Link style={{ textDecoration: 'none' }} _focus={{ boxShadow: 'none' }}>
        <Flex
          minWidth={112}
          align="center"
          p="4"
          mx="4"
          borderRadius="lg"
          role="group"
          cursor="pointer"
          _hover={{
            bg: 'whiteAlpha.300',
            color: { base: 'whiteAlpha.900', md: 'whiteAlpha.900' },
          }}
          color={{ base: 'whiteAlpha.900', md: 'whiteAlpha.800' }}
          {...rest}
        >
          {icon && (
            <Icon
              mr="4"
              fontSize={{ base: 20, lg: 18, xl: 24 }}
              _groupHover={{
                color: { base: 'whiteAlpha.900', md: 'whiteAlpha.900' },
              }}
              as={icon}
            />
          )}
          {children}
        </Flex>
      </Link>
    </NextLink>
  );
};

export { NavItem };
