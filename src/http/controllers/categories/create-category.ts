import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { BadRequestError } from 'src/http/_errors/bad-request-error'
import { auth } from 'src/http/middlewares/auth'
import { prisma } from 'src/lib/prismadb'
import z from 'zod'

export async function createCategoryRoute(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/organizations/:slug/categories',
      {
        schema: {
          summary: 'Create a new category',
          tags: ['categories'],
          security: [
            {
              bearerAuth: [],
            },
          ],
          params: z.object({
            slug: z.string(),
          }),
          body: z.object({
            name: z.string(),
            description: z.string().optional(),
            imageUrl: z.string().nullish(),
          }),
          response: {
            201: z.object({
              categoryId: z.string().uuid(),
            }),
          },
        },
      },
      async (req, reply) => {
        const { name, description, imageUrl } = req.body
        const { slug } = req.params

        const { organization } = await req.getMembership(slug)
        await req.verifyAdmin(slug)

        const categoryAlreadyExists = await prisma.category.findFirst({
          where: {
            name,
            organizationId: organization.id,
          },
        })

        if (categoryAlreadyExists)
          throw new BadRequestError('Category already exists')

        const category = await prisma.category.create({
          data: {
            name,
            description,
            imageUrl,
            organization: {
              connect: {
                id: organization.id,
              },
            },
          },
        })

        return reply.status(201).send({
          categoryId: category.id,
        })
      },
    )
}
