import * as React from "react";
import { Label } from "@/components/ui/label";
import { useFormField } from "@/lib/form-context";

const FormLabel = ({ className, ...props }: React.ComponentProps<typeof Label>) => {
  const { error, formItemId } = useFormField();
  return (
    <Label
      className={className}
      htmlFor={formItemId}
      {...props}
    />
  );
};
FormLabel.displayName = "FormLabel";

export { FormLabel };
