"use client";

import { useState } from "react";
import { WywoPhoneField } from "./WywoPhoneField";

type Props = {
  /** Hidden form input name; the server reads this combined E.164 string. */
  name: string;
  defaultValue?: string;
  placeholder?: string;
};

/**
 * Wraps `WywoPhoneField` for plain GET filter forms. The country select + national
 * input drive a single hidden input named `name`, so existing server filter logic
 * keeps reading `?phone=+353…` exactly as before.
 */
export function WywoPhoneFilterField({ name, defaultValue = "", placeholder }: Props) {
  const [value, setValue] = useState<string>(defaultValue);
  return (
    <>
      <WywoPhoneField
        value={value}
        onChange={setValue}
        name={`${name}Display`}
        placeholder={placeholder ?? "Phone digits"}
        countryWidthClass="w-[112px]"
      />
      <input type="hidden" name={name} value={value} />
    </>
  );
}
