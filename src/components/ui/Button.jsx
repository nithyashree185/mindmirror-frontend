import React from "react";
import { cn } from "../../lib/utils";

const Button = React.forwardRef(({ className, variant = "default", size = "default", ...props }, ref) => {
  const variants = {
    default: "bg-[#483d8b] text-white hover:bg-[#5e50a8] shadow-sm",
    outline: "border border-[#e5e7eb] bg-transparent hover:bg-[#f3f4f6] text-[#2f4f4f]",
    ghost: "bg-transparent hover:bg-[#f3f4f6] text-[#2f4f4f]",
    link: "text-[#483d8b] underline-offset-4 hover:underline",
  };

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  };

  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#483d8b] disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button };
