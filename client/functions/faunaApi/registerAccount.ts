import { serverClient } from './server';
import faunadb from 'faunadb';
import { CombineMetaDataFunction, LoggedInResponse, UserLoginDataRes } from '../../types/types';
const { Call } = faunadb.query;

export async function createAccount(
  userId: string,
  password: string,
  userName: string,
  userAlias: string,
  userIcon: string,
  combineCallback: CombineMetaDataFunction,
): Promise<UserLoginDataRes> {
  try {
    const { user, tokens } = (await serverClient.query(
      Call('register', userId, password, userName, userAlias, userIcon),
    )) as LoggedInResponse;
    return combineCallback({ user, tokens });
  } catch (error) {
    return { app_metadata: null };
  }
}
