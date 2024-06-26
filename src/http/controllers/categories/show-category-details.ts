import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { ResourceNotFoundError } from 'src/http/_errors/resource-not-found-error'
import { auth } from 'src/http/middlewares/auth'
import { prisma } from 'src/lib/prismadb'
import z from 'zod'

export async function getCategoryDetailsRoute(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/organizations/:slug/categories/:categoryId',
      {
        schema: {
          summary: 'Get a category details',
          tags: ['categories'],
          security: [
            {
              bearerAuth: [],
            },
          ],
          params: z.object({
            categoryId: z.string().uuid(),
            slug: z.string(),
          }),
          response: {
            200: z.object({
              name: z.string(),
              description: z.string().nullish(),
              imageUrl: z.string().nullish(),
              products: z.array(
                z.object({
                  code: z.string(),
                  name: z.string().nullable(),
                  description: z.string().nullable(),
                  id: z.string(),
                  stock: z.number(),
                  userId: z.string().uuid(),
                }),
              ),
            }),
          },
        },
      },
      async (req, reply) => {
        const { categoryId, slug } = req.params
        const { organization } = await req.getMembership(slug)

        const category = await prisma.category.findUnique({
          where: {
            id: categoryId,
            organizationId: organization.id,
          },
          select: {
            name: true,
            description: true,
            imageUrl: true,
            products: {
              select: {
                id: true,
                code: true,
                name: true,
                description: true,
                stock: true,
                userId: true,
              },
            },
          },
        })

        if (!category) throw new ResourceNotFoundError('Category not found')

        return reply.status(200).send({ ...category })
      },
    )
}
