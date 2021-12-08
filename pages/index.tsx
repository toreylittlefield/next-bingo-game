import type { NextPage } from 'next';
import styles from '../styles/Home.module.css';
import { useEffect, useState } from 'react';
import Pusher from 'pusher-js';
import { pusherClientOptions } from '../lib/pusherClient';
import { channelName } from '../lib/pusherChannel';

const { appId, cluster } = pusherClientOptions;

const Home: NextPage = () => {
  const [userName, setUserName] = useState('');
  const [submit, setSubmit] = useState(false);

  useEffect(() => {
    // Enable pusher logging - don't include this in production
    if (process.env.NODE_ENV === 'development') {
      Pusher.logToConsole = true;
    }

    const pusher = new Pusher(appId, {
      cluster: cluster,
      // authEndpoint: 'api/pusher/auth',
      // auth: { params: { userName: 'Torey' } },
    });
    const channel = pusher.subscribe(channelName);

    channel.bind('message-event', function (data: any) {
      alert(JSON.stringify(data));
    });
  }, []);

  return (
    <div className={styles.container}>
      <label htmlFor="user-name">Enter username</label>
      <input
        id="user-name"
        placeholder="Enter a username"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
      ></input>
      <button onClick={() => setSubmit(true)} type="button" disabled={submit}>
        Submit
      </button>
    </div>
  );
};

export default Home;
