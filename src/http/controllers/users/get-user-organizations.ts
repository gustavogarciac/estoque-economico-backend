import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { ResourceNotFoundError } from 'src/http/_errors/resource-not-found-error'
import { auth } from 'src/http/middlewares/auth'
import { prisma } from 'src/lib/prismadb'
import z from 'zod'

export async function getUserOrganizationsRoute(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/users/organizations',
      {
        schema: {
          summary: 'Get user organizations',
          tags: ['users'],
          security: [
            {
              bearerAuth: [],
            },
          ],
          response: {
            200: z.array(
              z.object({
                id: z.string().uuid(),
                name: z.string(),
                role: z.enum(['ADMIN', 'MEMBER', 'BILLING']),
                domain: z.string().nullable(),
                imageUrl: z.string().nullable(),
              }),
            ),
          },
        },
      },
      async (req, reply) => {
        const userId = await req.getCurrentUserId()

        const user = await prisma.user.findFirst({
          where: {
            id: userId,
          },
          select: {
            member_on: {
              select: {
                id: true,
                role: true,
                organizationId: true,
                organization: {
                  select: {
                    name: true,
                    domain: true,
                    imageUrl: true,
                  },
                },
              },
            },
          },
        })

        if (!user) {
          throw new ResourceNotFoundError('User not found')
        }

        const organizations = user.member_on.map((member) => ({
          id: member.organizationId,
          name: member.organization.name,
          role: member.role,
          domain: member.organization.domain,
          imageUrl: member.organization.imageUrl,
        }))

        return reply.status(200).send(organizations)
      },
    )
}
