import { Handler } from '@netlify/functions';

const handler: Handler = async (event, context) => {
  if (context.clientContext) {
    const { clientContext } = context;
    console.log(JSON.stringify(clientContext.user_metadata, null, 2));
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
