import type { NextApiHandler } from 'next/types';
import verifyFaunaRefreshToken from '../../../../lib/faunaApi/verifyFauna';
import { FaunaCreateBoardRequestBody } from '../../../../types/types';
import faunadb from 'faunadb';
const { Call } = faunadb.query;
import { createBoardYupSchema } from '../../../../lib/yup-schemas/yup-schemas';

const handler: NextApiHandler = async (req, res) => {
  try {
    const payload: FaunaCreateBoardRequestBody = req.body;
    const { fn_tkn } = req.cookies;

    if (!payload.access_token) return res.status(401).send('Invalid access token');

    const isValid = await verifyFaunaRefreshToken(fn_tkn);

    if (!isValid) return res.status(401).send('Not Signed / Invalid Token');

    console.log({ payload });
    const isValidSchema = await createBoardYupSchema.validate(payload);
    if (!isValidSchema) return res.status(400).send('Not a valid board bitttchhhh');

    const faunaAccessClient = new faunadb.Client({
      secret: payload.access_token,
      domain: 'db.fauna.com',
      scheme: 'https',
    });

    const faunaRes = await faunaAccessClient.query(Call('create_board', [payload.title, payload.board]));

    if (!faunaRes) return res.status(400).send('Could Not Create Board In Fauna');
    return res.status(200).json({ ...faunaRes });
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
};

export default handler;
