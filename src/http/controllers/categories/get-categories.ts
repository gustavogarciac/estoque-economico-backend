import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { auth } from 'src/http/middlewares/auth'
import { prisma } from 'src/lib/prismadb'
import z from 'zod'

export async function getCategoriesRoute(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/organizations/:slug/categories',
      {
        schema: {
          security: [
            {
              bearerAuth: [],
            },
          ],
          summary: 'Get an organization categories',
          tags: ['categories', 'organizations'],
          params: z.object({
            slug: z.string(),
          }),
          response: {
            200: z.array(
              z.object({
                id: z.string().uuid(),
                name: z.string(),
                description: z.string().nullish(),
                imageUrl: z.string().nullish(),
              }),
            ),
          },
        },
      },
      async (req, reply) => {
        const { slug } = req.params

        const { organization } = await req.getMembership(slug)
        await req.verifyMember(slug)

        const categories = await prisma.category.findMany({
          where: {
            organizationId: organization.id,
          },
          select: {
            id: true,
            name: true,
            description: true,
            imageUrl: true,
          },
          orderBy: {
            name: 'asc',
          },
        })

        return reply.status(200).send(categories)
      },
    )
}
