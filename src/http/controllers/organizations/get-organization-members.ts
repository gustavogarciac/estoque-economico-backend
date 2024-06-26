import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { auth } from 'src/http/middlewares/auth'
import { prisma } from 'src/lib/prismadb'
import z from 'zod'

export async function getOrganizationMembersRoute(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/organizations/:slug/members',
      {
        schema: {
          summary: 'Get organization members',
          tags: ['organizations'],
          security: [
            {
              bearerAuth: [],
            },
          ],
          params: z.object({
            slug: z.string(),
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
        const { slug } = req.params
        const { organization } = await req.getMembership(slug)

        const members = await prisma.member.findMany({
          where: {
            organizationId: organization.id,
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
