import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import { env } from 'src/env'

const prisma = new PrismaClient()

async function main() {
  await prisma.organization.deleteMany()
  await prisma.user.deleteMany()
  await prisma.products.deleteMany()

  const baseUser = await prisma.user.create({
    data: {
      email: 'padaria@supereconomico.com',
      name: 'Padaria',
      passwordHash: await hash(env.BASE_ORGANIZATION_PASSWORD, 8),
    },
  })

  await prisma.organization.create({
    data: {
      name: 'Super Econômico',
      slug: 'super-economico',
      description: 'Supermercado Econômico',
      domain: 'supereconomico.com',
      shouldAttachUsersByDomain: false,
      owner: {
        connect: {
          id: baseUser.id,
        },
      },
      members: {
        create: {
          user: {
            connect: {
              id: baseUser.id,
            },
          },
          role: 'ADMIN',
        },
      },
    },
  })
}

async function seed() {
  await main()
  await prisma.$disconnect()
}

seed().then(() => {
  console.log('Database seeded!')
})
