import { NextPage } from 'next';
import UserSettings from '../../components/UserSettings';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuthReady } from '../../hooks/useAuthReady';

const UserProfile: NextPage = () => {
  const [transition, setTransition, user, authReady] = useAuthReady();

  if ((authReady && !user?.token?.access_token) || !transition)
    return <LoadingSpinner>Loading User Profile</LoadingSpinner>;
  else if (transition && user) {
    return <UserSettings user={user} />;
  }
  return null;
};

export default UserProfile;
