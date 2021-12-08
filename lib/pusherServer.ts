// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import Pusher from 'pusher';

const pusherServerConfig: Pusher.Options = {
  cluster: process.env.PUSHER_CLUSTER as string,
  appId: process.env.PUSHER_APP_ID as string,
  key: process.env.PUSHER_KEY as string,
  secret: process.env.PUSHER_SECRET_KEY as string,
  useTLS: true,
};

export const PusherServer = new Pusher(pusherServerConfig);
