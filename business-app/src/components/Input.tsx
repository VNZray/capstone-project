import React from "react";
import "./styles/Input.css";
import Text from "./Text";

type InputProps =
  | ({
      type:
        | "text"
        | "number"
        | "date"
        | "time"
        | "email"
        | "password";
      options?: never;
      style?: React.CSSProperties;
    } & React.InputHTMLAttributes<HTMLInputElement>)
  | ({
      type: "select";
      options: { label: string; value: string | number }[];
      style?: React.CSSProperties;
    } & React.SelectHTMLAttributes<HTMLSelectElement>)
  | ({
      type: "checkbox" | "radio";
      options?: never;
      style?: React.CSSProperties;
    } & React.InputHTMLAttributes<HTMLInputElement>)
  | ({
      type: "textarea";
      options?: never;
      style?: React.CSSProperties;
    } & React.TextareaHTMLAttributes<HTMLTextAreaElement>);

interface BaseProps {
  label?: string;
}

const Input: React.FC<InputProps & BaseProps> = (props) => {
  const { type, label, style } = props;

  // Select
  if (type === "select") {
    const { options, ...rest } = props;
    return (
      <div className="form-group">
        {label && (
          <label>
            <Text variant="medium" color="dark">
              {label}
            </Text>
          </label>
        )}
        <select className="custom-input" style={style} {...rest}>
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // Textarea
  if (type === "textarea") {
    const { ...rest } = props;
    return (
      <div className="form-group">
        {label && (
          <label>
            <Text variant="medium" color="dark">
              {label}
            </Text>
          </label>
        )}
        <textarea className="custom-input" style={style} {...rest} />
      </div>
    );
  }

  // Default input
  const { type: _type, ...restProps } = props;
  return (
    <div className="form-group">
      {label && (
        <label>
          <Text variant="medium" color="dark">
            {label}
          </Text>
        </label>
      )}
      <input className="custom-input" type={type} style={style} {...restProps} />
    </div>
  );
};

export default Input;
