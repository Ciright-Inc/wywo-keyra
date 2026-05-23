import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const settings = await prisma.authenticationFeedSetting.findUnique({ where: { id: "default" } });
  const countries = await prisma.authenticationCountry.count({
    where: { active: true, authenticationEnabled: true },
  });
  const protocols = await prisma.satProtocol.count({ where: { active: true } });
  let sessions = -1;
  try {
    sessions = await prisma.authenticationFeedSession.count();
  } catch (e) {
    sessions = -1;
    console.error("AuthenticationFeedSession table missing — run: npm run db:push");
  }
  console.log(JSON.stringify({ settings, countries, protocols, sessions }, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
