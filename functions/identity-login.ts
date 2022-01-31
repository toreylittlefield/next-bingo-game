import { Handler } from '@netlify/functions';

const handler: Handler = async (event, context) => {
  if (context.clientContext && event.body) {
    const { clientContext } = context;
    const payload = JSON.parse(event.body);
    const user = payload.user;
    console.log(JSON.stringify({ clientContext, user, payload }, null, 2));
    return {
      statusCode: 302,
      headers: {
        Location: '/userprofile',
        'Cache-Control': 'no-cache',
      },
      body: '',
    };
  }
  return {
    statusCode: 403,
    body: JSON.stringify({ message: 'Not Authorized' }),
  };
};

export { handler };
