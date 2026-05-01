"use client";

import { FamilyRegistrationModal } from "@/components/registration/FamilyRegistrationModal";
import { IndividualRegistrationModal } from "@/components/registration/IndividualRegistrationModal";
import { OrganizationRegistrationModal } from "@/components/registration/OrganizationRegistrationModal";
import { PartnerRegistrationModal } from "@/components/registration/PartnerRegistrationModal";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export type RegistrationModalKey =
  | "individual"
  | "family"
  | "organization"
  | "partner";

type RegistrationCtx = {
  openModal: (key: RegistrationModalKey) => void;
};

const RegistrationContext = createContext<RegistrationCtx | null>(null);

export function KeyraRegistrationProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<RegistrationModalKey | null>(null);

  const openModal = useCallback((key: RegistrationModalKey) => {
    setActive(key);
  }, []);

  const closeModal = useCallback(() => setActive(null), []);

  const value = useMemo(() => ({ openModal }), [openModal]);

  return (
    <RegistrationContext.Provider value={value}>
      {children}
      <IndividualRegistrationModal
        open={active === "individual"}
        onClose={closeModal}
      />
      <FamilyRegistrationModal open={active === "family"} onClose={closeModal} />
      <OrganizationRegistrationModal
        open={active === "organization"}
        onClose={closeModal}
      />
      <PartnerRegistrationModal open={active === "partner"} onClose={closeModal} />
    </RegistrationContext.Provider>
  );
}

export function useKeyraRegistrationModal(): RegistrationCtx {
  const ctx = useContext(RegistrationContext);
  if (!ctx) {
    throw new Error(
      "useKeyraRegistrationModal must be used within KeyraRegistrationProvider",
    );
  }
  return ctx;
}
