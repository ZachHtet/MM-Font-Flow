import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const ToastProvider = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className="fixed bottom-0 right-0 z-50 w-full p-4 md:max-w-sm md:right-4 md:bottom-4"
    {...props} 
  />
))
ToastProvider.displayName = "ToastProvider"

const ToastViewport = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("fixed bottom-0 right-0 z-50 flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]", className)}
    {...props}
  />
))
ToastViewport.displayName = "ToastViewport"

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border-gray-700 bg-[#2A2A2A] text-white",
        success: "border-green-800 bg-green-950 text-green-300",
        error: "border-red-800 bg-red-950 text-red-300",
        warning: "border-orange-600 bg-[#E2B38F] text-gray-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

// Define the ToastActionElement type
export type ToastActionElement = React.ReactElement<any, string>

export interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  title?: string
  description?: string
  action?: React.ReactNode
  closeButton?: boolean
  onOpenChange?: (open: boolean) => void
  open?: boolean
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant, title, description, action, closeButton = true, onOpenChange, open, ...props }, ref) => {
    // Don't use internal state if open is controlled externally
    const isControlled = open !== undefined
    const [internalOpen, setInternalOpen] = React.useState(true)
    
    // The effective "open" state combines controlled and uncontrolled behavior
    const isOpen = isControlled ? open : internalOpen
    
    // Dismissing the toast (internal state)
    const dismiss = React.useCallback(() => {
      if (!isControlled) {
        setInternalOpen(false)
      }
      if (onOpenChange) {
        onOpenChange(false)
      }
    }, [isControlled, onOpenChange])
    
    // Auto-dismiss after 5 seconds
    React.useEffect(() => {
      if (isOpen) {
        const timeout = setTimeout(() => {
          dismiss()
        }, 5000)
        return () => clearTimeout(timeout)
      }
      return undefined
    }, [isOpen, dismiss])
    
    if (!isOpen) return null
    
    return (
      <div
        ref={ref}
        className={cn(toastVariants({ variant }), className)}
        {...props}
      >
        <div className="flex-1">
          {title && <div className="font-medium">{title}</div>}
          {description && (
            <div className="text-sm opacity-90">{description}</div>
          )}
        </div>
        {action}
        {closeButton && (
          <button 
            onClick={dismiss}
            className="rounded-md p-1 text-white/60 opacity-0 transition-opacity hover:text-white group-hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  }
)
Toast.displayName = "Toast"

const ToastTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm font-medium", className)}
    {...props}
  />
))
ToastTitle.displayName = "ToastTitle"

const ToastDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
))
ToastDescription.displayName = "ToastDescription"

const ToastClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn("rounded-md p-1 text-white/60 opacity-0 transition-opacity hover:text-white group-hover:opacity-100", className)}
    {...props}
  >
    <X className="h-4 w-4" />
  </button>
))
ToastClose.displayName = "ToastClose"

export { 
  Toast, 
  ToastProvider, 
  ToastViewport, 
  ToastTitle, 
  ToastDescription, 
  ToastClose 
} 