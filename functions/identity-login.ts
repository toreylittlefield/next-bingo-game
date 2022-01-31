import { Handler } from '@netlify/functions';

const handler: Handler = async (event, context) => {
  console.log({ context });
  // return {
  //   statusCode: 200,
  //   body: JSON.stringify({ message: JSON.stringify(context.clientContext) }),
  // };
  return {
    statusCode: 302,
    headers: {
      Location: '/userprofile',
    },
  };
};

export { handler };
