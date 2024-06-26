import { faker } from '@faker-js/faker'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { BadRequestError } from 'src/http/_errors/bad-request-error'
import { auth } from 'src/http/middlewares/auth'
import { prisma } from 'src/lib/prismadb'
import { generateSlug } from 'src/utils/generate-slug'
import z from 'zod'

export async function createOrganizationRoute(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/organizations',
      {
        schema: {
          summary: 'Create a new organization',
          tags: ['organizations'],
          security: [
            {
              bearerAuth: [],
            },
          ],
          body: z.object({
            name: z.string(),
            domain: z.string().nullish(),
            shouldAttachUsersByDomain: z.boolean().default(false),
            description: z.string().nullish(),
            imageUrl: z.string().url().nullish(),
          }),
          response: {
            201: z.object({
              organizationId: z.string().uuid(),
            }),
          },
        },
      },
      async (req, reply) => {
        const userId = await req.getCurrentUserId()
        const {
          name,
          description,
          imageUrl,
          domain,
          shouldAttachUsersByDomain,
        } = req.body

        const domainAlreadyInUse = await prisma.organization.findFirst({
          where: {
            domain,
          },
        })

        if (domainAlreadyInUse) {
          throw new BadRequestError('Domain already in use')
        }

        const slug = generateSlug(name)

        const nameAlreadyInUse = await prisma.organization.findFirst({
          where: {
            slug,
          },
        })

        if (nameAlreadyInUse) {
          throw new BadRequestError('Name already in use')
        }

        const organization = await prisma.organization.create({
          data: {
            name,
            slug,
            description,
            imageUrl: imageUrl ?? faker.image.avatarGitHub(),
            ownerId: userId,
            domain,
            shouldAttachUsersByDomain,
            members: {
              create: {
                userId,
                role: 'ADMIN',
              },
            },
          },
        })

        return reply.status(201).send({
          organizationId: organization.id,
        })
      },
    )
}
