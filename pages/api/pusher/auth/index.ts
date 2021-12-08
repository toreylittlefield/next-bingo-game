// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { PusherServer } from '../../../../lib/pusherServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { socket_id = '', channel_name = 'presence-bingo-dev', userName = 'default torey' } = req.body;
  if (socket_id === '') res.status(500).send({ message: 'error no socket id ' + socket_id });
  const randomString = Math.random().toString(36).slice(2);
  const presenceData = {
    user_id: randomString,
    user_info: { username: userName },
  };
  console.log(randomString);
  try {
    const auth = PusherServer.authenticate(socket_id, channel_name, presenceData);
    res.send(auth);
  } catch (error) {
    console.error(error, 'errorrrr');
  }
  // const attributes = 'subscription_count,user_count';
  // const checkCount = await PusherServer.trigger(channel, 'message-event', presenceData, { info: attributes });
  // if (checkCount.status === 200) {
  //   const body = await checkCount.json();
  //   const channelsInfo = body.channels;
  //   console.log({ body });
  //   const { subscription_count, user_count } = channelsInfo[channel];
  //   if (subscription_count > 50 || user_count > 50 || socketId === '') {
  //     res.send({ message: 'Too Many Users / Subs To Authenicate', count: { subscription_count, user_count } });
  //   } else {
  //   }
  // } else {
  //   console.log(checkCount.status);
  // }
}
