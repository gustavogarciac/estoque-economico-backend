import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { ResourceNotFoundError } from 'src/http/_errors/resource-not-found-error'
import { auth } from 'src/http/middlewares/auth'
import { prisma } from 'src/lib/prismadb'
import z from 'zod'

export async function deleteCategoryRoute(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete(
      '/organizations/:slug/category/:categoryId',
      {
        schema: {
          summary: 'Delete a category',
          tags: ['categories'],
          params: z.object({
            categoryId: z.string().uuid(),
            slug: z.string(),
          }),
          security: [
            {
              bearerAuth: [],
            },
          ],
        },
      },
      async (req, reply) => {
        const { slug } = req.params
        const { organization } = await req.getMembership(slug)
        await req.verifyAdmin(slug)

        if (!organization) {
          throw new ResourceNotFoundError('Organization not found')
        }

        const { categoryId } = req.params

        const category = await prisma.category.findUnique({
          where: {
            id: categoryId,
          },
        })

        if (!category) {
          throw new ResourceNotFoundError('Category not found')
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
