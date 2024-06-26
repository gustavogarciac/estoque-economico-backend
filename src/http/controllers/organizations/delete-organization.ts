import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { ResourceNotFoundError } from 'src/http/_errors/resource-not-found-error'
import { prisma } from 'src/lib/prismadb'
import z from 'zod'

export async function deleteOrganizationRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete(
    '/organizations/:slug',
    {
      schema: {
        summary: 'Delete organization',
        tags: ['organizations'],
        security: [
          {
            bearerAuth: [],
          },
        ],
        params: z.object({
          slug: z.string(),
        }),
      },
    },
    async (req, reply) => {
      const { slug } = req.params

      const organization = await prisma.organization.findFirst({
        where: {
          slug,
        },
      })

      if (!organization) {
        throw new ResourceNotFoundError('Organization not found')
      }

      await prisma.organization.delete({
        where: {
          id: organization.id,
        },
      })

      return reply.status(204).send({})
    },
  )
}
