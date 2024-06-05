import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { ResourceNotFoundError } from 'src/http/_errors/resource-not-found-error'
import { prisma } from 'src/lib/prismadb'
import z from 'zod'

export async function updateCategoryRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put(
    '/categories/:categoryId',
    {
      schema: {
        summary: 'Update a category',
        tags: ['categories'],
        params: z.object({
          categoryId: z.string().uuid(),
        }),
        body: z.object({
          name: z.string().min(3).max(255),
          description: z.string().nullish(),
          imageUrl: z.string().nullish(),
        }),
        response: {
          200: z.object({
            id: z.string(),
            name: z.string(),
            description: z.string().nullish(),
            imageUrl: z.string().nullish(),
            organizationId: z.string(),
          }),
        },
      },
    },
    async (req, reply) => {
      const { categoryId } = req.params
      const { name, description, imageUrl } = req.body

      const category = await prisma.category.findUnique({
        where: {
          id: categoryId,
        },
      })

      if (!category) {
        throw new ResourceNotFoundError('Category not found')
      }

      category.name = name ?? category.name
      category.description = description ?? category.description
      category.imageUrl = imageUrl ?? category.imageUrl

      await prisma.category.update({
        where: {
          id: category.id,
        },
        data: category,
      })

      return reply.status(200).send(category)
    },
  )
}
