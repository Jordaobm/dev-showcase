import { MotionStyle } from "motion";
import { motion } from "motion/react";
import { Link } from "@/i18n/navigation";
import { MouseEvent as ReactMouseEvent, ReactNode } from "react";

interface ButtonProps {
  type: "primary" | "secondary";
  size?: "md" | "lg";
  href?: string;
  onClick?: () => void;
  children?: ReactNode;
  disabled?: boolean;
  className?: string;
  customStyle?: MotionStyle;
}

const MotionLink = motion.create(Link);

export const Button = ({
  type,
  size = "md",
  href,
  onClick,
  children,
  disabled = false,
  className,
  customStyle,
}: ButtonProps) => {
  let style: MotionStyle = {};

  if (type === "primary") {
    style = {
      background: "linear-gradient(135deg, #DC2626, #B91C1C)",
      boxShadow:
        "0 4px 16px rgba(220, 38, 38, 0.3), 0 0 20px rgba(220, 38, 38, 0.15)",
    };
  }

  if (type === "secondary") {
    style = {
      background: "rgba(255, 255, 255, 0.7)",
      border: "1px solid rgba(0, 0, 0, 0.06)",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
    };
  }

  const paddingClass = size === "lg" ? "px-8 py-4" : "px-5 py-2.5";
  const textColorClass = type === "primary" ? "text-white" : "text-gray-700";
  const stateClass = disabled
    ? "opacity-50 cursor-not-allowed"
    : "cursor-pointer";

  const sharedClassName = `${paddingClass} ${stateClass} rounded-2xl ${textColorClass} text-sm font-medium inline-flex items-center justify-center gap-2 premium-button overflow-hidden${className ? ` ${className}` : ""}`;
  const sharedStyle = { ...style, ...customStyle };

  if (href) {
    const handleLinkClick = (e: ReactMouseEvent<HTMLAnchorElement>) => {
      if (!onClick) return;

      const isModifiedClick =
        e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1;
      if (isModifiedClick) return;

      e.preventDefault();
      onClick();
    };

    return (
      <MotionLink
        href={href}
        onClick={handleLinkClick}
        className={sharedClassName}
        style={sharedStyle}
        whileTap={{ scale: 0.98 }}
      >
        {children}
      </MotionLink>
    );
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={sharedClassName}
      style={sharedStyle}
      whileTap={disabled ? undefined : { scale: 0.98 }}
    >
      {children}
    </motion.button>
  );
};
