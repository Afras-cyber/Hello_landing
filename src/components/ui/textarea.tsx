
import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          // Ensure proper contrast based on background
          "bg-background text-foreground",
          // Dark background variants
          "[&.bg-gray-700]:text-white [&.bg-gray-700]:placeholder:text-gray-300",
          "[&.bg-gray-800]:text-white [&.bg-gray-800]:placeholder:text-gray-300",
          "[&.bg-gray-900]:text-white [&.bg-gray-900]:placeholder:text-gray-300",
          "[&.bg-black]:text-white [&.bg-black]:placeholder:text-gray-300",
          // Light background variants
          "[&.bg-white]:text-black [&.bg-white]:placeholder:text-gray-600",
          "[&.bg-gray-50]:text-black [&.bg-gray-50]:placeholder:text-gray-600",
          "[&.bg-gray-100]:text-black [&.bg-gray-100]:placeholder:text-gray-600",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
