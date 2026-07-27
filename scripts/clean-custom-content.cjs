const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:D:/AI AGENT/LocalHost/idlix-db/dev.db",
    },
  },
})

async function main() {
  const all = await prisma.customContent.findMany()
  console.log(`Total custom content: ${all.length}`)

  for (const item of all) {
    const posterOk = item.posterPath?.startsWith("http") ?? false
    const backdropOk = item.backdropPath?.startsWith("http") ?? false
    const titleOk = item.title.trim().length > 0
    const overviewOk = (item.overview || "").trim().length > 0

    if (!posterOk || !backdropOk || !titleOk || !overviewOk) {
      console.log(`DELETE: ${item.id} | title=${item.title} | poster=${item.posterPath} | backdrop=${item.backdropPath}`)
      await prisma.customContent.delete({ where: { id: item.id } })
    } else {
      console.log(`KEEP: ${item.id} | ${item.title}`)
    }
  }

  const remaining = await prisma.customContent.findMany()
  console.log(`\nSisa custom content: ${remaining.length}`)

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
