import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { BadRequestError } from 'src/http/_errors/bad-request-error'
import { auth } from 'src/http/middlewares/auth'
import { prisma } from 'src/lib/prismadb'
import z from 'zod'

export async function updateProductRoute(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put(
      '/organizations/:slug/products/:productId',
      {
        schema: {
          summary: 'Update a product',
          tags: ['products'],
          security: [
            {
              bearerAuth: [],
            },
          ],
          params: z.object({
            slug: z.string(),
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
        const { slug, productId } = req.params
        await req.verifyAdmin(slug)

        const category = await prisma.category.findFirst({
          where: {
            id: categoryId,
          },
        })

        if (!category) throw new BadRequestError('Category not found')

        const product = await prisma.products.findFirst({
          where: {
            id: productId,
          },
        })

        if (!product) throw new BadRequestError('Product not found')

        product.stock = stock ?? product.stock
        product.description = description ?? product.description
        product.code = code ?? product.code
        product.name = name ?? product.name
        product.categoryId = categoryId ?? product.categoryId

        await prisma.products.update({
          where: {
            id: productId,
          },
          data: {
            ...product,
          },
        })

        return reply.status(204).send()
      },
    )
}
