// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import Pusher from 'pusher';
import { PusherServer } from '../../../lib/pusherServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { socketId, channel, userName } = req.body;
  console.log(req.body);
  const randomString = Math.random().toString(36).slice(2);
  const presenceData = {
    user_id: randomString,
    user_info: { userName },
  };

  const auth = await PusherServer.authenticate(socketId, channel, presenceData);
  res.send(auth);
}
