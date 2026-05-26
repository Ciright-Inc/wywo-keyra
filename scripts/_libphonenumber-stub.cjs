// Minimal stand-in for libphonenumber-js used by the WYWO flow check script.
// The real package fails to load metadata when imported from tsx, but our test
// phones are already strict E.164 strings — so a regex-based stub is enough.

function parsePhoneNumberFromString(input) {
  if (typeof input !== "string") return undefined;
  const trimmed = input.trim();
  const e164 = /^\+\d{7,15}$/;
  if (!e164.test(trimmed)) return undefined;
  return {
    number: trimmed,
    isValid: () => true,
  };
}

module.exports = {
  parsePhoneNumberFromString,
  default: { parsePhoneNumberFromString },
};
