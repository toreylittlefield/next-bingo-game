import { Handler } from '@netlify/functions';
import faunadb from 'faunadb';
import generator from 'generate-password';
import * as netlifyIdentity from 'netlify-identity-widget';

type Key = {
  secret: string;
};

/* configure faunaDB Client with our secret */
const q = faunadb.query;
const client = new faunadb.Client({
  domain: 'db.us.fauna.com',
  secret: process.env.FAUNADB_SERVER_KEY as string,
});

/* create a user in FaunaDB that can connect from the browser */
async function createUser(userData: netlifyIdentity.User, password: string) {
  return await client.query(
    q.Create(q.Class('users'), {
      credentials: {
        password: password,
      },
      data: {
        id: userData.id,
        user_metadata: userData.user_metadata,
      },
    })
  );
}

function obtainToken(user: netlifyIdentity.User, password: string) {
  return client.query(q.Login(q.Select('ref', user), { password }));
}

const handler: Handler = async (event, context) => {
  if (context.clientContext && event.body) {
    const { clientContext } = context;
    const payload = JSON.parse(event.body);
    const userData = payload.user;
    console.log(JSON.stringify({ clientContext, userData, payload }, null, 2));
    const password = generator.generate({
      length: 10,
      numbers: true,
    });

    const user = await createUser(userData, password);
    const key = (await obtainToken(user as netlifyIdentity.User, password)) as Key;

    console.log({ key });

    return {
      statusCode: 200,
      body: JSON.stringify({
        app_metadata: {
          faunadb_token: key.secret,
          roles: ['member'],
          // we discard the credential, and can create a new one if we ever need a new token
          // faunadb_credential : password
        },
        user_metadata: {
          test: true,
          username: '',
        },
      }),
    };
  }
  return {
    statusCode: 403,
    body: JSON.stringify({ message: 'Not Authorized' }),
  };
};

export { handler };
