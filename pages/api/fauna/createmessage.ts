/* code from functions/todos-create.js */
import faunadb, { Collection, Create } from 'faunadb'; /* Import faunaDB sdk */
import type { NextApiRequest, NextApiResponse } from 'next';

/* configure faunaDB Client with our secret */
const q = faunadb.query;
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SERVER_KEY as string,
});

type Data = {
  message: string | object;
};

interface Message {
  userName: string;
  message: string;
}

/* export our lambda function as named "handler" export */
export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  try {
    /* parse the string body into a useable JS object */
    const { message, userName }: Message = req.body;
    console.log('Function `create-message` invoked', message, userName);
    const data = { message, userName };
    /* construct the fauna query */
    const response = await client.query(Create(Collection('chat-messages-collection'), { data }));
    console.log('success', response);
    return res.status(200).json({ message: JSON.stringify(response) });
  } catch (error) {
    console.log('error', error);
    res.status(400).json({ message: JSON.stringify(error) });
  }
}
