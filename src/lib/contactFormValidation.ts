export type ContactFieldKey = "name" | "email" | "phone" | "subject" | "message";

export type ContactFieldErrors = Partial<Record<ContactFieldKey, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LIMITS = {
  nameMin: 2,
  nameMax: 200,
  messageMin: 10,
  messageMax: 10000,
  phoneDigitsMin: 6,
} as const;

export function validateContactFields(values: {
  name: string;
  email: string;
  phoneNationalDigits: string;
  hasSubject: boolean;
  message: string;
}): ContactFieldErrors {
  const errors: ContactFieldErrors = {};
  const name = values.name.trim();
  const email = values.email.trim();
  const message = values.message.trim();

  if (!name) {
    errors.name = "Name is required.";
  } else if (name.length < LIMITS.nameMin) {
    errors.name = "Please enter your full name.";
  } else if (name.length > LIMITS.nameMax) {
    errors.name = `Name must be at most ${LIMITS.nameMax} characters.`;
  }

  if (!email) {
    errors.email = "Email is required.";
  } else if (!EMAIL_RE.test(email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (
    values.phoneNationalDigits.length > 0 &&
    values.phoneNationalDigits.length < LIMITS.phoneDigitsMin
  ) {
    errors.phone =
      "Phone number looks too short. Add more digits or leave blank.";
  }

  if (!values.hasSubject) {
    errors.subject = "Please select a subject.";
  }

  if (!message) {
    errors.message = "Message is required.";
  } else if (message.length < LIMITS.messageMin) {
    errors.message = `Please add a bit more detail (at least ${LIMITS.messageMin} characters).`;
  } else if (message.length > LIMITS.messageMax) {
    errors.message = `Message must be at most ${LIMITS.messageMax} characters.`;
  }

  return errors;
}

export function hasFieldErrors(errors: ContactFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
