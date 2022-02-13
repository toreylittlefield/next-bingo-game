import { Handler } from '@netlify/functions';
import faunadb, { Create } from 'faunadb';
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
  domain: 'db.fauna.com',
  scheme: 'https',
  secret: process.env.FAUNADB_SERVER_KEY as string,
});

// PWS
const PWS = process.env.FAUNADB_PASSWORD as string;

/* create a user in FaunaDB that can connect from the browser */
function createUser(userId: string, password: string) {
  return client.query(
    q.Create(q.Collection('users'), {
      credentials: {
        password: password,
      },
      data: {
        id: userId,
        // user_metadata: userData.user_metadata,
      },
    })
  );
  // return client.query(
  //   q.Create(q.Class('users'), {
  //     credentials: {
  //       password: password,
  //     },
  //     data: {
  //       id: userId,
  //       // user_metadata: userData.user_metadata,
  //     },
  //   })
  // );
}

function obtainToken(userId: object, password: string) {
  return client.query(q.Login(q.Select('ref', userId), { password }));
}

const handler: Handler = async (event, context) => {
  console.log(JSON.stringify({ event, context }, null, 2));

  const sig = event.headers['x-webhook-signature'];
  if (!sig || !context.clientContext) {
    console.log('no clientContext', context.clientContext);
    return {
      statusCode: 403,
      body: JSON.stringify({ message: 'Not Authorized' }),
    };
  }

  const res = verify(sig, process.env.WEB_HOOK_SIG as string, function resolve(error, decoded) {
    if (error) {
      console.log('invalid  webhook signature', sig);
      return {
        statusCode: 403,
        body: JSON.stringify({ message: 'Not Authorized' }),
      };
    }
    return decoded;
  });

  if (event.body && res) {
    const payload = JSON.parse(event.body);
    const eventType = payload.event;
    console.log({ payload });
    const { app_metadata, user_metadata, id } = payload.user as UserType;
    // wait for login after email validation to create user since netlify id will change it seems
    if (eventType === 'validate' && app_metadata?.provider === 'email') {
      return {
        statusCode: 200,
        body: '',
      };
    }
    // this is a login event most likely
    if (app_metadata.roles?.includes('sub') && app_metadata.faunadb_token) {
      return {
        statusCode: 200,
        body: '',
      };
    }

    // create user in faunadb
    const user = await createUser(id, PWS).catch((err) => console.log('error creating user', err.message));
    if (!user) {
      console.log('fauna create user error 401');
      return {
        statusCode: 401,
        body: 'Not Authorized',
      };
    }
    const key = (await obtainToken(user, PWS)) as Key;
    console.log({ user, key });
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

  console.log('failed: theres another reason 403');
  return {
    statusCode: 403,
    body: JSON.stringify({ message: 'Not Authorized' }),
  };
};

export { handler };
