import React, { createContext, useState, useEffect, useRef } from 'react';
import netlifyIdentity from 'netlify-identity-widget';
import type { FaunaLoggedInResponse, NetlifyAppMetaData } from '../types/types';
import Router, { useRouter } from 'next/router';
import { getRandomUserName } from '../lib/utils/utils';
import { apiRequest } from '../lib/api/apiservice';
interface AuthInterface {
  user: NetlifyAppMetaData | null;
  login: () => void;
  logout: () => void;
  authReady: boolean;
}

const AuthContext = createContext<AuthInterface>({
  user: null,
  login: () => {},
  logout: () => {},
  authReady: false,
});

interface Props {
  children: React.ReactNode;
}

interface LoggedInUser extends NetlifyAppMetaData {
  faunaUser?: FaunaLoggedInResponse['user'];
  faunaTokens?: { access: FaunaLoggedInResponse['tokens']['access'] };
}

export const AuthContextProvider = ({ children }: Props) => {
  const [user, setUser] = useState<LoggedInUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const { push, isReady, asPath } = useRouter();
  const urlHistoryRef = useRef<string>();

  useEffect(() => {
    if (!user?.user_metadata.full_name || !user?.token?.access_token || !isReady) return;

    if (asPath === '/' && urlHistoryRef.current === '/login') {
      push({
        pathname: '/userprofile/me/[me]',
        query: { userprofile: user.user_metadata.full_name },
      });
    }
    urlHistoryRef.current = asPath;
  }, [isReady, push, asPath, user]);

  useEffect(() => {
    /** fires when users logs in or visits page or has gotrue in local storage */
    netlifyIdentity.on('login', async (u) => {
      console.log({ u }, 'user login');
      const user = u as NetlifyAppMetaData;
      const access_token = user.token?.access_token;
      if (access_token) {
        const res = await apiRequest<FaunaLoggedInResponse>({
          url: '/api/fauna/auth/token',
          identityAccessToken: access_token,
          searchParams: { grantType: 'login' },
        });
        if (res) {
          setUser({ ...user, ...res });
        } else {
          setUser(user);
        }
      }
      netlifyIdentity.close();
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
      const user = u as NetlifyAppMetaData;
      setUser(user);
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

  const context = { user, login, logout, authReady };

  return <AuthContext.Provider value={context}>{children}</AuthContext.Provider>;
};

export default AuthContext;
