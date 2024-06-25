import { Role } from '@prisma/client'

import { UnauthorizedError } from '../_errors/unauthorized-error'

export function verifyAdmin(role: Role) {
  if (role !== 'ADMIN')
    throw new UnauthorizedError(
      "You don't have the permission to perform this action",
    )
}
