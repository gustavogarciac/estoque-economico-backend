import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { BadRequestError } from 'src/http/_errors/bad-request-error'
import { prisma } from 'src/lib/prismadb'
import z from 'zod'

export async function updateProductRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put(
    '/organizations/:organizationId/products/:productId',
    {
      schema: {
        summary: 'Update a product',
        tags: ['products'],
        params: z.object({
          organizationId: z.string().uuid(),
          productId: z.string().uuid(),
        }),
        body: z.object({
          stock: z.number(),
          categoryId: z.string().uuid(),
          description: z.string().nullish(),
          name: z.string().nullish(),
          code: z.string(),
        }),
        response: {
          204: z.null(),
        },
      },
    },
    async (req, reply) => {
      const { stock, categoryId, code, description, name } = req.body
      const { organizationId, productId } = req.params

      const organization = await prisma.organization.findFirst({
        where: {
          id: organizationId,
        },
      })

      if (!organization) throw new BadRequestError('Organization not found')

      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
        },
      })

      if (!category) throw new BadRequestError('Category not found')

      await prisma.products.update({
        where: {
          id: productId,
        },
        data: {
          stock,
          categoryId,
          description,
          name,
          code,
        },
      })

      return reply.status(204).send()
    },
  )
}
