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
import { Formik, Form, prepareDataForValidation } from 'formik';
import type { FaunaUpdateUserReqBody, UserProfile } from '../types/types';
import { CustomFormikInput } from './CustomFormikInput';
import Image from 'next/image';
import { updateUserYupSchema } from '../lib/yup-schemas/yup-schemas';
import { AiFillCloseCircle } from 'react-icons/ai';

const UserSettings = ({ user }: UserProfile) => {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const initialFormState = user.faunaUser ? { ...user.faunaUser } : undefined;
  const [formState, setFormState] = useState(initialFormState);

  if (!formState?.name || !user.faunaUser) return null;

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

  const handleReadFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();

    if (!event.target.files?.length) return;

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
        }
      },
      false,
    );

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  return (
    <Grid h="200px" templateRows="repeat(2, 1fr)" templateColumns="repeat(5, 1fr)" gap={4}>
      <GridItem rowSpan={2} colSpan={1} bg="tomato">
        <Text>User Profile</Text>
      </GridItem>
      <GridItem colSpan={2} bg="papayawhip">
        <Formik
          initialValues={{
            ...user.faunaUser,
            lastUpdated: user.faunaUser.lastUpdated ? user.faunaUser.lastUpdated['@date'] : '2021/01/01',
          }}
          validationSchema={canEdit === true ? updateUserYupSchema : undefined}
          onSubmit={async (values, { setSubmitting }) => {
            console.log('submit!');
            alert(JSON.stringify(values, null, 2));
            // const payload: FaunaUpdateUserReqBody = { ...values, access_token: user.token?.access_token ?? '' };
            await new Promise<void>((resolve, reject) => {
              setTimeout(() => resolve(), 250);
            });
            // try {
            //   const res = await fetch('/api/fauna/updateuserprofile', {
            //     headers: {
            //       'Content-Type': 'application/json',
            //       Authorization: `Bearer ${user.token?.access_token}`,
            //     },
            //     method: 'PATCH',
            //     body: JSON.stringify(payload),
            //   });
            //   if (res.ok) {
            //     const json = await res.json();
            //     console.log({ json });
            //   }
            //   throw Error(res.statusText);
            // } catch (error) {
            //   console.error(error);
            // } finally {
            //   setSubmitting(false);
            // }
            setSubmitting(false);
          }}
        >
          {({ values, errors }) => (
            <Form>
              {JSON.stringify({ values, errors }, null, 2)}

              <Flex minH={'100vh'} align={'center'} justify={'center'} bg={useColorModeValue('gray.50', 'gray.800')}>
                <Stack
                  spacing={4}
                  w={'full'}
                  maxW={'md'}
                  bg={useColorModeValue('white', 'gray.700')}
                  rounded={'xl'}
                  boxShadow={'lg'}
                  p={6}
                  my={12}
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
                        <Button onClick={handleClickChangeAvatar} disabled={!canEdit} w="full">
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
                    isRequired
                  />
                  <CustomFormikInput
                    _placeholder={{ color: 'gray.500' }}
                    inputProps={{ type: 'text' }}
                    isReadOnly={!canEdit}
                    placeholder="User Alias"
                    label="User Alias"
                    name="alias"
                    isRequired
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
                    >
                      Submit
                    </Button>
                  </Stack>
                </Stack>
              </Flex>
            </Form>
          )}
        </Formik>
      </GridItem>
      <GridItem colSpan={2} bg="papayawhip">
        {/* @toreylittlefield TODO add images to cloudinary  */}
        <img
          src={icon}
          alt={`Avatar of ${alias}`}
          // layout="intrinsic"
          height="100%"
          width="100%"
        />
      </GridItem>
      <GridItem colSpan={4} bg="tomato">
        {JSON.stringify(user, null, 2)}
      </GridItem>
    </Grid>
  );
};

export default UserSettings;
