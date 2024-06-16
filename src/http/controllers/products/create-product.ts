import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { BadRequestError } from 'src/http/_errors/bad-request-error'
import { prisma } from 'src/lib/prismadb'
import z from 'zod'

export async function createProductRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/products/:organizationId',
    {
      schema: {
        summary: 'Create a new product',
        tags: ['products'],
        params: z.object({
          organizationId: z.string().uuid(),
        }),
        body: z.object({
          authorId: z.string().uuid(),
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
      const { authorId, stock, categoryId, code, description, name } = req.body
      const { organizationId } = req.params

      const organization = await prisma.organization.findFirst({
        where: {
          id: organizationId,
        },
      })

      if (!organization) throw new BadRequestError('Organization not found')

      const author = await prisma.user.findFirst({
        where: {
          id: authorId,
        },
      })

      if (!author) throw new BadRequestError('Author not found')

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
              id: authorId,
            },
          },
          organization: {
            connect: {
              id: organizationId,
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
