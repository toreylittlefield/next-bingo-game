import { NextPage } from 'next';
import UserSettings from '../../components/UserSettings';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuthReady } from '../../hooks/useAuthReady';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const UserProfile: NextPage = () => {
  const [transition, setTransition, user, authReady] = useAuthReady();
  const router = useRouter();
  const { isReady, replace } = router;

  useEffect(() => {
    if (!isReady || !user?.user_metadata.full_name) return;
    const origin = window.location.origin;
    const href = window.location.href;
    const userprofileURL = origin + `/userprofile/me?userprofile=${user?.user_metadata.full_name}`;
    if (href === userprofileURL) return;
    replace(href, origin + `/userprofile/me?userprofile=${user?.user_metadata.full_name}`, { shallow: true });
  }, [isReady, user?.user_metadata.full_name, replace]);

  if ((authReady && !user?.token?.access_token) || !transition)
    return <LoadingSpinner>Loading User Profile</LoadingSpinner>;
  else if (transition && user) {
    return <UserSettings user={user} />;
  }
  return null;
};

export default UserProfile;
