import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { UnauthorizedError } from 'src/http/_errors/unauthorized-error'
import { auth } from 'src/http/middlewares/auth'
import { prisma } from 'src/lib/prismadb'
import z from 'zod'

export async function getProductStock(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/organizations/:slug/product-stock',
      {
        schema: {
          summary: 'Get organization products stock',
          tags: ['billing'],
          security: [
            {
              bearerAuth: [],
            },
          ],
          params: z.object({
            slug: z.string(),
          }),
          response: {
            200: z.object({
              products: z.array(
                z.object({
                  code: z.string(),
                  id: z.string(),
                  name: z.string().nullable(),
                  stock: z.number(),
                }),
              ),
            }),
          },
        },
      },
      async (req, reply) => {
        const { slug } = req.params
        const { organization, membership } = await req.getMembership(slug)

        const userHasAuthorization =
          membership.role === 'ADMIN' || membership.role === 'BILLING'

        if (!userHasAuthorization) {
          throw new UnauthorizedError(
            "You don't have permission to access this resource",
          )
        }

        const products = await prisma.products.findMany({
          where: {
            organizationId: organization.id,
          },
          select: {
            code: true,
            id: true,
            name: true,
            stock: true,
          },
        })

        type ProductType = (typeof products)[0]

        const productStockSum = products.reduce(
          (acc: ProductType[], product: ProductType) => {
            const existingProduct = acc.find((p) => p.code === product.code)

            if (existingProduct) {
              existingProduct.stock += product.stock
            } else {
              acc.push({ ...product })
            }

            return acc
          },
          [] as ProductType[],
        )

        return reply.status(200).send({ products: productStockSum })
      },
    )
}
