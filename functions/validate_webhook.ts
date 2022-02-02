import { Handler } from '@netlify/functions';
import faunadb from 'faunadb';
import generator from 'generate-password';
import netlifyIdentity from 'netlify-identity-widget';
import { verify } from 'jsonwebtoken';

type Key = {
  secret: string;
};

interface UserType extends netlifyIdentity.User {
  ['app_metadata']: {
    provider: string;
    roles: string[];
    faunadb_token: string;
  };
}

/* configure faunaDB Client with our secret */
const q = faunadb.query;
const client = new faunadb.Client({
  secret: process.env.FAUNADB_ADMIN_KEY as string,
});

// PWS
const PWS = process.env.FAUNADB_PASSWORD as string;

/* create a user in FaunaDB that can connect from the browser */
function createUser(userId: string, password: string) {
  return client.query(
    q.Create(q.Class('users'), {
      credentials: {
        password: password,
      },
      data: {
        id: userId,
        // user_metadata: userData.user_metadata,
      },
    })
  );
}

function obtainToken(userId: object, password: string) {
  return client.query(q.Login(q.Select('ref', userId), { password }));
}

const handler: Handler = async (event, context) => {
  console.log(JSON.stringify({ event, context }, null, 2));

  const sig = event.headers['x-webhook-signature'];
  if (!sig || !context.clientContext) {
    return {
      statusCode: 403,
      body: JSON.stringify({ message: 'Not Authorized' }),
    };
  }

  const res = verify(sig, process.env.WEB_HOOK_SIG as string, function resolve(error, decoded) {
    if (error) {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: 'Not Authorized' }),
      };
    }
    return decoded;
  });

  if (event.body && res) {
    const payload = JSON.parse(event.body);
    const { app_metadata, user_metadata, id } = payload.user as UserType;
    if (app_metadata.roles.includes('sub') && app_metadata.faunadb_token) {
      return {
        statusCode: 200,
        body: '',
      };
    }

    // create user in faunadb
    const user = await createUser(id, PWS);
    const key = (await obtainToken(user, PWS)) as Key;
    return {
      statusCode: 200,
      body: JSON.stringify({
        app_metadata: {
          faunadb_token: key.secret,
          roles: ['sub'],
          // we discard the credential, and can create a new one if we ever need a new token
          // faunadb_credential : password
        },
        user_metadata: {
          ...user_metadata,
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
