import type { ComponentProps, ValidComponent, VoidProps } from 'solid-js';

import { Select as SelectPrimitive } from '@kobalte/core/select';
import { Show, splitProps } from 'solid-js';

import { ChevronLeft } from '@/icons';
import { cn } from '@/utils/cn';

export const SelectPortal = SelectPrimitive.Portal;

export type SelectProps<
  Option,
  OptGroup = never,
  T extends ValidComponent = `div`,
> = ComponentProps<typeof SelectPrimitive<Option, OptGroup, T>>;

export const Select = <
  Option,
  OptGroup = never,
  T extends ValidComponent = `div`,
>(
  props: SelectProps<Option, OptGroup, T>,
) => {
  const [, rest] = splitProps(props as SelectProps<Option, OptGroup>, [
    `class`,
  ]);

  return <SelectPrimitive class={cn(`space-y-2`, props.class)} {...rest} />;
};

export type SelectValueProps<
  Options,
  T extends ValidComponent = `span`,
> = ComponentProps<typeof SelectPrimitive.Value<Options, T>>;

export const SelectValue = <Options, T extends ValidComponent = `span`>(
  props: SelectValueProps<Options, T>,
) => <SelectPrimitive.Value {...props} />;

export type SelectTriggerProps<T extends ValidComponent = `button`> =
  ComponentProps<typeof SelectPrimitive.Trigger<T>> & { hideIcon?: boolean };

export const SelectTrigger = <T extends ValidComponent = `button`>(
  props: SelectTriggerProps<T>,
) => {
  const [local, rest] = splitProps(props as SelectTriggerProps, [
    `class`,
    `children`,
    `hideIcon`,
  ]);

  return (
    <SelectPrimitive.Trigger
      class={cn(
        `group flex items-center rounded-md border border-white/10 bg-[#242C39] py-1 text-white transition-colors outline-none hover:bg-[#2E3642]`,
        local.hideIcon ?
          `justify-center px-2.5`
        : `justify-between gap-2 pr-2 pl-2.5`,
        local.class,
      )}
      {...rest}
    >
      {local.children}
      <Show when={!local.hideIcon}>
        <SelectPrimitive.Icon class='size-4 opacity-70 transition-transform duration-200 group-data-expanded:rotate-90'>
          <ChevronLeft class='size-4' />
        </SelectPrimitive.Icon>
      </Show>
    </SelectPrimitive.Trigger>
  );
};

export type SelectContentProps<T extends ValidComponent = `div`> = VoidProps<
  ComponentProps<typeof SelectPrimitive.Content<T>>
>;

export const SelectContent = <T extends ValidComponent = `div`>(
  props: SelectContentProps<T>,
) => {
  const [, rest] = splitProps(props as SelectContentProps, [`class`]);

  return (
    <SelectPrimitive.Content
      class={cn(
        `z-50 min-w-[8rem] overflow-hidden rounded-lg border border-white/10 bg-[#242C39] p-1 shadow-lg`,
        `data-[expanded]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[expanded]:fade-in-0 data-[closed]:zoom-out-95 data-[expanded]:zoom-in-95`,
        props.class,
      )}
      {...rest}
    >
      <SelectPrimitive.Listbox class='outline-none' />
    </SelectPrimitive.Content>
  );
};

export type SelectItemProps<T extends ValidComponent = `li`> = ComponentProps<
  typeof SelectPrimitive.Item<T>
>;

export const SelectItem = <T extends ValidComponent = `li`>(
  props: SelectItemProps<T>,
) => {
  const [, rest] = splitProps(props as SelectItemProps, [`class`, `children`]);

  return (
    <SelectPrimitive.Item
      class={cn(
        `relative flex w-full cursor-pointer items-center rounded-md px-2 py-1.5 text-sm text-white transition-colors outline-none select-none hover:bg-[#2E3642] focus:bg-[#2E3642] data-[highlighted]:bg-[#2E3642]`,
        props.class,
      )}
      {...rest}
    >
      <SelectPrimitive.ItemLabel>
        {(props as SelectItemProps).children}
      </SelectPrimitive.ItemLabel>
    </SelectPrimitive.Item>
  );
};
