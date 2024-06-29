import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { auth } from 'src/http/middlewares/auth'
import { prisma } from 'src/lib/prismadb'
import z from 'zod'

export async function getOrganizationProductsRoute(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/organizations/:slug/products',
      {
        schema: {
          summary: 'Get organization products',
          tags: ['organizations', 'products'],
          security: [
            {
              bearerAuth: [],
            },
          ],
          params: z.object({
            slug: z.string(),
          }),
          querystring: z.object({
            code: z.string().optional(),
            name: z.string().optional(),
          }),
          response: {
            200: z.object({
              products: z.array(
                z.object({
                  id: z.string().uuid(),
                  name: z.string().nullable(),
                  code: z.string(),
                  stock: z.number(),
                  organizationId: z.string().uuid(),
                  description: z.string().nullable(),
                  author: z.object({
                    id: z.string().uuid(),
                    name: z.string(),
                  }),
                  category: z.object({
                    id: z.string().uuid(),
                    name: z.string(),
                  }),
                  registeredAt: z.date(),
                }),
              ),
            }),
          },
        },
      },
      async (req, reply) => {
        const { slug } = req.params
        const { code, name } = req.query
        const { organization } = await req.getMembership(slug)

        const products = await prisma.products.findMany({
          where: {
            organizationId: organization.id,
            code: {
              contains: code,
            },
            name: {
              contains: name,
              mode: 'insensitive',
            },
          },
          select: {
            id: true,
            name: true,
            code: true,
            stock: true,
            description: true,
            createdAt: true,
            organizationId: true,
            registered_by: {
              select: {
                name: true,
                id: true,
              },
            },
            category: {
              select: {
                name: true,
                id: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        })

        const formattedProductList = products.map((product) => ({
          id: product.id,
          name: product.name,
          code: product.code,
          stock: product.stock,
          description: product.description,
          author: product.registered_by,
          category: {
            id: product.category.id,
            name: product.category.name,
          },
          registeredAt: product.createdAt,
          organizationId: product.organizationId,
        }))

        return reply.status(200).send({ products: formattedProductList })
      },
    )
}
