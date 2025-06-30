import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { useFormField } from "@/lib/form-context";

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { formItemId } = useFormField();

  return <Slot ref={ref} id={formItemId} aria-describedby={formItemId} {...props} />;
});

FormControl.displayName = "FormControl";

export { FormControl };
