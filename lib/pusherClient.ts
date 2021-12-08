export const pusherClientOptions = {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER as string,
  appId: process.env.NEXT_PUBLIC_PUSHER_KEY as string,
};
