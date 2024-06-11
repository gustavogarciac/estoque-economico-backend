import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { ResourceNotFoundError } from 'src/http/_errors/resource-not-found-error'
import { prisma } from 'src/lib/prismadb'
import z from 'zod'

export async function getCategoryDetailsRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/categories/:categoryId',
    {
      schema: {
        summary: 'Get a category details',
        tags: ['categories'],
        params: z.object({
          categoryId: z.string().uuid(),
        }),
        response: {
          200: z.object({
            name: z.string(),
            description: z.string().nullish(),
            imageUrl: z.string().nullish(),
            products: z.array(
              z.object({
                code: z.string(),
                name: z.string(),
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
      const { categoryId } = req.params

      const category = await prisma.category.findUnique({
        where: {
          id: categoryId,
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
