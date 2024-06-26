import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { ResourceNotFoundError } from 'src/http/_errors/resource-not-found-error'
import { auth } from 'src/http/middlewares/auth'
import { prisma } from 'src/lib/prismadb'
import z from 'zod'

export async function getUserProfileRoute(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/users/details',
      {
        schema: {
          summary: 'Get user profile',
          tags: ['users'],
          security: [
            {
              bearerAuth: [],
            },
          ],
          response: {
            200: z.object({
              id: z.string(),
              email: z.string(),
              name: z.string(),
              createdAt: z.date(),
              updatedAt: z.date(),
              member_on: z.array(
                z.object({
                  id: z.string().uuid(),
                  role: z.enum(['ADMIN', 'MEMBER', 'BILLING']),
                  userId: z.string().uuid(),
                  organizationId: z.string().uuid(),
                }),
              ),
            }),
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
            id: true,
            email: true,
            name: true,
            createdAt: true,
            updatedAt: true,
            member_on: true,
          },
        })

        if (!user) {
          throw new ResourceNotFoundError('User not found')
        }

        return reply.status(200).send(user)
      },
    )
}
