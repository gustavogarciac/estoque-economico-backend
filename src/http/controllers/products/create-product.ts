import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { BadRequestError } from 'src/http/_errors/bad-request-error'
import { prisma } from 'src/lib/prismadb'
import z from 'zod'

import { auth } from '../../middlewares/auth'

export async function createProductRoute(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/organizations/:slug/products',
      {
        schema: {
          summary: 'Create a new product',
          tags: ['products'],
          params: z.object({
            slug: z.string(),
          }),
          security: [
            {
              bearerAuth: [],
            },
          ],
          body: z.object({
            stock: z.number().default(1),
            categoryId: z.string().uuid(),
            description: z.string().nullish(),
            name: z.string().nullish(),
            code: z.string(),
          }),
          response: {
            201: z.object({
              productId: z.string().uuid(),
            }),
          },
        },
      },
      async (req, reply) => {
        const userId = await req.getCurrentUserId()
        const { slug } = req.params
        const { stock, categoryId, code, description, name } = req.body
        const { organization } = await req.getMembership(slug)
        await req.verifyMember(slug)

        const category = await prisma.category.findFirst({
          where: {
            id: categoryId,
          },
        })

        if (!category) throw new BadRequestError('Category not found')

        const product = await prisma.products.create({
          data: {
            code,
            description,
            name,
            stock,
            registered_by: {
              connect: {
                id: userId,
              },
            },
            organization: {
              connect: {
                id: organization.id,
              },
            },
            category: {
              connect: {
                id: categoryId,
              },
            },
          },
        })

        return reply.status(201).send({ productId: product.id })
      },
    )
}
