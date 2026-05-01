import { HomeContent } from "@/components/home/HomeContent";
import { KeyraRegistrationProvider } from "@/components/registration/KeyraRegistrationProvider";

export default function Home() {
  return (
    <KeyraRegistrationProvider>
      <HomeContent />
    </KeyraRegistrationProvider>
  );
}
