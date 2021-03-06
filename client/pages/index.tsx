import type { NextPage } from 'next';
import styles from '../styles/Home.module.css';
import React, { useEffect, useRef, useState } from 'react';
import Pusher from 'pusher-js';
import { channelName } from '../lib/pusherChannel';
import { Container, Flex, Text } from '@chakra-ui/react';
import { UserNameStates } from '../types/types';
import SendMessageForm from '../components/SendMessageForm';

interface Data {
  userName: string;
  message: string;
}

const Home: NextPage = () => {
  // const [submit, setSubmit] = useState<UserNameStates>('ready');
  // const [liveChatMessages, setLiveChatMessages] = useState<Data[]>([]);
  // const pusherRef = useRef<Pusher>(null);

  // useEffect(() => {
  //   if (submit !== 'sub' || pusherRef.current == null) return;
  //   setSubmit('sent');
  //   // Enable pusher logging - don't include this in production
  //   let pusher = pusherRef.current;
  //   pusher.subscribe(channelName);

  //   pusher.bind('message-event', function (data: Data) {
  //     const { message, userName } = data;
  //     setLiveChatMessages((prev) => [...prev, { message, userName }]);
  //   });

  //   return () => {
  //     // if(submit )
  //     // if (pusherRef.current?.connection.state) pusherRef.current.unsubscribe(channelName);
  //   };
  // }, [submit]);

  return (
    <Flex direction="column">
      <Text>This is the home page</Text>
      <Text>Put some home page stuff here</Text>
      {/* {liveChatMessages.map((liveMessage) => {
        const randomString = Math.random().toString(36).slice(2);

        const { message, userName } = liveMessage;
        return (
          <div key={randomString}>
            {message} : {userName}
          </div>
        );
      })}
      <Container maxW="container.sm">
        <SendMessageForm ref={pusherRef} setSubmit={setSubmit} submit={submit} />
      </Container> */}
    </Flex>
  );
};

export default Home;
