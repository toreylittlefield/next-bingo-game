import { Button, Grid, GridItem, Text } from '@chakra-ui/react';
import React, { useReducer } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { UserProfile } from '../types/types';
import { CustomFormikInput } from './CustomFormikInput';

type ActionType =
  | { type: 'LOADING' }
  | { type: 'ERROR'; payload: string }
  | { type: 'UPDATE_USERNAME'; payload: string }
  | ((dispatch: React.Dispatch<ActionType>) => void);

type FormData = {
  username: string;
};

type StateType = {
  formData: FormData;
  loading: boolean;
  response: null;
  error: null | string;
};

const initialFormData: FormData = {
  username: '',
};

const initialState: StateType = {
  formData: initialFormData,
  loading: false,
  response: null,
  error: null,
};

const reducer = (state: StateType, action: ActionType) => {
  if (typeof action === 'function') return state;
  switch (action.type) {
    case 'UPDATE_USERNAME':
      return {
        ...state,
        formData: {
          ...state.formData,
          username: action.payload,
        },
      };
    case 'LOADING':
      return { ...state, loading: true };
    case 'ERROR':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

const UserSettings = ({ user }: UserProfile) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { formData } = state;

  const handlerUserNameInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'UPDATE_USERNAME', payload: event.target.value });
  };

  return (
    <Grid h="200px" templateRows="repeat(2, 1fr)" templateColumns="repeat(5, 1fr)" gap={4}>
      <GridItem rowSpan={2} colSpan={1} bg="tomato">
        <Text>User Profile</Text>
      </GridItem>
      <GridItem colSpan={2} bg="papayawhip">
        <Formik
          initialValues={{
            firstName: '',
            lastName: '',
            email: '',
            acceptedTerms: false, // added for our checkbox
            jobType: '', // added for our select
          }}
          validationSchema={Yup.object({
            firstName: Yup.string().max(15, 'Must be 15 characters or less').required('Required'),
            // lastName: Yup.string().max(20, 'Must be 20 characters or less').required('Required'),
            // email: Yup.string().email('Invalid email address').required('Required'),
            // acceptedTerms: Yup.boolean()
            //   .required('Required')
            //   .oneOf([true], 'You must accept the terms and conditions.'),
            // jobType: Yup.string()
            //   .oneOf(['designer', 'development', 'product', 'other'], 'Invalid Job Type')
            //   .required('Required'),
          })}
          onSubmit={async (values, { setSubmitting }) => {
            console.log('submit!');
            alert(JSON.stringify(values, null, 2));
            try {
              const res = await fetch('/api/fauna/updateuserprofile', {
                headers: {
                  Authorization: `Bearer ${user.token?.access_token}`,
                },
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
            <CustomFormikInput placeholder="User Name" label="User name" name="userName" />
            <CustomFormikInput placeholder="User Alias" label="User Alias" name="userAlias" />
            <CustomFormikInput placeholder="User Icon" label="User Icon" name="userIcon" />
            <CustomFormikInput placeholder="Last Updated" label="Last Updated" name="lastUpdated" />
            <Button type="submit">Save</Button>
          </Form>
        </Formik>
      </GridItem>
      <GridItem colSpan={2} bg="papayawhip" />
      <GridItem colSpan={4} bg="tomato">
        {JSON.stringify(user, null, 2)}
      </GridItem>
    </Grid>
  );
};

export default UserSettings;
