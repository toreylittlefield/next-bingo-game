import { NextPage } from 'next';
import UserSettings from '../../../components/UserSettings';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { useAuthReady } from '../../../hooks/useAuthReady';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const UserProfile: NextPage = () => {
  const [transition, setTransition, user, authReady, setUser] = useAuthReady();
  const router = useRouter();
  const { isReady, replace } = router;

  useEffect(() => {
    if (!isReady || !user?.user_metadata.full_name) return;
    if (decodeURIComponent(location.pathname) === decodeURIComponent(`/userprofile/me/${user.user_metadata.full_name}`))
      return;
    replace(
      {
        query: { userprofile: user.user_metadata.full_name },
      },
      undefined,
    );
  }, [isReady, user?.user_metadata.full_name, replace]);

  if ((authReady && !user?.token?.access_token && user?.fauna_access_token?.secret) || !transition)
    return <LoadingSpinner>Loading User Profile</LoadingSpinner>;
  else if (transition && user) {
    return <UserSettings user={user} setUser={setUser} />;
  }
  return null;
};

export default UserProfile;
