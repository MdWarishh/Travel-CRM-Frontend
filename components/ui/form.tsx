"use client"

import * as React from "react"
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
} from "react-hook-form"

export const Form = FormProvider

export function FormField<T extends Record<string, any>>(
  props: ControllerProps<T>
) {
  return <Controller {...props} />
}

export function FormItem({ children }: { children: React.ReactNode }) {
  return <div className="space-y-2">{children}</div>
}

export function FormLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-medium">{children}</label>
}

export function FormControl({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}

export function FormMessage() {
  const {
    formState: { errors },
  } = useFormContext()

  if (!errors || Object.keys(errors).length === 0) return null

  return <p className="text-sm text-red-500">Invalid field</p>
}