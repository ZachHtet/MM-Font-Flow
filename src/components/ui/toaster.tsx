"use client"

import * as React from "react"
import { Toast, ToastProvider } from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"

export function Toaster() {
  const { toasts } = useToast()
  
  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, ...props }) => (
        <Toast 
          key={id} 
          title={title}
          description={description}
          action={action}
          {...props}
        />
      ))}
    </ToastProvider>
  )
} 