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
import React, { useRef, useState } from 'react';
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

function setInitialValuesForForm(faunaUser: LoggedInUser['faunaUser'], lastUpdated: string): FormValues {
  return { ...faunaUser, lastUpdated, initialIcon: faunaUser.icon };
}

const UserSettings = ({
  user,
  setUser,
}: {
  user: LoggedInUser;
  setUser: (value: React.SetStateAction<LoggedInUser | null>) => void;
}) => {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const [readerResult, error, file, loading, setFile, resetFileReader] = useFileReader({
    readType: 'readAsDataURL',
  });

  const userCanEditDates = function closure(faunaUser: LoggedInUser['faunaUser']) {
    let lastUpdated = '2021/01/01';
    if (faunaUser.lastUpdated !== false) {
      lastUpdated = faunaUser.lastUpdated;
    }
    const countDays = (() => {
      const today = new Date().getTime();
      const last = new Date(lastUpdated).getTime();
      const diff = (today - last) / (1000 * 60 * 60 * 24);
      return diff;
    })();
    const allowEdit = () => {
      return countDays > 120;
    };
    return {
      daysRemaining: parseInt((120 - countDays).toString(), 10),
      canEdit: allowEdit(),
      lastUpdated: lastUpdated,
    };
  };

  const { canEdit, daysRemaining, lastUpdated } = userCanEditDates(user.faunaUser);

  const handleClickChangeAvatar = (event: React.MouseEvent) => {
    if (avatarInputRef.current) {
      avatarInputRef.current.click();
    }
    event.preventDefault();
  };

  const handleReadFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();

    if (!event.target.files?.length || !avatarInputRef.current) return;

    const fileFromReader = event.target.files[0];

    if (fileFromReader) {
      setFile(fileFromReader);
    }
  };

  const handleOpenPopover = () => setIsOpen((prev) => !prev);
  const handleClosePopover = () => setIsOpen(false);

  const handleFormSubmit = async (values: FormValues, { setSubmitting, setValues }: FormikHelpers<FormValues>) => {
    if (isConfirmed === false) {
      setIsConfirmed(true);
      setSubmitting(false);
      return;
    }
    try {
      if (isError) setIsError(false);
      if (isSuccess) setIsError(false);
      if (!user.token?.access_token) throw Error('No Identity Access Token Found');

      if (!values.icon) throw Error('No Image File Found');

      const { access_token } = user.token;

      const whiteSpaceToDash = values.name.trim().replace(/\s+/g, '-');
      const cloudinaryPayload = {
        public_id: `public-thumb-${whiteSpaceToDash}`,
        folder: whiteSpaceToDash,
        transformation: 'c_thumb,f_auto,q_auto,w_256',
      };

      const cloudinaryData = await postProfilePictureToCloudinary(file, access_token, cloudinaryPayload);

      const userProfilePayload = {
        name: values.name,
        alias: values.alias,
        lastUpdated: values.lastUpdated,
        icon: cloudinaryData?.secure_url ?? values.icon,
        fauna_access_token: user.fauna_access_token.secret,
      };

      const resUpdate = await updateUserProfile(userProfilePayload, access_token);
      if (!resUpdate?.result) {
        throw Error('Failed To Update User Profile');
      }
      const { data: updatedUser } = resUpdate.result;

      setValues({
        ...updatedUser,
        lastUpdated: updatedUser.lastUpdated,
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
        initialValues={setInitialValuesForForm(user.faunaUser, lastUpdated)}
        validationSchema={canEdit === true ? updateUserYupSchemaFrontend : undefined}
        onSubmit={handleFormSubmit}
      >
        {({ isSubmitting, errors, handleReset, values }) => {
          return (
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
                        <Avatar size="2xl" src={(readerResult as string) ?? values.icon}>
                          <AvatarBadge
                            as={IconButton}
                            onClick={() => resetFileReader(values.initialIcon)}
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
                          resetFileReader(values.initialIcon);
                          handleReset();
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
          );
        }}
      </Formik>
    </Grid>
  );
};

export default UserSettings;
