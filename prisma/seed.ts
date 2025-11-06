import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const cities = [
    {
      name: "Бишкек",
      streets: ["Чуй проспект", "Исанова", "Абдрахманова", "Тоголок Молдо", "Московская"],
    },
    {
      name: "Ош",
      streets: ["Ленина", "Курманжан Датка", "Мырзалы Аматова", "Навои", "Мамажанова"],
    },
    {
      name: "Каракол",
      streets: ["Тыныстанова", "Абдрахманова", "Советская", "Пионерская", "Ахунбаева"],
    },
    {
      name: "Талас",
      streets: ["Байтик Баатыра", "Логвиненко", "Манас", "Тыныбекова", "Джангильдина"],
    },
    {
      name: "Нарын",
      streets: ["Токтогула", "Советская", "Турусбекова", "Жибек-Жолу", "Кыял"],
    },
  ];

  for (const city of cities) {
    const c = await prisma.city.upsert({
      where: { name: city.name },
      update: {},
      create: { name: city.name },
    });

    for (const s of city.streets) {
      await prisma.street.upsert({
        where: { name_cityId: { name: s, cityId: c.id } },
        update: {},
        create: { name: s, cityId: c.id },
      });
    }
  }

  console.log("✅ Kyrgyz cities & streets seeded!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
