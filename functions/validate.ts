import { Handler } from '@netlify/functions';
import faunadb from 'faunadb';
import generator from 'generate-password';
import * as netlifyIdentity from 'netlify-identity-widget';
import { verify } from 'jsonwebtoken';

type Key = {
  secret: string;
};

/* configure faunaDB Client with our secret */
const q = faunadb.query;
const client = new faunadb.Client({
  secret: process.env.FAUNADB_ADMIN_KEY as string,
});

/* create a user in FaunaDB that can connect from the browser */
function createUser(userData: netlifyIdentity.User, password: string) {
  return client.query(
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

  console.log({ res });

  //   if (context.clientContext && event.body) {
  //     const { clientContext } = context;
  //     const payload = JSON.parse(event.body);
  //     const userData = payload.user;
  //     console.log(JSON.stringify({ clientContext, userData, payload }, null, 2));
  //     const password = generator.generate({
  //       length: 10,
  //       numbers: true,
  //     });

  //     const user = await createUser(userData, password);
  //     const key = (await obtainToken(user as netlifyIdentity.User, password)) as Key;

  //     console.log({ key });

  //     return {
  //       statusCode: 200,
  //       body: JSON.stringify({
  //         app_metadata: {
  //           faunadb_token: key.secret,
  //           roles: ['member'],
  //           // we discard the credential, and can create a new one if we ever need a new token
  //           // faunadb_credential : password
  //         },
  //         user_metadata: {
  //           test: true,
  //           username: '',
  //         },
  //       }),
  //     };
  //   }
  return {
    statusCode: 403,
    body: JSON.stringify({ message: 'Not Authorized' }),
  };
};

export { handler };
