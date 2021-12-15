import { Tooltip, Button, Text, useMediaQuery } from '@chakra-ui/react';
import { AiOutlineSetting as SettingIcon } from 'react-icons/ai';
import React from 'react';
import netlifyIdentity from 'netlify-identity-widget';
import NextLink from 'next/link';

type PropTypeUserSettings = {
  user: netlifyIdentity.User;
};

const SettingsButton = ({ user }: PropTypeUserSettings) => {
  const [screen480above] = useMediaQuery('(min-width: 480px)');

  return (
    <NextLink href={'/userprofile'} passHref>
      <Button rightIcon={<SettingIcon />} color="ghostwhite" variant="link">
        <Tooltip hasArrow label="Change User Settings" bg="blue.600">
          <Text>{screen480above ? user.email : 'Settings'}</Text>
        </Tooltip>
      </Button>
    </NextLink>
  );
};

export default SettingsButton;
