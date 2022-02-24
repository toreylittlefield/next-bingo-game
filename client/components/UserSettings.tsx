import {
  Button,
  ComponentWithAs,
  FormControl,
  FormControlProps,
  FormErrorMessage,
  FormErrorMessageProps,
  FormHelperText,
  FormLabel,
  FormLabelProps,
  Grid,
  GridItem,
  HelpTextProps,
  Input,
  InputProps,
  Text,
} from '@chakra-ui/react';
import React, { FC, useReducer, useContext } from 'react';
import netlifyIdentity from 'netlify-identity-widget';
import { Formik, Form, useField, FormikProps, FieldHookConfig } from 'formik';
import * as Yup from 'yup';
import { UserProfile } from '../types/types';

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

  interface BaseProps extends FormControlProps {
    name: string;
    label?: string;
    labelProps?: FormLabelProps;
    helperText?: string;
    helperTextProps?: HelpTextProps;
    errorMessageProps?: FormErrorMessageProps;
  }

  type InputControlProps = BaseProps & { inputProps?: InputProps };

  const CustomInput: FC<InputControlProps> = (props: InputControlProps) => {
    const { name, label, inputProps, labelProps, helperText, helperTextProps, errorMessageProps, ...rest } = props;
    const [field, { error, touched }, helper] = useField(name);
    return (
      <FormControl isInvalid={!!error && touched} isRequired {...rest}>
        <FormLabel htmlFor={name} {...labelProps}>
          {label}
        </FormLabel>

        <Input {...field} {...inputProps} label={label} name={name} />
        {error && <FormErrorMessage {...errorMessageProps}>{error}</FormErrorMessage>}
        {helperText && <FormHelperText {...helperTextProps}>{helperText}</FormHelperText>}
      </FormControl>
    );
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
            <CustomInput placeholder="First name" label="First name" name="firstName" />
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
