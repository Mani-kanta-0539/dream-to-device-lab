import { Button, ButtonProps } from "@/components/ui/button";
import { forwardRef } from "react";

interface AccessibleButtonProps extends ButtonProps {
  ariaLabel?: string;
  loading?: boolean;
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ children, ariaLabel, loading, disabled, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
        aria-busy={loading}
        disabled={disabled || loading}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

AccessibleButton.displayName = "AccessibleButton";
