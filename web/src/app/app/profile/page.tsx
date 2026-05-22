import { AppProfileClient } from "./AppProfileClient";

type Props = {
  searchParams: Promise<{ focus?: string }>;
};

export default async function AppProfilePage({ searchParams }: Props) {
  const sp = await searchParams;
  const countryOnly = sp.focus?.trim().toLowerCase() === "country";
  return <AppProfileClient countryOnly={countryOnly} />;
}
