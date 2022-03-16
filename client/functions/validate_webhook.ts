import { Handler, HandlerEvent } from '@netlify/functions';
import { verify } from 'jsonwebtoken';
import { getUserAvatar, hasValidRole, notAuthorizedHandlerResponse } from './utils/utils';
import { NETLIFY_ROLE, PWS, UNSPLASH_CLIENT_KEY } from '../lib/constants/constants';
import type { NetlifyAppMetaData } from '../types/types';
import { getRandomUserName } from '../lib/utils/utils';
import { createFaunaUserAccount } from '../lib/faunaApi/udfs/createFaunaUserAccount';

const handler: Handler = async (event: HandlerEvent, context) => {
  /** Check webhook signature && clientContext */
  const webhookSignature = event.headers['x-webhook-signature'];
  if (!webhookSignature || !context.clientContext) {
    console.log('no clientContext', context.clientContext);
    return notAuthorizedHandlerResponse();
  }

  /** Verify the webhook JWT signature */
  const res = verify(webhookSignature, process.env.WEB_HOOK_SIG as string, function resolve(error, decoded) {
    if (error) {
      console.log('invalid  webhook signature', webhookSignature);
      return undefined;
    }
    return decoded;
  });

  /** logic for user validation and signup / login */
  if (event.body && res) {
    const payload = JSON.parse(event.body);
    const eventType = payload.event;
    console.dir(payload, { colors: true });
    const { app_metadata, user_metadata, id } = payload.user as NetlifyAppMetaData;

    /** account validation event */
    if (eventType === 'validate') {
      return {
        statusCode: 200,
        body: '',
      };
    }

    /** login event, and user should already have a NETLIFY_ROLE in their roles && faunadb refresh && access token */
    if (eventType === 'login') {
      return hasValidRole({ app_metadata, user_metadata });
    }

    if (eventType === 'signup') {
      /** Create New Account */
      try {
        const userAvatarURL = user_metadata?.avatar_url || (await getUserAvatar(UNSPLASH_CLIENT_KEY));

        const account = await createFaunaUserAccount(
          id,
          PWS,
          user_metadata.full_name || '',
          getRandomUserName(),
          userAvatarURL,
        );
        if (account?.id && account.user) {
          const metaData = { app_metadata: { ...app_metadata, roles: [NETLIFY_ROLE] }, user_metadata };
          return hasValidRole(metaData);
        }

        throw Error('Fauna Did Not Register User');
      } catch (error) {
        console.error(error);
        if (error instanceof Error) {
          return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
          };
        }
        return {
          statusCode: 500,
          body: 'Interval Server Error',
        };
      }
    }
  }

  return notAuthorizedHandlerResponse();
};

export { handler };
