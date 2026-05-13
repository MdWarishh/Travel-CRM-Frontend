"use client"

import * as React from "react"
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  get,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form"

// ── Context to pass field name down to FormMessage ────────────────────────────

const FormFieldContext = React.createContext<{ name: string }>({ name: "" })
const FormItemContext = React.createContext<{ id: string }>({ id: "" })

// ── Form ──────────────────────────────────────────────────────────────────────

export const Form = FormProvider

// ── FormField ─────────────────────────────────────────────────────────────────

export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: ControllerProps<TFieldValues, TName> & { control?: any }) {
  return (
    <FormFieldContext.Provider value={{ name: props.name as string }}>
      <Controller {...(props as any)} />
    </FormFieldContext.Provider>
  )
}

// ── FormItem ──────────────────────────────────────────────────────────────────

export const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = React.useId()
  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        ref={ref}
        className={["space-y-2", className].filter(Boolean).join(" ")}
        {...props}
      />
    </FormItemContext.Provider>
  )
})
FormItem.displayName = "FormItem"

// ── FormLabel ─────────────────────────────────────────────────────────────────

export const FormLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => {
  const { id } = React.useContext(FormItemContext)
  return (
    <label
      ref={ref}
      htmlFor={id}
      className={["text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  )
})
FormLabel.displayName = "FormLabel"

// ── FormControl ───────────────────────────────────────────────────────────────

export const FormControl = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ ...props }, ref) => {
  const { id } = React.useContext(FormItemContext)
  return <div ref={ref} id={id} {...props} />
})
FormControl.displayName = "FormControl"

// ── FormMessage ───────────────────────────────────────────────────────────────

export const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { name } = React.useContext(FormFieldContext)
  const { errors } = useFormState({ name: name as any })
  const error = get(errors, name)

  const body = error?.message ? String(error.message) : children
  if (!body) return null

  return (
    <p
      ref={ref}
      className={["text-sm font-medium text-destructive", className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {body}
    </p>
  )
})
FormMessage.displayName = "FormMessage"