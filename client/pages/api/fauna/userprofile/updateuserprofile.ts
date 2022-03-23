/* code from functions/todos-create.js */
import faunadb from 'faunadb'; /* Import faunaDB sdk */
import type { NextApiHandler } from 'next';
import { updateFaunaUserProfile } from '../../../../lib/faunaApi/udfs/updateFaunaUserProfile';
import { updateUserYupSchemaFrontend } from '../../../../lib/yup-schemas/yup-schemas';
import type { FaunaUpdateUserReqBody } from '../../../../types/types';

/* export our lambda function as named "handler" export */
const handler: NextApiHandler = async (req, res) => {
  try {
    const netlifyIdentityToken = req.headers.authorization;

    const payload: FaunaUpdateUserReqBody = req.body;

    const faunaAccessToken = payload.fauna_access_token;

    if (req.method !== 'PATCH') return res.status(405).send('Method not allowed, use PATCH');

    if (!netlifyIdentityToken) return res.status(401).send('Not Authorized, No netlify Identity token');

    if (!faunaAccessToken) return res.status(401).send('Not Authorized, No fauna Token');

    /** when the user first registers and hasn't updated their user profile the lastUpdate will be false */
    if (payload.lastUpdated === false) payload.lastUpdated = '2021/10/13';
    console.dir(payload);

    const isValid = await updateUserYupSchemaFrontend.validate(payload);

    if (!isValid) return res.status(418).send('Invalid payload items');

    const faunaAccessClient = new faunadb.Client({
      domain: 'db.fauna.com',
      scheme: 'https',
      secret: payload.fauna_access_token,
    });

    const faunaRes = await updateFaunaUserProfile(faunaAccessClient, payload);

    if (!faunaRes) throw Error('Error Updating User Profile In Fauna');

    if (faunaRes?.result === false) {
      return res.status(400).json({ message: 'Cannot Update Fauna User Profile', ...faunaRes });
    }

    const { compareDates, result } = faunaRes;
    const { alias, icon, lastUpdated, name } = result.data;

    const resultData = { data: { alias, icon, lastUpdated, name } };
    const resPayload = { compareDates, result: resultData };

    return res.status(200).json(resPayload);
  } catch (error) {
    console.log('error', error);
    res.status(500).json({ message: JSON.stringify(error) });
  }
};

export default handler;
