import React from 'react';
import { View, type ViewProps } from 'react-native';
import { Input, InputField, InputSlot, InputIcon } from '../ui/input';
import { Textarea, TextareaInput } from '../ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectItem,
} from '../ui/select';
import {
  Checkbox,
  CheckboxGroup,
  CheckboxIndicator,
  CheckboxLabel,
  CheckboxIcon,
} from '../ui/checkbox';
import {
  Radio,
  RadioGroup,
  RadioIndicator,
  RadioLabel,
  RadioIcon,
} from '../ui/radio';
import { Switch } from '../ui/switch';
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlErrorIcon,
  FormControlLabel,
  FormControlLabelText,
  FormControlHelper,
  FormControlHelperText,
} from '../ui/form-control';

// Form Container Props
export type FormProps = ViewProps & {
  gap?: number;
  padding?: number;
  paddingHorizontal?: number;
  paddingVertical?: number;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  margin?: number;
  marginHorizontal?: number;
  marginVertical?: number;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  children?: React.ReactNode;
};

// Form Container Component
const FormContainer = React.forwardRef<View, FormProps>(
  function FormContainer(
    {
      gap = 16,
      padding,
      paddingHorizontal,
      paddingVertical,
      paddingTop,
      paddingBottom,
      paddingLeft,
      paddingRight,
      margin,
      marginHorizontal,
      marginVertical,
      marginTop,
      marginBottom,
      marginLeft,
      marginRight,
      style,
      children,
      ...props
    },
    ref
  ) {
    const containerStyle = {
      gap,
      ...(padding !== undefined && {
        padding,
      }),
      ...(paddingHorizontal !== undefined && {
        paddingHorizontal,
      }),
      ...(paddingVertical !== undefined && {
        paddingVertical,
      }),
      ...(paddingTop !== undefined && {
        paddingTop,
      }),
      ...(paddingBottom !== undefined && {
        paddingBottom,
      }),
      ...(paddingLeft !== undefined && {
        paddingLeft,
      }),
      ...(paddingRight !== undefined && {
        paddingRight,
      }),
      ...(margin !== undefined && {
        margin,
      }),
      ...(marginHorizontal !== undefined && {
        marginHorizontal,
      }),
      ...(marginVertical !== undefined && {
        marginVertical,
      }),
      ...(marginTop !== undefined && {
        marginTop,
      }),
      ...(marginBottom !== undefined && {
        marginBottom,
      }),
      ...(marginLeft !== undefined && {
        marginLeft,
      }),
      ...(marginRight !== undefined && {
        marginRight,
      }),
    };

    return (
      <View ref={ref} style={[containerStyle, style]} {...props}>
        {children}
      </View>
    );
  }
);

// Form Input Component
const FormInput = Object.assign(Input, {
  Field: InputField,
  Slot: InputSlot,
  Icon: InputIcon,
});

// Form Textarea Component
const FormTextarea = Object.assign(Textarea, {
  Input: TextareaInput,
  Field: Object.assign(FormControl, {
    Error: FormControlError,
    ErrorText: FormControlErrorText,
    ErrorIcon: FormControlErrorIcon,
    Label: FormControlLabel,
    LabelText: FormControlLabelText,
    Helper: FormControlHelper,
    HelperText: FormControlHelperText,
  }),
});

// Form Select Component
const FormSelect = Object.assign(Select, {
  Trigger: SelectTrigger,
  Input: SelectInput,
  Icon: SelectIcon,
  Portal: SelectPortal,
  Backdrop: SelectBackdrop,
  Content: SelectContent,
  DragIndicator: SelectDragIndicator,
  DragIndicatorWrapper: SelectDragIndicatorWrapper,
  Item: SelectItem,
  Field: Object.assign(FormControl, {
    Error: FormControlError,
    ErrorText: FormControlErrorText,
    ErrorIcon: FormControlErrorIcon,
    Label: FormControlLabel,
    LabelText: FormControlLabelText,
    Helper: FormControlHelper,
    HelperText: FormControlHelperText,
  }),
});

// Form Checkbox Component
const FormCheckbox = Object.assign(Checkbox, {
  Group: CheckboxGroup,
  Indicator: CheckboxIndicator,
  Label: CheckboxLabel,
  Icon: CheckboxIcon,
});

// Form Radio Component
const FormRadio = Object.assign(Radio, {
  Group: RadioGroup,
  Indicator: RadioIndicator,
  Label: RadioLabel,
  Icon: RadioIcon,
});

// Form Switch Component
const FormSwitch = Switch;

// Form Control Component
const FormField = Object.assign(FormControl, {
  Error: FormControlError,
  ErrorText: FormControlErrorText,
  ErrorIcon: FormControlErrorIcon,
  Label: FormControlLabel,
  LabelText: FormControlLabelText,
  Helper: FormControlHelper,
  HelperText: FormControlHelperText,
});

// Main Form export with compound components
export const Form = Object.assign(FormContainer, {
  Input: FormInput,
  Textarea: FormTextarea,
  Select: FormSelect,
  Checkbox: FormCheckbox,
  Radio: FormRadio,
  Switch: FormSwitch,
  Field: FormField,
});

// Default export
export default Form;
