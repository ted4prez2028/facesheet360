import * as React from "react";
import {
  Controller,
  FieldValues,
  Path,
  Control,
} from "react-hook-form";

import { Label } from "./label";
import { Input } from "./input";
import { FormMessage } from "./form-message";

type FormFieldProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
};

export function FormField<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  type = "text",
  disabled = false,
}: FormFieldProps<T>) {
  return (
    <div className="space-y-2">
      {label && <Label htmlFor={name}>{label}</Label>}
      <Controller
        name={name}
        control={control}
        render={({
          field,
          fieldState: { error },
        }) => (
          <>
            <Input
              {...field}
              id={name}
              placeholder={placeholder}
              type={type}
              disabled={disabled}
              className={error ? "border-red-500" : ""}
            />
            {error && (
              <FormMessage>{error.message}</FormMessage>
            )}
          </>
        )}
      />
    </div>
  );
}
