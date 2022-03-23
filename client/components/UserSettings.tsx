import {
  Button,
  Grid,
  GridItem,
  Text,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  useColorModeValue,
  HStack,
  Avatar,
  AvatarBadge,
  IconButton,
  Center,
} from '@chakra-ui/react';
import React, { useRef, useState } from 'react';
import { Formik, Form, FormikHelpers, FormikValues } from 'formik';
import type { FaunaUpdateUserReqBody, LoggedInUser } from '../types/types';
import { CustomFormikInput } from './CustomFormikInput';
import Image from 'next/image';
import { updateUserYupSchemaFrontend } from '../lib/yup-schemas/yup-schemas';
import { AiFillCloseCircle } from 'react-icons/ai';
import LoadingSpinner from './LoadingSpinner';

const UserSettings = ({
  user,
  setUser,
}: {
  user: LoggedInUser;
  setUser: (value: React.SetStateAction<LoggedInUser | null>) => void;
}) => {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const initialFormState = user.faunaUser ? { ...user.faunaUser } : undefined;
  const [formState, setFormState] = useState(initialFormState);

  if (!formState?.name) return null;

  const { name, alias, icon, lastUpdated } = formState;

  const allowEdit = () => {
    if (lastUpdated && lastUpdated['@date']) {
      const today = new Date().getTime();
      const last = new Date(lastUpdated['@date']).getTime();
      const diff = (last - today) / (1000 * 60 * 60 * 24);
      return diff > 120;
    }
    return true;
  };

  const canEdit = allowEdit();

  const handleClickChangeAvatar = (event: React.MouseEvent) => {
    if (avatarInputRef.current) {
      avatarInputRef.current.click();
    }
    event.preventDefault();
  };

  const handleReadFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: any, shouldValidate?: boolean | undefined) => void,
  ) => {
    event.preventDefault();

    if (!event.target.files?.length || !avatarInputRef.current) return;

    const file = event.target.files[0];
    const reader = new FileReader();

    reader.addEventListener(
      'load',
      function () {
        // convert image file to base64 string
        if (reader.result) {
          setFormState((prev) => {
            if (!prev) return prev;
            return { ...prev, icon: reader.result as string };
          });
          setFieldValue('icon', reader.result);
        }
      },
      false,
    );

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  type FormValues = { lastUpdated: string; name: string; alias: string; icon: string };

  const handleFormSubmit: (
    values: FormValues,
    formikHelpers: FormikHelpers<FormValues>,
  ) => void | Promise<any> = async (values, { setSubmitting }) => {
    console.dir(user, { colors: true });
    const payload: FaunaUpdateUserReqBody = {
      ...values,
      fauna_access_token: user.fauna_access_token?.secret ?? '',
    };
    console.dir(payload, { colors: true });
    try {
      const res = await fetch('/api/fauna/userprofile/updateuserprofile', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token?.access_token}`,
        },
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = await res.json();
        setUser((prev) => {
          if (!prev?.faunaUser) return prev;
          return {
            ...prev,
            faunaUser: {
              ...prev.faunaUser,
            },
          };
        });
        console.log({ json });
      } else {
        const { status, statusText } = res;
        throw Error(JSON.stringify({ status, statusText }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    // <Grid h="200px" templateRows="repeat(1, 1fr)" templateColumns="repeat(1, 1fr)" gap={4}>
    <Formik
      initialValues={{
        ...formState,
        lastUpdated: formState.lastUpdated ? formState.lastUpdated['@date'] : '2021/01/01',
      }}
      validationSchema={canEdit === true ? updateUserYupSchemaFrontend : undefined}
      onSubmit={handleFormSubmit}
    >
      {({ setFieldValue, isSubmitting }) => (
        <Form>
          {isSubmitting ? (
            <LoadingSpinner
              centerProps={{ position: 'fixed', w: 'full', top: 0, display: 'grid', placeItems: 'center', zIndex: 100 }}
              spinnerProps={{ speed: '0.2s' }}
            >
              <Text>Submitting...</Text>
            </LoadingSpinner>
          ) : null}
          <Flex minH={'80vh'} align={'flex-start'} justify={'center'} bg={useColorModeValue('gray.50', 'gray.800')}>
            <Stack
              spacing={4}
              w={'full'}
              maxW={'2xl'}
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
                    <Avatar size="xl" src={icon}>
                      <AvatarBadge
                        as={IconButton}
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
                    <Button onClick={handleClickChangeAvatar} disabled={!canEdit || isSubmitting} w="full">
                      Change Icon
                    </Button>
                  </Center>
                </Stack>
              </FormControl>
              <CustomFormikInput
                isReadOnly={!canEdit}
                _placeholder={{ color: 'gray.500' }}
                inputProps={{ type: 'text' }}
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
                  onChange: (event) => handleReadFileChange(event, setFieldValue),
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
                isReadOnly
                placeholder="Last Updated"
                label="Last Updated"
                name="lastUpdated"
              />

              <Stack spacing={6} direction={['column', 'row']}>
                <Button
                  bg={'red.400'}
                  color={'white'}
                  w="full"
                  _hover={{
                    bg: 'red.500',
                  }}
                  isDisabled={isSubmitting || !canEdit}
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
                  type="submit"
                  isDisabled={isSubmitting || !canEdit}
                >
                  Submit
                </Button>
              </Stack>
            </Stack>
          </Flex>
        </Form>
      )}
    </Formik>
    // </Grid>
  );
};

export default UserSettings;
