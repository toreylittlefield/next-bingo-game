import React, { createContext, useState, useEffect } from 'react';
import netlifyIdentity from 'netlify-identity-widget';
import Router from 'next/router';

interface AuthInterface {
  user: netlifyIdentity.User | null;
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

interface UserType extends netlifyIdentity.User {
  ['user_metadata']: {
    username?: string;
    avatar_url: string;
    full_name: string;
  };
}

export const AuthContextProvider = ({ children }: Props) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    netlifyIdentity.on('login', (user: UserType) => {
      setUser(user);
      netlifyIdentity.close();
      if (!user.user_metadata.username?.trim()) {
        Router.push('/userprofile');
        return;
      } else {
        Router.push('/rooms');
      }
      console.log('login event');
    });
    netlifyIdentity.on('logout', () => {
      setUser(null);
      Router.push('/');
      console.log('logout event');
    });
    netlifyIdentity.on('init', (user) => {
      // setUser(user);
      setAuthReady(true);
      console.log('init event');
    });

    // init netlify identity connection
    netlifyIdentity.init();

    return () => {
      netlifyIdentity.off('login');
    };
  }, []);

  const login = () => {
    netlifyIdentity.open();
  };

  const logout = () => {
    netlifyIdentity.logout();
  };

  const context = { user, login, logout, authReady };

  return <AuthContext.Provider value={context}>{children}</AuthContext.Provider>;
};

export default AuthContext;
