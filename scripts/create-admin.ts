import { PrismaClient } from "./app/generated/prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const username = process.env.ADMIN_USERNAME || "admin"
  const email = process.env.ADMIN_EMAIL || "admin@localhost"
  const password = process.env.ADMIN_PASSWORD || "admin123"

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hashedPassword },
    create: {
      name: username,
      email,
      password: hashedPassword,
    },
  })

  console.log("Admin user created/updated:")
  console.log("Username:", username)
  console.log("Email:", email)
  console.log("Password:", password)
  console.log("User ID:", user.id)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })