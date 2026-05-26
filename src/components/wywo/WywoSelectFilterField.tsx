"use client";

import { useState } from "react";
import { WywoSelect, type WywoSelectOption } from "./WywoSelect";

type Props = {
  /** Hidden form input name; the server reads this combined value. */
  name: string;
  defaultValue?: string;
  options: readonly WywoSelectOption[];
  placeholder?: string;
  widthClass?: string;
};

/** GET-form-friendly wrapper around `WywoSelect`. */
export function WywoSelectFilterField({
  name,
  defaultValue = "",
  options,
  placeholder,
  widthClass,
}: Props) {
  const [value, setValue] = useState(defaultValue);
  return (
    <WywoSelect
      value={value}
      onChange={setValue}
      options={options}
      placeholder={placeholder}
      name={name}
      widthClass={widthClass}
    />
  );
}
