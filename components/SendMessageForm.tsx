import { Box, Button, Editable, EditableInput, EditablePreview, Flex, Icon, Input } from '@chakra-ui/react';
import Pusher from 'pusher-js';
import React, { ForwardedRef, Ref, RefObject, useContext, useEffect, useState } from 'react';
import { pusherClientOptions } from '../lib/pusherClient';
import AuthContext from '../stores/netlifyIdentityContext';
import { UserNameStates } from '../types/types';
import EditableControls from './EditableControls';

const { appId, cluster } = pusherClientOptions;

type PropTypes = {
  submit: UserNameStates;
  setSubmit: (submit: UserNameStates) => void;
};

const SendMessageForm = ({ submit, setSubmit }: PropTypes, pusherRef: ForwardedRef<Pusher | null>) => {
  const { user } = useContext(AuthContext);
  const [userName, setUserName] = useState(user?.user_metadata.full_name);
  const [msgToSend, setMsgToSend] = useState('');

  useEffect(() => {
    setUserName(user?.user_metadata.full_name);
  }, [user?.user_metadata.full_name]);

  const handleSendMsgSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await fetch('/api/pusher/sendmessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: msgToSend, userName }),
    });
    if (res.ok) {
      const json = await res.json();
      const response = await fetch('/api/fauna/createmessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: msgToSend, userName }),
      });
      if (response.ok) {
        const json = await response.json();
      }
      setMsgToSend('');
    }
  };

  const handleSubmitName = async (userName: string) => {
    if (submit !== 'ready') return;
    if (process.env.NODE_ENV === 'development') {
      Pusher.logToConsole = true;
    }

    (pusherRef as React.MutableRefObject<Pusher>).current = new Pusher(appId, {
      cluster: cluster,
      authEndpoint: 'api/pusher/auth',
      auth: { params: { userName } },
    });
    setSubmit('sub');
  };
  return (
    <Flex direction="column">
      <Box>
        <form onSubmit={handleSendMsgSubmit}>
          <Input
            id="chat-message"
            placeholder="Enter a message"
            name="chat-message"
            value={msgToSend}
            onChange={(e) => setMsgToSend(e.target.value)}
          ></Input>
          <Button type="submit">Submit</Button>
        </form>
      </Box>
      <Box>
        <Editable
          placeholder="Username ⚡️"
          textAlign="center"
          value={userName}
          onChange={(e) => setUserName(e)}
          fontSize="2xl"
          isPreviewFocusable={false}
          onSubmit={handleSubmitName}
          isDisabled={submit !== 'ready'}
        >
          <EditablePreview />
          <EditableInput />
          <EditableControls />
        </Editable>
      </Box>
    </Flex>
  );
};

export default React.forwardRef(SendMessageForm);
