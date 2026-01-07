import React from 'react';
import { Input, FormControl, FormLabel, FormHelperText } from '@mui/joy';
import type { InputProps } from '@mui/joy';

// Extended props for our custom TextInput
export interface TextInputProps
  extends Omit<InputProps, 'startDecorator' | 'endDecorator'> {
  label?: string;
  helperText?: string;
  errorText?: string;
  required?: boolean;
  startDecorator?: React.ReactNode;
  endDecorator?: React.ReactNode;
}

/**
 * TextInput component using Joy UI's Input with FormControl structure
 * Supports start and end decorators for custom buttons or icons
 */
const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      label,
      helperText,
      errorText,
      required = false,
      startDecorator,
      endDecorator,
      error,
      ...inputProps
    },
    ref
  ) => {
    const hasError = !!errorText || error;

    return (
      <FormControl error={hasError} required={required}>
        {label && <FormLabel>{label}</FormLabel>}

        <Input
          {...inputProps}
          error={hasError}
          startDecorator={startDecorator}
          endDecorator={endDecorator}
          slotProps={{
            input: {
              ref,
            },
          }}
        />

        {(helperText || errorText) && (
          <FormHelperText>{errorText || helperText}</FormHelperText>
        )}
      </FormControl>
    );
  }
);

TextInput.displayName = 'TextInput';

export default TextInput;
