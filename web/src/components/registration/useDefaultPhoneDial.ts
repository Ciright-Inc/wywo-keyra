"use client";

import { DEFAULT_PHONE_COUNTRY_DIAL } from "@/lib/phoneCountryOptions";
import { useState } from "react";

export function useDefaultPhoneDial() {
  const [dial, setDial] = useState(DEFAULT_PHONE_COUNTRY_DIAL);
  return { dial, setDial };
}
