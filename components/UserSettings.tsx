import React from 'react';
import { UserProfile } from '../types/types';

const UserSettings = ({ user }: UserProfile) => {
  return <div>{JSON.stringify(user, null, 2)}</div>;
};

export default UserSettings;
