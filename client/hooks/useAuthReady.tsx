import Router from 'next/router';
import { Dispatch, SetStateAction, useContext, useEffect, useState } from 'react';
import AuthContext from '../stores/netlifyIdentityContext';
import netlifyIdentity from 'netlify-identity-widget';
import type { NetlifyAppMetaData } from '../types/types';

const useAuthReady = (
  timer: number = 300,
): [
  transition: boolean,
  setTransition: Dispatch<SetStateAction<boolean>>,
  user: NetlifyAppMetaData | null,
  authReady: boolean,
] => {
  const { user, authReady } = useContext(AuthContext);
  const [transition, setTransition] = useState(false);
  useEffect(() => {
    // if (!authReady) return;
    let timerID = setTimeout(() => {
      if (netlifyIdentity.currentUser() === null || !user?.token?.access_token) {
        Router.push('/');
        netlifyIdentity.open();
        return;
      } else if (netlifyIdentity.currentUser() != null && user.token.access_token != null) {
        setTransition(true);
      }
    }, timer);
    return () => {
      if (timerID) clearTimeout(timerID);
    };
  }, [user, authReady, timer]);

  return [transition, setTransition, user, authReady];
};

export { useAuthReady };
