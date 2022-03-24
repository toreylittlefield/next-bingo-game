import faunadb from 'faunadb';
import type { FaunaNewUserApiResponse, UpdateFaunaSuccessRes } from '../../../types/types';
const { Call } = faunadb.query;

export async function updateFaunaUserProfile(
  faunaAccessClient: faunadb.Client,
  { name, alias, icon }: { name: string; alias: string; icon: string },
): Promise<FaunaNewUserApiResponse> {
  try {
    const { compareDates, result } = (await faunaAccessClient.query(
      Call('update_user', [name, alias, icon]),
    )) as UpdateFaunaSuccessRes;
    if (result === false) {
      return { result, compareDates };
    }
    if (result && result.data.lastUpdated !== false) {
      const setDate = result.data.lastUpdated['@date'];
      const data = { ...result.data, lastUpdated: setDate };
      return { compareDates, result: { data } };
    }
  } catch (error) {
    console.error(error);
    return undefined;
  }
}
