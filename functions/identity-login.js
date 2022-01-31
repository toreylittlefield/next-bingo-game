// import { Handler } from '@netlify/functions';

const handler = async (event, context) => {
  console.log({ context });
  return {
    statusCode: 200,
    body: JSON.stringify({ message: JSON.stringify(context.clientContext) }),
  };
};

export { handler };
