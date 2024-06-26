import { FastifyInstance } from 'fastify'
import { ZodError } from 'zod'

import { BadRequestError } from './_errors/bad-request-error'
import { ResourceNotFoundError } from './_errors/resource-not-found-error'
import { UnauthorizedError } from './_errors/unauthorized-error'

type FastifyErrorHandler = FastifyInstance['errorHandler']

export const errorHandler: FastifyErrorHandler = async (
  error,
  request,
  reply,
) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: 'Validation Error',
      errors: error.flatten().fieldErrors,
    })
  }

  if (error instanceof BadRequestError) {
    return reply.status(400).send({
      message: error.message,
    })
  }

  if (error instanceof UnauthorizedError) {
    return reply.status(401).send({
      message: error.message,
    })
  }

  if (error instanceof ResourceNotFoundError) {
    return reply.status(404).send({
      message: error.message,
    })
  }

  console.error(error)
  return reply.status(500).send({ message: 'Internal server error ' })
}
