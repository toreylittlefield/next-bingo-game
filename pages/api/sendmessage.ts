// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import Pusher from 'pusher';

type Data = {
  message: string;
};

const pusherConfig: Pusher.Options = {
  cluster: process.env.PUSHER_CLUSTER as string,
  appId: process.env.PUSHER_APP_ID as string,
  key: process.env.PUSHER_KEY as string,
  secret: process.env.PUSHER_SECRET_KEY as string,
};

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const pusher = new Pusher(pusherConfig);

  pusher.trigger('bingo-prod', 'message-event', {
    message: 'hello world',
  });
  res.status(200).json({ message: 'Hello!' });
}
