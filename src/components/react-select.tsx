import { cn } from "@/lib/utils";
import ReactSelect, { GroupBase, Props } from "react-select";

export default function Select<
  Option = unknown,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>({ classNames, ...props }: Props<Option, IsMulti, Group>) {
  return (
    <ReactSelect
      {...props}
      unstyled
      classNames={{
        ...classNames,
        container: (props) => cn("relative", classNames?.container?.(props)),
        control: (props) =>
          cn(
            "flex min-h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-2 py-2 text-sm ring-offset-backgroundborder-border",
            props.isFocused && "outline-none ring-2 ring-ring ring-offset-2",
            props.isDisabled && "cursor-not-allowed opacity-50",
            classNames?.control?.(props)
          ),
        valueContainer: (props) =>
          cn(
            "flex flex-1 gap-0.5 items-center overflow-hidden py-0.5 px-2 flex-wrap",
            classNames?.valueContainer?.(props)
          ),
        multiValue: (props) =>
          cn(
            "bg-secondary text-primary rounded px-2 py-1 text-sm",
            classNames?.multiValue?.(props)
          ),

        multiValueRemove: (props) =>
          cn(
            "lucide lucide-x opacity-50 hover:bg-destructive hover:text-destructive-foreground rounded-sm ml-1 p-1",
            classNames?.multiValueRemove?.(props)
          ),
        dropdownIndicator: (props) =>
          cn(
            "grid place-items-center lucide lucide-chevron-down h-4 w-4 opacity-50",
            classNames?.dropdownIndicator?.(props)
          ),
        clearIndicator: (props) =>
          cn(
            "grid place-items-center lucide lucide-x h-4 w-4 opacity-50 rounded-sm",
            classNames?.clearIndicator?.(props)
          ),
        placeholder: (props) =>
          cn("text-muted-foreground", classNames?.placeholder?.(props)),
        menu: (props) =>
          cn(
            "absolute z-10 mt-2 min-w-[8rem] rounded-md border border-border bg-popover text-popover-foreground shadow-md animate-in fade-in-80",
            classNames?.menu?.(props)
          ),
        menuList: (props) =>
          cn("flex w-full flex-col p-1", classNames?.menuList?.(props)),
        option: (props) =>
          cn(
            "flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-3 pr-2 !text-sm outline-none",
            props.isDisabled && "pointer-events-none opacity-50",
            props.isFocused && "bg-accent text-accent-foreground",
            classNames?.option?.(props)
          ),
        indicatorSeparator: (props) =>
          cn(
            "h-full w-px bg-border mx-1",
            classNames?.indicatorSeparator?.(props)
          ),
      }}
    />
  );
}
