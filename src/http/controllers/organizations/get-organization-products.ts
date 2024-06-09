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
        tags: ['organizations'],
        params: z.object({
          organizationId: z.string().uuid(),
        }),
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
      })

      return reply.status(200).send(products)
    },
  )
}
