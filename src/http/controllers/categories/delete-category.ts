import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { prisma } from 'src/lib/prismadb'
import z from 'zod'

export async function createCategoryRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete(
    '/categories/:categoryId',
    {
      schema: {
        summary: 'Delete a category',
        tags: ['categories'],
        params: z.object({
          categoryId: z.string().uuid(),
        }),
      },
    },
    async (req, reply) => {
      const { categoryId } = req.params

      const category = await prisma.category.findUnique({
        where: {
          id: categoryId,
        },
      })

      if (!category) {
        return reply.status(404).send({
          message: 'Category not found',
        })
      }

      await prisma.category.delete({
        where: {
          id: category.id,
        },
      })

      return reply.status(204).send()
    },
  )
}
