import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { auth } from 'src/http/middlewares/auth'
import { prisma } from 'src/lib/prismadb'
import z from 'zod'

export async function getOrganizationsRoute(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/organizations',
      {
        schema: {
          summary: 'Get organizations',
          tags: ['organizations'],
          security: [
            {
              bearerAuth: [],
            },
          ],
          querystring: z.object({
            query: z.string().optional(),
            pageIndex: z.coerce.number().int().min(0).default(0),
          }),
          response: {
            200: z.array(
              z.object({
                id: z.string(),
                name: z.string(),
                imageUrl: z.string().nullish(),
              }),
            ),
          },
        },
      },
      async (req, reply) => {
        const { query, pageIndex } = req.query

        if (query) {
          const organizations = await prisma.organization.findMany({
            where: {
              name: {
                contains: query,
                mode: 'insensitive',
              },
            },
            orderBy: {
              name: 'asc',
            },
            select: {
              id: true,
              name: true,
              imageUrl: true,
            },
            take: 10,
            skip: 10 * pageIndex,
          })

          return reply.status(200).send(organizations)
        } else {
          const organizations = await prisma.organization.findMany({
            orderBy: {
              name: 'asc',
            },
            select: {
              id: true,
              name: true,
              imageUrl: true,
            },
            take: 10,
            skip: 10 * pageIndex,
          })

          return reply.status(200).send(organizations)
        }
      },
    )
}
