import type { NextApiHandler } from 'next';

import { v2 as cloudinary } from 'cloudinary';

interface CloudinarySignaturePayload {
  folder: string;
  secure: boolean;
}

const handler: NextApiHandler = async (req, res) => {
  const payload: CloudinarySignaturePayload = JSON.parse(req.body);

  function sortObjAZ(originalObj: Record<string | number, any>) {
    return Object.keys(originalObj)
      .sort()
      .reduce((acc: Record<string | number, any>, key) => {
        acc[key] = originalObj[key];
        return acc;
      }, {});
  }

  // Get the timestamp in seconds
  const timestamp = Math.round(new Date().getTime() / 1000);

  const sortedPayload = sortObjAZ({ ...payload, timestamp });
  console.dir(sortedPayload, { colors: true });
  // Get the signature using the Node.js SDK method api_sign_request
  const signature = cloudinary.utils.api_sign_request(
    {
      ...sortedPayload,
      // timestamp,
    },
    process.env.CLOUDINARY_API_SECRET as string,
  );

  res.statusCode = 200;
  res.json({ signature, timestamp });
};

export default handler;
