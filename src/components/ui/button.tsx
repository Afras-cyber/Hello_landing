
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium font-redhat ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-3 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-blondify-blue/20 to-blondify-blue/10 border-2 border-blondify-blue/40 text-white hover:bg-gradient-to-r hover:from-blondify-blue hover:to-blondify-blue/80 hover:border-blondify-blue backdrop-blur-sm hover:scale-[1.02]",
        "light-bg": "bg-white border-2 border-gray-200 text-black hover:bg-gray-50 hover:border-gray-300",
        "dark-bg": "bg-black border-2 border-gray-700 text-white hover:bg-gray-900 hover:border-gray-600",
        "transparent-light": "bg-transparent border-2 border-white/40 text-white hover:bg-white/10 hover:border-white/60 backdrop-blur-sm",
        "transparent-dark": "bg-transparent border-2 border-black/40 text-black hover:bg-black/10 hover:border-black/60 backdrop-blur-sm",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "px-8 py-4 rounded-full", 
        sm: "h-8 px-4 py-1.5 text-xs rounded-full", 
        lg: "px-8 py-4 text-lg rounded-full", 
        icon: "h-9 w-9 rounded-full", 
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
