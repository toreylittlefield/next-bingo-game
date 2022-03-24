import React, { createContext, useState, useEffect, useRef } from 'react';
import netlifyIdentity from 'netlify-identity-widget';
import type { APIServiceLoggedInResponse, LoggedInUser, NetlifyAppMetaData } from '../types/types';
import Router, { useRouter } from 'next/router';
import { getRandomUserName } from '../lib/utils/utils';
import { apiRequest } from '../lib/api/apiservice';
interface AuthInterface {
  user: LoggedInUser | null;
  login: () => void;
  logout: () => void;
  authReady: boolean;
  setUser: (value: React.SetStateAction<LoggedInUser | null>) => void;
}

const AuthContext = createContext<AuthInterface>({
  user: null,
  login: () => {},
  logout: () => {},
  authReady: false,
  setUser: () => {},
});

interface Props {
  children: React.ReactNode;
}

export const AuthContextProvider = ({ children }: Props) => {
  const [user, setUser] = useState<LoggedInUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const { push, isReady, asPath } = useRouter();

  useEffect(() => {
    /** fires when users logs in or visits page or has gotrue in local storage */
    netlifyIdentity.on('login', async (u) => {
      console.log({ u }, 'user login');
      const user = u as NetlifyAppMetaData;
      const access_token = user.token?.access_token;
      try {
        if (access_token) {
          const res = await apiRequest<APIServiceLoggedInResponse>({
            url: '/api/fauna/auth/token',
            identityAccessToken: access_token,
            searchParams: { grantType: 'login' },
          }).catch((err) => console.error('error #%d', err));
          if (res) {
            console.dir(res, { colors: true });
            setUser({ ...user, ...res });
          }
          if (res?.faunaUser?.lastUpdated === false) {
            console.log('navigating to user settings...');
            Router.push({
              pathname: '/userprofile/me/[me]',
              query: { userprofile: user.user_metadata.full_name },
            });
          }
        }
        netlifyIdentity.close();
      } catch (error) {
        console.error(error);
      }
      // Router.push('/userprofile/me?userprofile' + user.user_metadata.full_name);
    });
    netlifyIdentity.on('logout', () => {
      setUser(null);
      Router.push('/');
      console.log('logout event');
    });

    //** fires when netlify is first initialize */
    netlifyIdentity.on('init', (u) => {
      console.log({ user: u }, 'init user');
      setAuthReady(true);
      console.log('init event');
    });

    netlifyIdentity.on('close', () => {
      Router.push('/');
    });

    // init netlify identity connection
    netlifyIdentity.init({ logo: false, namePlaceholder: getRandomUserName() });

    return () => {
      netlifyIdentity.off('login');
    };
  }, []);

  const login = () => {
    Router.push('/login');
  };

  const logout = async () => {
    Router.push('/logout');
    // netlifyIdentity.logout();
  };

  const refreshFaunaToken = async () => {};

  const context = { user, login, logout, authReady, setUser };

  return <AuthContext.Provider value={context}>{children}</AuthContext.Provider>;
};

export default AuthContext;
