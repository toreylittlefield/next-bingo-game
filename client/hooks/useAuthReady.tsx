import Router from 'next/router';
import { Dispatch, SetStateAction, useContext, useEffect, useState } from 'react';
import AuthContext from '../stores/netlifyIdentityContext';
import netlifyIdentity from 'netlify-identity-widget';
import type { LoggedInUser } from '../types/types';

const useAuthReady = (
  timer: number = 300,
): [
  transition: boolean,
  setTransition: Dispatch<SetStateAction<boolean>>,
  user: LoggedInUser | null,
  authReady: boolean,
  setUser: (value: React.SetStateAction<LoggedInUser | null>) => void,
] => {
  const { user, authReady, setUser } = useContext(AuthContext);
  const [transition, setTransition] = useState(false);
  useEffect(() => {
    // if (!authReady) return;
    let timerID = setTimeout(() => {
      if (netlifyIdentity.currentUser() === null || !user?.token?.access_token || !user.fauna_access_token?.secret) {
        Router.push('/');
        netlifyIdentity.open();
        return;
      } else if (netlifyIdentity.currentUser() && user.token.access_token && user.fauna_access_token?.secret) {
        setTransition(true);
      }
    }, timer);
    return () => {
      if (timerID) clearTimeout(timerID);
    };
  }, [user, authReady, timer]);

  return [transition, setTransition, user, authReady, setUser];
};

export { useAuthReady };
