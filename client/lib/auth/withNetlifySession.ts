import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { NetlifyAppMetaData } from '../../types/types';
import { NETLIFY_SITE_URL } from '../constants/constants';

export function withNetlifySession<P extends { [key: string]: unknown } = { [key: string]: unknown }>(
  innerHandler: ({
    context,
    user,
  }: {
    context?: GetServerSidePropsContext;
    user?: NetlifyAppMetaData;
  }) => GetServerSidePropsResult<P> | Promise<GetServerSidePropsResult<P>>,
  options?: any,
) {
  return async function getSSPWrappedNetlifySession(context: GetServerSidePropsContext) {
    const token = context.req?.cookies?.[`nf_jwt`];
    try {
      var user;
      const userRes = await fetch(`${NETLIFY_SITE_URL}/.netlify/identity/user`, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      user = await userRes.json();
    } catch (error) {
      console.error(error);
    }

    return innerHandler({ context, user });
  };
}

export function returnUserOrLogin<P extends { [key: string]: unknown } = { [key: string]: unknown }>(
  user: NetlifyAppMetaData | undefined,
  callback?: (key?: P) => GetServerSidePropsResult<P> | Promise<GetServerSidePropsResult<P>>,
) {
  console.log('with netlify session *****', { user }, 'with netlify session *****');
  if (callback) {
    return callback();
  }
  if (!user) {
    return {
      redirect: {
        destination: `/login`,
        permanent: true,
      },
    };
  }
  return {
    props: {
      user,
    },
  };
}

export const getNetlifyUserSession = withNetlifySession(async function getIdentitySession({ context, user }) {
  return returnUserOrLogin(user);
});
