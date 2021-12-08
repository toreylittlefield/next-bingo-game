import type { NextPage } from 'next';
import styles from '../styles/Home.module.css';
import React, { useEffect, useRef, useState } from 'react';
import Pusher from 'pusher-js';
import { pusherClientOptions } from '../lib/pusherClient';
import { channelName } from '../lib/pusherChannel';

interface Data {
  userName: string;
  message: string;
}

type UserNameStates = 'loading' | 'sent' | 'ready' | 'sub';
const { appId, cluster } = pusherClientOptions;

const Home: NextPage = () => {
  const [userName, setUserName] = useState('');
  const [submit, setSubmit] = useState<UserNameStates>('ready');
  const [msgToSend, setMsgToSend] = useState('');
  const [liveChatMessages, setLiveChatMessages] = useState<Data[]>([]);
  const pusherRef = useRef<Pusher>();

  useEffect(() => {
    if (submit !== 'sub' || pusherRef.current == null) return;
    setSubmit('sent');
    // Enable pusher logging - don't include this in production
    let pusher = pusherRef.current;
    pusher.subscribe(channelName);

    pusher.bind('message-event', function (data: Data) {
      const { message, userName } = data;
      console.log(data, 'received');
      setLiveChatMessages((prev) => [...prev, { message, userName }]);
    });

    return () => {
      // if(submit )
      // if (pusherRef.current?.connection.state) pusherRef.current.unsubscribe(channelName);
    };
  }, [submit]);

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
      setMsgToSend('');
    }
  };

  const handleSubmitName = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (submit !== 'ready') return;
    if (process.env.NODE_ENV === 'development') {
      Pusher.logToConsole = true;
    }
    pusherRef.current = new Pusher(appId, {
      cluster: cluster,
      authEndpoint: 'api/pusher/auth',
      auth: { params: { userName } },
    });
    setSubmit('sub');
  };

  return (
    <div className={styles.container}>
      <label htmlFor="user-name">Enter username</label>
      <input
        id="user-name"
        name="user-name"
        disabled={submit !== 'ready'}
        placeholder="Enter a username"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
      ></input>
      <button type="button" onClick={handleSubmitName} disabled={submit !== 'ready'}>
        Submit
      </button>
      <div>
        <form onSubmit={handleSendMsgSubmit}>
          <input
            id="chat-message"
            placeholder="Enter a message"
            name="chat-message"
            value={msgToSend}
            onChange={(e) => setMsgToSend(e.target.value)}
          ></input>
          <button type="submit">Submit</button>
        </form>
      </div>
      {liveChatMessages.map((liveMessage) => {
        const randomString = Math.random().toString(36).slice(2);

        const { message, userName } = liveMessage;
        return (
          <div key={randomString}>
            {message} : {userName}
          </div>
        );
      })}
    </div>
  );
};

export default Home;
