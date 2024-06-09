import { compare } from 'bcryptjs'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { prisma } from 'src/lib/prismadb'
import z from 'zod'

import { BadRequestError } from '../_errors/bad-request-error'
import { ResourceNotFoundError } from '../_errors/resource-not-found-error'

export async function authenticateWithPasswordRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/sessions/password',
    {
      schema: {
        summary: 'Authenticate with password',
        tags: ['sessions'],
        body: z.object({
          email: z.string().email(),
          password: z.string().min(6),
        }),
      },
    },
    async (req, reply) => {
      const { email, password } = req.body

      const user = await prisma.user.findFirst({
        where: {
          email,
        },
      })

      if (!user) throw new ResourceNotFoundError('Usuário não encontrado')

      const passwordMatch = await compare(password, user.passwordHash)

      if (!passwordMatch) throw new BadRequestError('Credenciais Inválidas')

      const token = await reply.jwtSign(
        {
          sub: user.id,
        },
        {
          sign: {
            expiresIn: '7d',
          },
        },
      )

      return reply.status(200).send({
        token,
      })
    },
  )
}
