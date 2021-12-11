import { Button, Flex, Icon, Input } from '@chakra-ui/react';
import Pusher from 'pusher-js';
import React, { ForwardedRef, Ref, RefObject, useContext, useState } from 'react';
import { pusherClientOptions } from '../lib/pusherClient';
import AuthContext from '../stores/netlifyIdentityContext';
import { UserNameStates } from '../types/types';

const { appId, cluster } = pusherClientOptions;

type PropTypes = {
  submit: UserNameStates;
  setSubmit: (submit: UserNameStates) => void;
};

const SendMessageForm = ({ submit, setSubmit }: PropTypes, pusherRef: ForwardedRef<Pusher | null>) => {
  const { user } = useContext(AuthContext);

  const [userName, setUserName] = useState(user?.email);
  const [msgToSend, setMsgToSend] = useState('');

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
      console.log(json);
      const response = await fetch('/api/fauna/createmessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: msgToSend, userName }),
      });
      if (response.ok) {
        const json = await response.json();
        console.log(json, 'fauna reply');
      }
      setMsgToSend('');
    }
  };

  const handleSubmitName = async (e: React.MouseEvent) => {
    e.preventDefault();
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
      <Input
        id="user-name"
        name="user-name"
        disabled={submit !== 'ready'}
        placeholder="Enter a username"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
      ></Input>
      <Button type="button" onClick={handleSubmitName} disabled={submit !== 'ready'}>
        Submit
      </Button>
      <div>
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
      </div>
    </Flex>
  );
};

export default React.forwardRef(SendMessageForm);
