import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { ResourceNotFoundError } from 'src/http/_errors/resource-not-found-error'
import { auth } from 'src/http/middlewares/auth'
import { prisma } from 'src/lib/prismadb'
import z from 'zod'

export async function getProductStock(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/organizations/:organizationId/product-stock',
      {
        schema: {
          summary: 'Get organization products stock',
          tags: ['billing'],
          params: z.object({
            organizationId: z.string().uuid(),
          }),
          response: {
            // 200: z.array(
            //   z.object({
            //     id: z.string().uuid(),
            //     name: z.string(),
            //     description: z.string().nullish(),
            //     imageUrl: z.string().nullish(),
            //   }),
            // ),
          },
        },
      },
      async (req, reply) => {
        const { organizationId } = req.params

        const organization = await prisma.organization.findUnique({
          where: {
            id: organizationId,
          },
        })

        if (!organization)
          throw new ResourceNotFoundError('Organization not found!')

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
