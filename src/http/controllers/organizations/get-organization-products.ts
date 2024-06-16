import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { BadRequestError } from 'src/http/_errors/bad-request-error'
import { prisma } from 'src/lib/prismadb'
import z from 'zod'

export async function getOrganizationProductsRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/organizations/:organizationId/products',
    {
      schema: {
        summary: 'Get organization products',
        tags: ['organizations', 'products'],
        params: z.object({
          organizationId: z.string().uuid(),
        }),
        response: {
          200: z.object({
            products: z.array(
              z.object({
                id: z.string().uuid(),
                name: z.string(),
                code: z.string(),
                stock: z.number(),
                description: z.string().nullable(),
                author: z.object({
                  id: z.string().uuid(),
                  name: z.string(),
                }),
                category: z.string(),
                registeredAt: z.date(),
              }),
            ),
          }),
        },
      },
    },
    async (req, reply) => {
      const { organizationId } = req.params

      const organization = await prisma.organization.findFirst({
        where: {
          id: organizationId,
        },
      })

      if (!organization) {
        throw new BadRequestError('Organization not found')
      }

      const products = await prisma.products.findMany({
        where: {
          organizationId,
        },
        select: {
          id: true,
          name: true,
          code: true,
          stock: true,
          description: true,
          createdAt: true,
          registered_by: {
            select: {
              name: true,
              id: true,
            },
          },
          category: {
            select: {
              name: true,
            },
          },
        },
      })

      const formattedProductList = products.map((product) => ({
        id: product.id,
        name: product.name,
        code: product.code,
        stock: product.stock,
        description: product.description,
        author: product.registered_by,
        category: product.category.name,
        registeredAt: product.createdAt,
      }))

      return reply.status(200).send({ products: formattedProductList })
    },
  )
}
