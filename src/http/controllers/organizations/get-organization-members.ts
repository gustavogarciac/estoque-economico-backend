import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { BadRequestError } from 'src/http/_errors/bad-request-error'
import { prisma } from 'src/lib/prismadb'
import z from 'zod'

export async function getOrganizationMembersRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/organizations/:organizationId/members',
    {
      schema: {
        summary: 'Get organization members',
        tags: ['organizations'],
        params: z.object({
          organizationId: z.string().uuid(),
        }),
        response: {
          200: z.array(
            z.object({
              id: z.string().uuid(),
              name: z.string(),
              email: z.string().email(),
              role: z.enum(['ADMIN', 'MEMBER', 'BILLING']),
            }),
          ),
        },
      },
    },
    async (req, reply) => {
      const { organizationId } = req.params

      const organization = await prisma.organization.findFirst({
        where: {
          id: organizationId,
        },
      })

      if (!organization) {
        throw new BadRequestError('Organization not found')
      }

      const members = await prisma.member.findMany({
        where: {
          organizationId,
        },
        select: {
          role: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      const formattedMemberArray = members.map((member) => ({
        ...member.user,
        role: member.role,
      }))

      return reply.status(200).send(formattedMemberArray)
    },
  )
}
