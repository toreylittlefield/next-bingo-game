import { Button, Grid, GridItem, Text } from '@chakra-ui/react';
import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import type { UserProfile } from '../types/types';
import { CustomFormikInput } from './CustomFormikInput';
import Image from 'next/image';

const UserSettings = ({ user }: UserProfile) => {
  if (!user.faunaUser) return null;
  const { name, alias, icon, lastUpdated } = user.faunaUser;
  return (
    <Grid h="200px" templateRows="repeat(2, 1fr)" templateColumns="repeat(5, 1fr)" gap={4}>
      <GridItem rowSpan={2} colSpan={1} bg="tomato">
        <Text>User Profile</Text>
      </GridItem>
      <GridItem colSpan={2} bg="papayawhip">
        <Formik
          initialValues={{
            name,
            alias,
            icon,
            lastUpdated: lastUpdated ? lastUpdated.value : 'Never',
          }}
          validationSchema={Yup.object({
            user: Yup.string().min(5, 'Must be 15 characters or less').required('Required'),
            alias: Yup.string().max(20, 'Must be 20 characters or less').required('Required'),
            icon: Yup.string().url('Must Be A Valid Image URL').required('Required'),
            lastUpdated: Yup.string().required('Required'),
          })}
          onSubmit={async (values, { setSubmitting }) => {
            console.log('submit!');
            alert(JSON.stringify(values, null, 2));
            try {
              const res = await fetch('/api/fauna/updateuserprofile', {
                headers: {
                  Authorization: `Bearer ${user.token?.access_token}`,
                },
                method: 'PATCH',
              });
              if (res.ok) {
                const json = await res.json();
                console.log({ json });
              }
              throw Error(res.statusText);
            } catch (error) {
              console.error(error);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <Form>
            <CustomFormikInput placeholder="User Name" label="User name" name="user" />
            <CustomFormikInput placeholder="User Alias" label="User Alias" name="alias" />
            <CustomFormikInput placeholder="User Icon" label="User Icon" name="icon" />
            <CustomFormikInput placeholder="Last Updated" label="Last Updated" name="lastUpdated" />
            <Button type="submit">Save</Button>
          </Form>
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
