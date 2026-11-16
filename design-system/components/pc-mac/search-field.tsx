import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "../cn";
import { IconSearch } from "../icons";

export type SearchFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label?: string;
  icon?: ReactNode;
};

export function SearchField({ label = "搜索", icon, className, ...rest }: SearchFieldProps) {
  return (
    <label className={cn("de-search", className)} data-de-part="search-field">
      <span className="de-icon">{icon ?? <IconSearch />}</span>
      <span className="de-sr">{label}</span>
      <input type="search" placeholder="搜索..." aria-label={label} {...rest} />
    </label>
  );
}
