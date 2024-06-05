import fastifyJwt from '@fastify/jwt'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import fastify from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod'

import { env } from './env'
import { authenticateWithPasswordRoute } from './http/controllers/authenticate-with-password'
import { createCategoryRoute } from './http/controllers/categories/create-category'
import { deleteCategoryRoute } from './http/controllers/categories/delete-category'
import { getCategoriesRoute } from './http/controllers/categories/get-categories'
import { getCategoryDetailsRoute } from './http/controllers/categories/show-category-details'
import { updateCategoryRoute } from './http/controllers/categories/update-category'
import { createOrganizationRoute } from './http/controllers/organizations/create-organization'
import { getOrganizationMembersRoute } from './http/controllers/organizations/get-organization-members'
import { registerUserRoute } from './http/controllers/register-user'
import { errorHandler } from './http/error-handler'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
})

app.register(fastifySwagger, {
  swagger: {
    consumes: ['application/json'],
    produces: ['application/json'],
    info: {
      title: 'Estoque Econômico',
      description:
        'Especificações da API para o back-end da aplicação Estoque Econômico',
      version: '1.0.0',
    },
  },
  transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.setErrorHandler(errorHandler)

/* ============== Routes ============== */

/* Auth Routes */
app.register(registerUserRoute)
app.register(authenticateWithPasswordRoute)

/* Categories routes */
app.register(createCategoryRoute)
app.register(getCategoryDetailsRoute)
app.register(getCategoriesRoute)
app.register(deleteCategoryRoute)
app.register(updateCategoryRoute)

/* Organization routes */
app.register(createOrganizationRoute)
app.register(getOrganizationMembersRoute)

app
  .listen({
    port: 3333,
  })
  .then(() => console.log('HTTP server running.'))
