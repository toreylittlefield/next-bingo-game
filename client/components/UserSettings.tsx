import { Button, Grid, GridItem, Text } from '@chakra-ui/react';
import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import type { FaunaUpdateUserReqBody, UserProfile } from '../types/types';
import { CustomFormikInput } from './CustomFormikInput';
import Image from 'next/image';
import { updateUserYupSchema } from '../lib/yup-schemas/yup-schemas';

const UserSettings = ({ user }: UserProfile) => {
  if (!user.faunaUser) return null;

  const { name, alias, icon, lastUpdated } = user.faunaUser;

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
            lastUpdated: lastUpdated ? lastUpdated['@date'] : 'Never',
          }}
          validationSchema={canEdit === true ? updateUserYupSchema : undefined}
          onSubmit={async (values, { setSubmitting }) => {
            console.log('submit!');
            alert(JSON.stringify(values, null, 2));
            const payload: FaunaUpdateUserReqBody = { ...values, access_token: user.token?.access_token ?? '' };
            try {
              const res = await fetch('/api/fauna/updateuserprofile', {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${user.token?.access_token}`,
                },
                method: 'PATCH',
                body: JSON.stringify(payload),
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
            <CustomFormikInput isReadOnly={!canEdit} placeholder="Full Name" label="Full name" name="name" />
            <CustomFormikInput isReadOnly={!canEdit} placeholder="User Alias" label="User Alias" name="alias" />
            <CustomFormikInput isReadOnly={!canEdit} placeholder="User Avatar" label="User Avatar" name="icon" />
            <CustomFormikInput isReadOnly placeholder="Last Updated" label="Last Updated" name="lastUpdated" />
            <Button disabled={!canEdit} type="submit">
              Save
            </Button>
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
