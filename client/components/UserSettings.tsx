import {
  Alert,
  AlertIcon,
  Avatar,
  AvatarBadge,
  Button,
  ButtonProps,
  Center,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Heading,
  IconButton,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { Form, Formik, FormikHelpers } from 'formik';
import React, { useCallback, useRef, useState } from 'react';
import { AiFillCloseCircle } from 'react-icons/ai';
import { useFileReader } from '../hooks/useFileReader';
import { postProfilePictureToCloudinary, updateUserProfile } from '../lib/api/fetch-functions';
import { updateUserYupSchemaFrontend } from '../lib/yup-schemas/yup-schemas';
import type { CloudinaryUploadUserImageResponse } from '../types/cloudinary';
import type { LoggedInUser } from '../types/types';
import { CustomFormikInput } from './CustomFormikInput';
import LoadingSpinner from './LoadingSpinner';
import { PopoverMenu } from './PopoverMenu';

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
    onloadCB: useCallback((result, file) => {
      setFormState((prev) => ({ ...prev, icon: result, imageFile: file }));
    }, []),
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
  };

  const handleOpenPopover = () => setIsOpen((prev) => !prev);
  const handleClosePopover = () => setIsOpen(false);

  const handleFormSubmit: (
    values: FormValues,
    formikHelpers: FormikHelpers<FormValues>,
  ) => void | Promise<any> = async (values, { setSubmitting, setFieldValue, setFieldTouched }) => {
    if (isConfirmed === false) {
      setIsConfirmed(true);
      setSubmitting(false);
      return;
    }
    try {
      if (isError) setIsError(false);
      if (isSuccess) setIsError(false);
      if (!user.token?.access_token) throw Error('No Identity Access Token Found');

      const { access_token } = user.token;

      const normalizeName = values.name.trim().replace(/\s+/g, '-');
      const cloudinaryPayload = {
        public_id: `public-thumb-${normalizeName}`,
        folder: normalizeName,
        transformation: 'c_thumb,f_auto,q_auto,w_256',
      };

      const cloudinaryData: CloudinaryUploadUserImageResponse = await postProfilePictureToCloudinary(
        formState.imageFile,
        access_token,
        cloudinaryPayload,
      );
      if (!cloudinaryData) throw Error('Error Uploading To Image');

      const userProfilePayload = {
        name: values.name,
        alias: values.alias,
        lastUpdated: values.lastUpdated,
        icon: cloudinaryData.secure_url,
        fauna_access_token: user.fauna_access_token.secret,
      };

      const resUpdate = await updateUserProfile(userProfilePayload, access_token);
      if (!resUpdate?.result) {
        throw Error('Failed To Update User Profile');
      }
      const { data: updatedUser } = resUpdate.result;

      setFieldValue('lastUpdated', updatedUser.lastUpdated);
      setFormState({
        ...updatedUser,
        lastUpdated: updatedUser.lastUpdated,
        imageFile: updatedUser.icon,
        initialIcon: updatedUser.icon,
      });
      setUser((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          faunaUser: {
            ...updatedUser,
          },
        };
      });
      setIsSuccess(true);
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
        {({ isSubmitting, errors, handleReset }) => (
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
                  isInvalid={false}
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
