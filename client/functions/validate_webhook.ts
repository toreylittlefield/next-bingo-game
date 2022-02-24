import { Handler } from '@netlify/functions';
import { verify } from 'jsonwebtoken';
import { combineMetaData, getRandomUserName, getUserAvatar } from './utils/utils';
import { NETLIFY_ROLE, PWS, UNSPLASH_CLIENT_KEY } from './constants/constants';
import { loginAccountAndGetTokens } from './faunaApi/login';
import { createAccount } from './faunaApi/registerAccount';
import { NetlifyAppMetaData } from '../types/types';

const handler: Handler = async (event, context) => {
  /** Check webhook signature && clientContext */
  const sig = event.headers['x-webhook-signature'];
  if (!sig || !context.clientContext) {
    console.log('no clientContext', context.clientContext);
    return {
      statusCode: 403,
      body: JSON.stringify({ message: 'Not Authorized' }),
    };
  }

  /** Verify the webhook JWT signature */
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

  /** logic for user validation and signup / login */
  if (event.body && res) {
    const payload = JSON.parse(event.body);
    const eventType = payload.event;
    const { app_metadata: prevAppMetaData, user_metadata: prevUserMetaData, id } = payload.user as NetlifyAppMetaData;

    /** account validation event */
    if (eventType === 'validate') {
      return {
        statusCode: 200,
        body: '',
      };
    }

    const combineMetaDataCallback = combineMetaData(prevAppMetaData, prevUserMetaData);

    /** login event, and user should already have a NETLIFY_ROLE in their roles && faunadb refresh && access token */
    if (
      eventType === 'login' &&
      prevAppMetaData.roles?.includes(NETLIFY_ROLE) &&
      prevAppMetaData.faunadb_tokens &&
      prevAppMetaData.faunadb_tokens.accessTokenData.accessToken &&
      prevAppMetaData.faunadb_tokens.refreshTokenData.refreshToken
    ) {
      //** check refresh && access token expiration */
      const { app_metadata = null } = await loginAccountAndGetTokens(id, PWS, combineMetaDataCallback);

      if (!app_metadata?.faunadb_tokens)
        return {
          statusCode: 401,
          body: 'Unauthorized',
        };

      return {
        statusCode: 200,
        body: JSON.stringify({ app_metadata }),
      };
    }

    if (eventType === 'signup') {
      /** Create New Account */
      try {
        const userAvatarURL = prevUserMetaData?.avatar_url || (await getUserAvatar(UNSPLASH_CLIENT_KEY));

        const { app_metadata } = await createAccount(
          id,
          PWS,
          prevUserMetaData.full_name || '',
          getRandomUserName(),
          userAvatarURL,
          combineMetaDataCallback,
        );

        if (!app_metadata?.faunadb_tokens) {
          return {
            statusCode: 401,
            body: 'Unauthorized',
          };
        }

        return {
          statusCode: 200,
          body: JSON.stringify({ app_metadata }),
        };
      } catch (error) {
        console.error(error);
        return {
          statusCode: 500,
          body: 'Interval Server Error',
        };
      }
    }
  }

  console.log('failed: theres another reason 403');
  return {
    statusCode: 403,
    body: JSON.stringify({ message: 'Not Authorized' }),
  };
};

export { handler };
