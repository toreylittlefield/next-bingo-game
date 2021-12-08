// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { PusherServer } from '../../../lib/pusherServer';
import { channelName } from '../../../lib/pusherChannel';

type Data = {
  message: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const pusher = PusherServer;

  await pusher.trigger(channelName, 'message-event', {
    message: 'hello world',
  });
  res.status(200).json({ message: 'Hello!' });
}
