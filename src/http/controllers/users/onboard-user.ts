import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { BadRequestError } from 'src/http/_errors/bad-request-error'
import { auth } from 'src/http/middlewares/auth'
import { prisma } from 'src/lib/prismadb'
import z from 'zod'

export async function onboardUserRoute(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .patch(
      '/users/onboard',
      {
        schema: {
          summary: 'Onboard a new user',
          security: [
            {
              bearerAuth: [],
            },
          ],
          tags: ['users'],
          response: {
            204: z.null(),
          },
        },
      },
      async (req, reply) => {
        const userId = await req.getCurrentUserId()

        const user = await prisma.user.findFirst({
          where: {
            id: userId,
          },
          include: {
            member_on: true,
          },
        })

        if (!user) throw new BadRequestError('User not found!')

        if (user.member_on.length === 0) {
          throw new BadRequestError('Please, join an organization first.')
        }

        await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            onboarded: true,
          },
        })

        return reply.status(204).send()
      },
    )
}
