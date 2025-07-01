
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Start with mobile assumption to prevent layout shift
  const [isMobile, setIsMobile] = React.useState<boolean>(true)
  const [isInitialized, setIsInitialized] = React.useState<boolean>(false)

  React.useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT
      setIsMobile(mobile)
      setIsInitialized(true)
    }
    
    // Check immediately on mount
    checkMobile()
    
    // Use passive event listener for better performance
    const handleResize = () => {
      requestAnimationFrame(checkMobile)
    }
    
    window.addEventListener("resize", handleResize, { passive: true })
    
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return { isMobile, isInitialized }
}
