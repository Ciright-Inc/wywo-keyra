"use client";

import {
  DEFAULT_PHONE_COUNTRY_CODE,
  dialForPhoneCountryCode,
} from "@/lib/phoneCountryOptions";
import { useState } from "react";

export function useDefaultPhoneDial() {
  const [phoneCountryCode, setPhoneCountryCode] = useState(
    DEFAULT_PHONE_COUNTRY_CODE,
  );
  const dial = dialForPhoneCountryCode(phoneCountryCode);
  return { phoneCountryCode, setPhoneCountryCode, dial };
}
