
import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          // Ensure proper contrast based on background
          "bg-background text-foreground",
          // Dark background variants - white text
          "[&.bg-gray-700]:text-white [&.bg-gray-700]:placeholder:text-gray-300",
          "[&.bg-gray-800]:text-white [&.bg-gray-800]:placeholder:text-gray-300",
          "[&.bg-gray-900]:text-white [&.bg-gray-900]:placeholder:text-gray-300",
          "[&.bg-black]:text-white [&.bg-black]:placeholder:text-gray-300",
          // Light background variants - dark text
          "[&.bg-white]:text-black [&.bg-white]:placeholder:text-gray-600",
          "[&.bg-gray-50]:text-black [&.bg-gray-50]:placeholder:text-gray-600",
          "[&.bg-gray-100]:text-black [&.bg-gray-100]:placeholder:text-gray-600",
          "[&.bg-gray-200]:text-black [&.bg-gray-200]:placeholder:text-gray-600",
          // Auto contrast for CSS custom properties
          "[&[style*='background']]:text-black [&[style*='background-color']]:text-black",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
