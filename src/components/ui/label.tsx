
import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  {
    variants: {
      variant: {
        default: "text-foreground",
        light: "text-black",
        dark: "text-white",
        auto: "text-black dark:text-white",
      }
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, variant, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      labelVariants({ variant }),
      // Auto contrast based on parent background
      "[.bg-white_&]:text-black [.bg-gray-50_&]:text-black [.bg-gray-100_&]:text-black [.bg-gray-200_&]:text-black",
      "[.bg-gray-700_&]:text-white [.bg-gray-800_&]:text-white [.bg-gray-900_&]:text-white [.bg-black_&]:text-white",
      className
    )}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
