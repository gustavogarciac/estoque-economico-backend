import { hash } from 'bcryptjs'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { prisma } from 'src/lib/prismadb'
import z from 'zod'

import { BadRequestError } from '../_errors/bad-request-error'

export async function registerUserRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/users',
    {
      schema: {
        summary: 'Register a new user',
        tags: ['users'],
        body: z.object({
          email: z.string().email(),
          name: z.string(),
          password: z.string().min(6),
        }),
        response: {
          201: z.object({
            userId: z.string().uuid(),
          }),
        },
      },
    },
    async (req, reply) => {
      const { email, name, password } = req.body

      const emailAlreadyInUse = await prisma.user.findFirst({
        where: {
          email,
        },
      })

      const [, domain] = email.split('@')

      const autoJoinOrganization = await prisma.organization.findFirst({
        where: {
          domain,
          shouldAttachUsersByDomain: true,
        },
      })

      if (emailAlreadyInUse) {
        throw new BadRequestError('Email already in use.')
      }

      const passwordHash = await hash(password, 8)

      const { id: userId } = await prisma.user.create({
        data: {
          email,
          name,
          passwordHash,
          member_on: autoJoinOrganization
            ? {
                create: {
                  organizationId: autoJoinOrganization.id,
                  role: 'MEMBER',
                },
              }
            : undefined,
        },
      })

      return reply.status(201).send({
        userId,
      })
    },
  )
}
