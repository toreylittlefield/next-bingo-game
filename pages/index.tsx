import type { NextPage } from 'next';
import styles from '../styles/Home.module.css';
import { useEffect, useState } from 'react';
import Pusher from 'pusher-js';

const pusherConfig = {
  cluster: process.env.PUSHER_CLUSTER as string,
};

const Home: NextPage = () => {
  const [state, setstate] = useState();

  useEffect(() => {
    // Enable pusher logging - don't include this in production
    if (process.env.NODE_ENV === 'development') {
      Pusher.logToConsole = true;
    }
    console.log(process.env.NEXT_PUBLIC_PUSHER_APP_ID);
    // const pusher = new Pusher(process.env.PUSHER_APP_ID as string, pusherConfig);

    // const channel = pusher.subscribe('bingo-prod');
    // channel.bind('message-event', function (data: any) {
    //   alert(JSON.stringify(data));
    // });
  }, []);

  return <div className={styles.container}></div>;
};

export default Home;
