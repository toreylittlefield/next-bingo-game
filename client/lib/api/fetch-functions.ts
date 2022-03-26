import { CloudinaryUploadUserImageResponse } from '../../types/cloudinary';
import type { FaunaUpdateUserReqBody, UpdateFaunaExistingUserResponse } from '../../types/types';
import { apiRequest } from './apiservice';

export type APIServiceReturnCloudinarySignature = { signature: string; timestamp: string };

export async function getSignatureFromCloudinary(payload: object, identityAccessToken: string) {
  try {
    const response = await apiRequest<APIServiceReturnCloudinarySignature>({
      url: '/api/cloudinary/sign',
      method: 'POST',
      identityAccessToken: identityAccessToken,
      options: { body: JSON.stringify(payload) },
    });
    if (!response) throw Error('Error Fetching Signature For Cloudinary');
    const { signature, timestamp } = response;
    return { signature, timestamp };
  } catch (error) {
    console.error(error);
  }
}

export type APIServiceReturnUpdateUserProfile = UpdateFaunaExistingUserResponse | undefined;

export async function updateUserProfile(payload: FaunaUpdateUserReqBody, identityAccessToken: string) {
  try {
    const response = await apiRequest<APIServiceReturnUpdateUserProfile>({
      url: '/api/fauna/userprofile/updateuserprofile',
      method: 'PATCH',
      identityAccessToken: identityAccessToken,
      options: { body: JSON.stringify(payload) },
    });
    if (!response) throw Error('Error Updating User Profile');
    return response;
  } catch (error) {
    console.error(error);
  }
}

type PayloadCloudinary = {
  public_id: string;
  folder: string;
  transform: string;
};

type CloudinaryResponseType = CloudinaryUploadUserImageResponse | undefined;

export async function postProfilePictureToCloudinary(
  file: File | null,
  access_token: string,
  cloudinaryPayload: Partial<PayloadCloudinary>,
): Promise<CloudinaryResponseType> {
  try {
    if (!file) return;

    const url = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`;

    const singatureRes = await getSignatureFromCloudinary(cloudinaryPayload, access_token);
    if (!singatureRes) throw Error('Failed to create signature');
    const { signature, timestamp } = singatureRes;

    const formData = new FormData();

    formData.append('file', file);
    formData.append('signature', signature);
    formData.append('timestamp', timestamp);
    Object.entries(cloudinaryPayload).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_KEY as string);

    const response = await fetch(url, {
      method: 'post',
      body: formData,
    });
    if (response.ok) {
      const json = await response.json();
      return json;
    }
    throw Error(
      JSON.stringify({ message: 'Failed to post to cloudinary', response: JSON.stringify(response, null, 2) }),
    );
  } catch (error) {
    console.error(error);
  }
}
