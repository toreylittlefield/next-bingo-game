// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { PusherServer } from '../../../lib/pusherServer';
import { channelName } from '../../../lib/pusherChannel';

type Data = {
  message: string | object;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const pusher = PusherServer;
  const { userName, message } = req.body;
  console.log(req.body, userName, typeof userName);
  const pushRes = await pusher.trigger(channelName, 'message-event', {
    message,
    userName,
  });
  if (pushRes.ok) {
    res.status(200).json({ message: 'sent!' });
  } else {
    res.status(500).json({ message: 'looks like an erro' });
  }
}
