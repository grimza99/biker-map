import { LoaderCircle } from "lucide-react";
import type {
  ButtonHTMLAttributes,
  MouseEvent as ReactMouseEvent,
  ReactNode,
} from "react";
import { cloneElement, isValidElement } from "react";

import { cn } from "@shared/lib";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "underline";

type ButtonSize = "sm" | "md" | "lg" | "icon";

type ButtonChildProps = {
  className?: string;
  onClick?: (event: ReactMouseEvent<HTMLElement>) => void;
};

const baseClassName =
  "inline-flex items-center justify-center gap-2 rounded-full border text-sm font-medium tracking-[-0.01em] transition duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-50 active:translate-y-px";

const variantClassNames: Record<
  ButtonVariant,
  { default: string; selected: string }
> = {
  primary: {
    default:
      "border-accent bg-accent text-text shadow-[var(--shadow-accent)] hover:border-accent-light hover:bg-accent-light",
    selected: "border-accent bg-accent text-text shadow-[var(--shadow-accent)]",
  },
  secondary: {
    default:
      "border-border bg-panel-solid text-text hover:border-accent hover:bg-panel-soft",
    selected: "border-accent bg-panel-soft text-text",
  },
  ghost: {
    default:
      "border-transparent bg-transparent text-text hover:border-border hover:bg-panel-soft",
    selected: "border-border bg-panel-soft text-text",
  },
  danger: {
    default:
      "border-danger bg-danger text-text hover:border-danger hover:bg-danger/90",
    selected: "border-danger bg-danger text-text",
  },
  underline: {
    default:
      "border-transparent bg-transparent px-0 text-accent-strong underline-offset-4 hover:text-accent hover:underline",
    selected:
      "border-transparent bg-transparent px-0 underline text-accent underline-offset-4",
  },
};

const sizeClassNames: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4.5",
  lg: "h-12 px-5 text-base",
  icon: "h-10 w-10 p-0",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  loading?: boolean;
  selected?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
  children: ReactNode;
};
export function Button({
  asChild,
  children,
  className,
  loading = false,
  selected = false,
  size = "md",
  variant = "primary",
  disabled,
  type = "button",
  onClick,
  ...props
}: ButtonProps) {
  const variantClassName =
    variantClassNames[variant][selected ? "selected" : "default"];
  const resolvedClassName = cn(
    baseClassName,
    variantClassName,
    sizeClassNames[size],
    loading && "cursor-wait",
    className
  );

  if (asChild && isValidElement<ButtonChildProps>(children)) {
    return cloneElement(children, {
      className: cn(children.props.className, className),
      onClick: (event: ReactMouseEvent<HTMLElement>) => {
        children.props.onClick?.(event);
        onClick?.(event as never);
      },
    } satisfies ButtonChildProps);
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={resolvedClassName}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : null}
      {children}
    </button>
  );
}
