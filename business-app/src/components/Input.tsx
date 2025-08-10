import React from "react";
import "./styles/Input.css";
import Text from "./Text";

type InputProps =
  | ({
      type: "text" | "number" | "date" | "time" | "email" | "password";
      options?: never;
    } & React.InputHTMLAttributes<HTMLInputElement>)
  | ({
      type: "select";
      options: { label: string; value: string }[];
    } & React.SelectHTMLAttributes<HTMLSelectElement>)
  | ({
      type: "checkbox" | "radio";
      options?: never;
    } & React.InputHTMLAttributes<HTMLInputElement>);

interface BaseProps {
  label?: string;
}

const Input: React.FC<InputProps & BaseProps> = (props) => {
  const { type, label } = props;

  if (type === "select") {
    const { options, ...rest } = props;
    return (
      <div className="form-group">
        <select className="custom-input" {...rest}>
          <label>
            <Text variant="medium" color="dark">
              {label}
            </Text>
          </label>
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  const { type: _type, ...restProps } = props;
  return (
    <div className="form-group">
      <label>
        <Text variant="medium" color="dark">
          {label}
        </Text>
      </label>
      <input className="custom-input" type={type} {...restProps} />
    </div>
  );
};

export default Input;
