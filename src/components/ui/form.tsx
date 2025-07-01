
import * as React from "react";
import { FormProvider } from "react-hook-form";
import { cn } from "@/lib/utils";
import { FormFieldContext } from "@/lib/form-context";
import { useFormField } from "@/lib/use-form-field";
import { FormItem } from "@/components/ui/FormItem";
import { FormField } from "@/components/ui/FormField";
import { FormControl } from "@/components/ui/FormControl";
import { FormLabel } from "@/components/ui/FormLabel";
import { FormDescription } from "@/lib/form-description";
import { FormMessage } from "@/lib/form-message";

const Form = FormProvider;

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
};
