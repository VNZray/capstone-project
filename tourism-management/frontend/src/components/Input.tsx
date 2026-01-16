import React from "react";
import {
  TextField,
  MenuItem,
  Checkbox,
  Radio,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  type SelectChangeEvent,
} from "@mui/material";

type InputProps =
  | ({
      type: "text" | "number" | "date" | "time" | "email" | "password";
      options?: never;
    } & React.InputHTMLAttributes<HTMLInputElement>)
  | ({
      type: "select";
      options: { label: string; value: string | number }[];
      onChange?: (event: SelectChangeEvent<string | number>) => void;
    } & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange">)
  | ({
      type: "checkbox" | "radio";
      options?: never;
    } & React.InputHTMLAttributes<HTMLInputElement>)
  | ({
      type: "textarea";
      options?: never;
    } & React.TextareaHTMLAttributes<HTMLTextAreaElement>);

interface BaseProps {
  label?: string;
  style?: React.CSSProperties;
}

const Input: React.FC<InputProps & BaseProps> = (props) => {
  const { type, label, style } = props;

  // Select
  if (type === "select") {
    const { options = [], value, onChange } = props;
    return (
      <FormControl fullWidth style={style}>
        {label && <InputLabel>{label}</InputLabel>}
        <Select<string | number>
          multiple={false} // 👈 explicitly set single-select
          value={(value as string | number) ?? ""}
          onChange={
            onChange as (event: SelectChangeEvent<string | number>) => void
          }
        >
          {options.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }

  // Checkbox / Radio
  if (type === "checkbox" || type === "radio") {
    const { checked, onChange, name, value } = props;
    return (
      <FormControlLabel
        control={
          type === "checkbox" ? (
            <Checkbox checked={!!checked} onChange={onChange} name={name} />
          ) : (
            <Radio
              checked={!!checked}
              onChange={onChange}
              name={name}
              value={value}
            />
          )
        }
        label={label || ""}
      />
    );
  }

  // Textarea (multiline TextField)
  if (type === "textarea") {
    const { value, onChange, placeholder } = props;
    return (
      <TextField
        label={label}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        multiline
        fullWidth
        style={style}
      />
    );
  }

  // Default text-like inputs
  const { value, onChange, placeholder, type: inputType, ...restProps } = props;
  // Remove 'color' if present, as MUI expects specific values
  const { color, ...filteredRestProps } = restProps as any;
  return (
    <TextField
      label={label}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      fullWidth
      style={style}
      type={inputType}
      {...filteredRestProps}
    />
  );
};

export default Input;
