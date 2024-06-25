import fastifyCors from '@fastify/cors'
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
import { getProductStock } from './http/controllers/billing/get-product-stock'
import { createCategoryRoute } from './http/controllers/categories/create-category'
import { deleteCategoryRoute } from './http/controllers/categories/delete-category'
import { getCategoriesRoute } from './http/controllers/categories/get-categories'
import { getCategoryDetailsRoute } from './http/controllers/categories/show-category-details'
import { updateCategoryRoute } from './http/controllers/categories/update-category'
import { createOrganizationRoute } from './http/controllers/organizations/create-organization'
import { deleteOrganizationRoute } from './http/controllers/organizations/delete-organization'
import { getOrganizationMembersRoute } from './http/controllers/organizations/get-organization-members'
import { getOrganizationProductsRoute } from './http/controllers/organizations/get-organization-products'
import { getOrganizationsRoute } from './http/controllers/organizations/get-organizations'
import { createProductRoute } from './http/controllers/products/create-product'
import { updateProductRoute } from './http/controllers/products/update-product'
import { registerUserRoute } from './http/controllers/register-user'
import { getUserProfileRoute } from './http/controllers/users/get-user-details'
import { getUserOrganizationsRoute } from './http/controllers/users/get-user-organizations'
import { errorHandler } from './http/error-handler'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.register(fastifyCors, {
  origin: '*',
})

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
})

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Estoque Econômico',
      description: 'API Documentation for Estoque Econômico',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
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

/* User Routes */
app.register(getUserProfileRoute)
app.register(getUserOrganizationsRoute)

/* Product Routes */
app.register(createProductRoute)
app.register(updateProductRoute)

/* Categories routes */
app.register(createCategoryRoute)
app.register(getCategoryDetailsRoute)
app.register(getCategoriesRoute)
app.register(deleteCategoryRoute)
app.register(updateCategoryRoute)

/* Organization routes */
app.register(createOrganizationRoute)
app.register(getOrganizationMembersRoute)
app.register(getOrganizationProductsRoute)
app.register(deleteOrganizationRoute)
app.register(getOrganizationsRoute)

/* Billing Routes */
app.register(getProductStock)

app
  .listen({
    port: 3333,
  })
  .then(() => console.log('HTTP server running.'))
