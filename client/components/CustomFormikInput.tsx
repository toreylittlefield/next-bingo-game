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
  forwardRef,
} from '@chakra-ui/react';
import { useField } from 'formik';
import React, { FC } from 'react';

interface BaseProps extends FormControlProps {
  name: string;
  ref?: React.MutableRefObject<any>;
  label?: string;
  value?: string | number;
  labelProps?: FormLabelProps;
  helperText?: string;
  helperTextProps?: HelpTextProps;
  errorMessageProps?: FormErrorMessageProps;
}

type InputControlProps = BaseProps & { inputProps?: InputProps };

const CustomFormikInput: FC<InputControlProps> = forwardRef<InputControlProps, 'div'>(
  (props: InputControlProps, ref) => {
    const { name, value, label, inputProps, labelProps, helperText, helperTextProps, errorMessageProps, ...rest } =
      props;
    const [field, { error, touched }, helper] = useField({ name, value });

    return (
      <FormControl isInvalid={!!error && touched} {...rest}>
        <FormLabel htmlFor={name} {...labelProps}>
          {label}
        </FormLabel>

        <Input ref={ref} {...field} {...inputProps} label={label} name={name} />
        {error && <FormErrorMessage {...errorMessageProps}>{error}</FormErrorMessage>}
        {helperText && <FormHelperText {...helperTextProps}>{helperText}</FormHelperText>}
      </FormControl>
    );
  },
);

export { CustomFormikInput };
