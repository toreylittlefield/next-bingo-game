import { Tooltip, Button } from '@chakra-ui/react';
import { AiOutlineSetting as SettingIcon } from 'react-icons/ai';
import React from 'react';
import netlifyIdentity from 'netlify-identity-widget';

type PropTypeUserSettings = {
  user: netlifyIdentity.User;
};

const UserSettings = ({ user }: PropTypeUserSettings) => {
  return (
    <Tooltip hasArrow label="Change User Settings" bg="blue.600">
      <Button rightIcon={<SettingIcon />} color="ghostwhite" variant="link">
        {user.email}
      </Button>
    </Tooltip>
  );
};

export default UserSettings;
