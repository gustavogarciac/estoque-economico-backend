import { FastifyInstance } from 'fastify'
import fastifyPlugin from 'fastify-plugin'
import { prisma } from 'src/lib/prismadb'

import { UnauthorizedError } from '../_errors/unauthorized-error'

export const auth = fastifyPlugin(async (app: FastifyInstance) => {
  app.addHook('preHandler', async (request) => {
    request.getCurrentUserId = async () => {
      try {
        const { sub } = await request.jwtVerify<{ sub: string }>()

        return sub
      } catch (error) {
        throw new UnauthorizedError('Invalid Auth Token')
      }
    }

    request.getMembership = async (slug: string) => {
      const userId = await request.getCurrentUserId()

      const member = await prisma.member.findFirst({
        where: { userId, organization: { slug } },
        include: { organization: true },
      })

      if (!member) {
        throw new UnauthorizedError("You're not a member of this organization")
      }

      const { organization, ...membership } = member

      return {
        organization,
        membership,
      }
    }

    request.verifyAdmin = async (orgSlug: string) => {
      const { membership } = await request.getMembership(orgSlug)

      const { role } = membership

      console.log(role)

      if (role !== 'ADMIN') {
        throw new UnauthorizedError(
          "You don't have the permission to perform this action",
        )
      }
    }

    request.verifyMember = async (orgSlug: string) => {
      const userId = await request.getCurrentUserId()
      const { organization } = await request.getMembership(orgSlug)

      const member = await prisma.member.findFirst({
        where: { userId, organizationId: organization.id },
      })

      if (!member) {
        throw new UnauthorizedError("You're not a member of this organization")
      }
    }
  })
})
