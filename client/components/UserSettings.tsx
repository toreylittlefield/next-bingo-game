import {
  Button,
  Grid,
  Text,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Stack,
  useColorModeValue,
  Avatar,
  AvatarBadge,
  IconButton,
  Center,
  ButtonProps,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import React, { useRef, useState } from 'react';
import { Formik, Form, FormikHelpers } from 'formik';
import type {
  CloudinaryUploadUserImageResponse,
  FaunaUpdateExistingUserApiResponse,
  FaunaUpdateUserReqBody,
  LoggedInUser,
} from '../types/types';
import { CustomFormikInput } from './CustomFormikInput';
import { updateUserYupSchemaFrontend } from '../lib/yup-schemas/yup-schemas';
import { AiFillCloseCircle } from 'react-icons/ai';
import LoadingSpinner from './LoadingSpinner';
import { PopoverMenu } from './PopoverMenu';
import Image from 'next/image';
import { useFileReader } from '../hooks/useFileReader';

type GenericButtonProps = {
  buttonText?: string;
  buttonProps?: ButtonProps;
};

type FormValues = {
  lastUpdated: string;
  name: string;
  alias: string;
  icon: string;
  imageFile: File | string;
  initialIcon: string;
};

const ButtonClose = ({ buttonProps, buttonText }: GenericButtonProps) => (
  <Button {...buttonProps} variant="outline">
    {buttonText ?? 'Cancel'}
  </Button>
);

const ButtonSubmit = ({ buttonProps, buttonText }: GenericButtonProps) => (
  <Button {...buttonProps} colorScheme="red">
    {buttonText ?? 'Apply'}
  </Button>
);

const ConfirmationMessage = () => {
  return (
    <>
      <Text fontStyle={'normal'}>Are you sure you want to update your profile?</Text>
      <Text as="em">
        You can only do this once every <strong>120 days</strong>
      </Text>
    </>
  );
};

function getInitialFormState(faunaUser: LoggedInUser['faunaUser']) {
  let lastUpdated;
  if (faunaUser.lastUpdated) {
    lastUpdated = faunaUser.lastUpdated;
  } else lastUpdated = '2021/01/01';
  return { ...faunaUser, lastUpdated, imageFile: faunaUser.icon, initialIcon: faunaUser.icon };
}

const UserSettings = ({
  user,
  setUser,
}: {
  user: LoggedInUser;
  setUser: (value: React.SetStateAction<LoggedInUser | null>) => void;
}) => {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [formState, setFormState] = useState<FormValues>(getInitialFormState(user.faunaUser));
  const [isOpen, setIsOpen] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const { icon, lastUpdated } = formState;

  const [readerResult, error, file, loading, setFile] = useFileReader({
    readType: 'readAsDataURL',
    onloadCB: (result, file) => setFormState((prev) => ({ ...prev, icon: result as string, imageFile: file })),
  });

  const countDays = (() => {
    const today = new Date().getTime();
    const last = new Date(lastUpdated).getTime();
    const diff = (today - last) / (1000 * 60 * 60 * 24);
    return diff;
  })();

  const daysRemaining = parseInt((120 - countDays).toString(), 10);

  const allowEdit = () => {
    return countDays > 120;
  };

  const canEdit = allowEdit();

  const handleClickChangeAvatar = (event: React.MouseEvent) => {
    if (avatarInputRef.current) {
      avatarInputRef.current.click();
    }
    event.preventDefault();
  };

  const handleReadFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();

    if (!event.target.files?.length || !avatarInputRef.current) return;

    const file = event.target.files[0];

    if (file) {
      setFile(file);
    }
    // const reader = new FileReader();

    // reader.addEventListener(
    //   'load',
    //   function () {
    //     // convert image file to base64 string
    //     if (reader.result) {
    //       setFormState((prev) => ({ ...prev, icon: reader.result as string, imageFile: file }));
    //     }
    //   },
    //   false,
    // );

    // if (file) {
    //   reader.readAsDataURL(file);
    // }
  };

  const handleOpenPopover = () => setIsOpen((prev) => !prev);
  const handleClosePopover = () => setIsOpen(false);

  async function getSignature(payload: object) {
    try {
      const response = await fetch('/api/cloudinary/sign', {
        headers: {
          Authorization: `Bearer ${user.token?.access_token}`,
        },
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const data = await response.json();
        const { signature, timestamp } = data;
        return { signature, timestamp };
      }
      throw Error(response.status.toString());
    } catch (error) {
      console.error(error);
    }
  }

  async function postImageToCloudinary(file: File | string, name: string) {
    try {
      if (!file) return;
      const url = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`;

      const normalizeName = name.replace(/\s+/g, '-');
      const payload = {
        public_id: `public-thumb-${normalizeName}`,
        folder: normalizeName,
        transformation: 'c_thumb,f_auto,q_auto,w_256',
      };

      const singatureRes = await getSignature(payload);
      if (!singatureRes) throw Error('Failed to create signature');
      const { signature, timestamp } = singatureRes;

      const formData = new FormData();

      formData.append('file', file);
      formData.append('signature', signature);
      formData.append('timestamp', timestamp);
      Object.entries(payload).forEach(([key, value]) => {
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

  const handleFormSubmit: (
    values: FormValues,
    formikHelpers: FormikHelpers<FormValues>,
  ) => void | Promise<any> = async (values, { setSubmitting }) => {
    if (isConfirmed === false) {
      setIsConfirmed(true);
      setSubmitting(false);
      return;
    }
    try {
      if (isError) setIsError(false);
      if (isSuccess) setIsError(false);
      const cloudinaryData: CloudinaryUploadUserImageResponse = await postImageToCloudinary(
        formState.imageFile,
        values.name,
      );
      if (!cloudinaryData) throw Error('Error Uploading To Image');

      const payload: FaunaUpdateUserReqBody = {
        name: values.name,
        alias: values.alias,
        lastUpdated: values.lastUpdated,
        icon: cloudinaryData.secure_url,
        fauna_access_token: user.fauna_access_token.secret,
      };
      const res = await fetch('/api/fauna/userprofile/updateuserprofile', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token?.access_token}`,
        },
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json: FaunaUpdateExistingUserApiResponse = await res.json();
        if (!json?.result) throw Error(`Failed To Update User: ${JSON.stringify(json, null, 2)}`);

        const { alias, icon, lastUpdated, name } = json.result.data;

        const updatedFaunaUserState = { alias, icon, lastUpdated, name };

        setFormState({
          ...updatedFaunaUserState,
          imageFile: updatedFaunaUserState.icon,
          initialIcon: updatedFaunaUserState.icon,
        });
        setUser((prev) => {
          if (!prev?.faunaUser) return prev;
          return {
            ...prev,
            faunaUser: {
              ...updatedFaunaUserState,
            },
          };
        });
        setIsSuccess(true);
      } else {
        const { status, statusText } = res;
        throw Error(JSON.stringify({ status, statusText }));
      }
    } catch (error) {
      console.error(error);
      setIsError(true);
    } finally {
      setSubmitting(false);
      setIsConfirmed(false);
    }
  };

  const handleCloseConfirmation = () => {
    setIsConfirmed(false);
    handleClosePopover();
  };

  return (
    <Grid templateRows="repeat(1, 1fr)" templateColumns="repeat(1, 1fr)" gap={4}>
      <Formik
        initialValues={formState}
        validationSchema={canEdit === true ? updateUserYupSchemaFrontend : undefined}
        onSubmit={handleFormSubmit}
      >
        {({ isSubmitting, errors, initialValues, handleReset, submitForm }) => (
          <Form>
            {isSubmitting ? (
              <LoadingSpinner
                centerProps={{
                  position: 'fixed',
                  w: 'full',
                  top: 0,
                  display: 'grid',
                  placeItems: 'center',
                  zIndex: 100,
                }}
                spinnerProps={{ speed: '0.2s' }}
              >
                Submitting...
              </LoadingSpinner>
            ) : null}
            <Flex
              minH={'80vh'}
              align={'flex-start'}
              justify={'center'}
              // eslint-disable-next-line react-hooks/rules-of-hooks
              bg={useColorModeValue('gray.50', 'gray.800')}
            >
              <Stack
                spacing={4}
                w={'full'}
                maxW={'2xl'}
                // eslint-disable-next-line react-hooks/rules-of-hooks
                bg={useColorModeValue('white', 'gray.700')}
                rounded={'xl'}
                boxShadow={'lg'}
                p={6}
                my={6}
              >
                <Heading lineHeight={1.1} fontSize={{ base: '2xl', sm: '3xl' }}>
                  User Profile Edit
                </Heading>
                <FormControl id="userName">
                  <FormLabel>User Avatar</FormLabel>
                  <Stack direction={['column', 'row']} spacing={6}>
                    <Center>
                      <Avatar size="2xl" src={icon}>
                        <AvatarBadge
                          as={IconButton}
                          onClick={() =>
                            setFormState((prev) => ({ ...prev, icon: prev.initialIcon, imageFile: prev.initialIcon }))
                          }
                          size="sm"
                          rounded="full"
                          top="-10px"
                          colorScheme="red"
                          aria-label="remove Image"
                          icon={<AiFillCloseCircle />}
                        />
                      </Avatar>
                    </Center>
                    <Center w="full">
                      <Button onClick={handleClickChangeAvatar} disabled={!canEdit || isSubmitting} w="xs">
                        Change Icon
                      </Button>
                    </Center>
                  </Stack>
                </FormControl>
                <CustomFormikInput
                  isReadOnly={!canEdit}
                  _placeholder={{ color: 'gray.500' }}
                  inputProps={{ type: 'text', autoFocus: true }}
                  placeholder="Full Name"
                  label="Full name"
                  name="name"
                  helperText="Enter Your Full Name"
                  isRequired
                  isDisabled={isSubmitting}
                />
                <CustomFormikInput
                  _placeholder={{ color: 'gray.500' }}
                  inputProps={{ type: 'text' }}
                  isReadOnly={!canEdit}
                  placeholder="User Alias"
                  label="User Alias"
                  name="alias"
                  isRequired
                  isDisabled={isSubmitting}
                />
                <CustomFormikInput
                  ref={avatarInputRef}
                  hidden
                  _placeholder={{ color: 'gray.500' }}
                  inputProps={{
                    type: 'file',
                    value: '',
                    onChange: handleReadFileChange,
                    accept: 'image/*',
                  }}
                  isReadOnly={!canEdit}
                  placeholder="User Avatar"
                  label="User Avatar"
                  name="icon"
                />

                <CustomFormikInput
                  _placeholder={{ color: 'gray.500' }}
                  inputProps={{ type: 'text' }}
                  helperText={!canEdit ? `You can update your profile in ${daysRemaining} days` : ''}
                  isReadOnly
                  placeholder="Last Updated"
                  label="Last Updated"
                  name="lastUpdated"
                />
                <PopoverMenu
                  popOverBodyText={<ConfirmationMessage />}
                  handlePopoverCloseButton={handleCloseConfirmation}
                  buttonCancel={
                    <ButtonClose
                      buttonProps={{
                        onClick: handleCloseConfirmation,
                      }}
                    />
                  }
                  buttonSubmit={
                    <ButtonSubmit
                      buttonProps={{
                        type: 'submit',
                        // onClick: submitForm,
                        onClick: handleClosePopover,
                      }}
                    />
                  }
                  close={handleClosePopover}
                  isOpen={isOpen}
                >
                  <Stack spacing={6} direction={['column', 'row']}>
                    <Button
                      bg={'red.400'}
                      color={'white'}
                      w="full"
                      _hover={{
                        bg: 'red.500',
                      }}
                      isDisabled={isSubmitting || !canEdit}
                      onClick={() => {
                        handleReset();
                        setFormState((prev) => ({ ...prev, icon: prev.initialIcon, imageFile: prev.initialIcon }));
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      bg={'blue.400'}
                      color={'white'}
                      w="full"
                      _hover={{
                        bg: 'blue.500',
                      }}
                      onClick={handleOpenPopover}
                      type="submit"
                      isDisabled={isSubmitting || !canEdit}
                    >
                      Submit
                    </Button>
                  </Stack>
                </PopoverMenu>
                {isError ? (
                  <Alert status="error">
                    <AlertIcon />
                    There was an error updating your profile
                  </Alert>
                ) : null}
                {isSuccess ? (
                  <Alert status="success">
                    <AlertIcon />
                    Profile Successfully Updated!
                  </Alert>
                ) : null}
              </Stack>
            </Flex>
          </Form>
        )}
      </Formik>
    </Grid>
  );
};

export default UserSettings;
