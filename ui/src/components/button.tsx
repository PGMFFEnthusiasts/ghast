import { type JSX, splitProps } from 'solid-js';

import { cn } from '@/utils/cn';

type ButtonProps = JSX.HTMLAttributes<HTMLButtonElement>;

// my cooked asChild alternative
export const buttonStyles = (className?: string) =>
  cn(
    `flex items-center justify-center rounded p-2 transition-all hover:cursor-pointer active:scale-[97.5%]`,
    `outline-1 outline-border hover:outline-border-hover active:outline-border-active`,
    `active:bg-button-active hover:bg-button-hover`,
    className,
  );

export const Button = (props: ButtonProps) => {
  const [localProps, otherProps] = splitProps(props, [`class`]);
  return <button class={buttonStyles(localProps.class)} {...otherProps} />;
};
