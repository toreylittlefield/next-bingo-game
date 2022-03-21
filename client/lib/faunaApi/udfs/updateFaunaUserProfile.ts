import faunadb from 'faunadb';
import type { UpdateFaunaUserResponse, FaunaUpdateUserApiResponse } from '../../../types/types';
const { Call } = faunadb.query;

export async function updateFaunaUserProfile(
  faunaAccessClient: faunadb.Client,
  { name, alias, icon }: { name: string; alias: string; icon: string },
): Promise<FaunaUpdateUserApiResponse> {
  try {
    const { compareDates, result } = (await faunaAccessClient.query(
      Call('update_user', [name, alias, icon]),
    )) as UpdateFaunaUserResponse;
    return { result, compareDates };
  } catch (error) {
    console.error(error);
    return undefined;
  }
}
