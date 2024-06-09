import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { ResourceNotFoundError } from 'src/http/_errors/resource-not-found-error'
import { prisma } from 'src/lib/prismadb'
import z from 'zod'

export async function deleteOrganizationRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete(
    '/organizations/:organizationId/members',
    {
      schema: {
        summary: 'Get organization members',
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
        throw new ResourceNotFoundError('Organization not found')
      }

      await prisma.organization.delete({
        where: {
          id: organizationId,
        },
      })

      return reply.status(204).send({})
    },
  )
}
