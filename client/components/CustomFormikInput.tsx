import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  FormHelperText,
  FormControlProps,
  FormErrorMessageProps,
  FormLabelProps,
  HelpTextProps,
  InputProps,
} from '@chakra-ui/react';
import { useField } from 'formik';
import React, { FC } from 'react';

interface BaseProps extends FormControlProps {
  name: string;
  label?: string;
  labelProps?: FormLabelProps;
  helperText?: string;
  helperTextProps?: HelpTextProps;
  errorMessageProps?: FormErrorMessageProps;
}

type InputControlProps = BaseProps & { inputProps?: InputProps };

const CustomFormikInput: FC<InputControlProps> = (props: InputControlProps) => {
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

export { CustomFormikInput };
