import { Tooltip, Button, Text, useMediaQuery } from '@chakra-ui/react';
import { AiOutlineSetting as SettingIcon } from 'react-icons/ai';
import React from 'react';
import NextLink from 'next/link';
import { UserProfile } from '../types/types';

const SettingsButton = ({ user }: UserProfile) => {
  const [screen480above] = useMediaQuery('(min-width: 480px)');

  return (
    <NextLink
      href={{
        pathname: 'userprofile/me/[userprofile]',
        query: { userprofile: user.user_metadata.full_name },
      }}
      passHref
      shallow={false}
    >
      <Button rightIcon={<SettingIcon />} color="ghostwhite" variant="link">
        <Tooltip hasArrow label="Change User Settings" bg="blue.600">
          <Text>{screen480above ? user.email : 'Settings'}</Text>
        </Tooltip>
      </Button>
    </NextLink>
  );
};

export default SettingsButton;
