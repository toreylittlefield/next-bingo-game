import { Center, VStack, Spinner, Text, CenterProps, TextProps, SpinnerProps } from '@chakra-ui/react';
import React, { ReactNode } from 'react';

type LoadingSpinnerProps = {
  centerProps?: CenterProps;
  textProps?: TextProps;
  spinnerProps?: SpinnerProps;
  spinnerText?: string;
  children: ReactNode;
};

const LoadingSpinner = ({ children, centerProps = {}, textProps = {}, spinnerProps = {} }: LoadingSpinnerProps) => {
  return (
    <Center h="100vh" {...centerProps}>
      <VStack>
        <Text fontSize="3xl" {...textProps}>
          {children}
        </Text>
        <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" {...spinnerProps} />
      </VStack>
    </Center>
  );
};

export default LoadingSpinner;
