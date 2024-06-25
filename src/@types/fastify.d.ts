import 'fastify'

import { Member, Organization } from '@prisma/client'

declare module 'fastify' {
  export interface FastifyRequest {
    getCurrentUserId(): Promise<string>
    getMembership(
      slug: string,
    ): Promise<{ organization: Organization; membership: Member }>
    verifyAdmin(orgSlug: string): Promise<void>
  }
}
