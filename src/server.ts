import fastifySwagger from "@fastify/swagger"
import fastifySwaggerUi from "@fastify/swagger-ui"
import fastify from "fastify"
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from "fastify-type-provider-zod"
import { registerUserRoute } from "./http/controllers/register-user"
import { errorHandler } from "./http/error-handler"

const app = fastify()

app.register(fastifySwagger, {
  swagger: {
    consumes: ['application/json'],
    produces: ['application/json'],
    info: {
      title: "Estoque Econômico",
      description: "Especificações da API para o back-end da aplicação Estoque Econômico",
      version: "1.0.0"
    }
  },
  transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUi, {
  routePrefix: "/docs"
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.setErrorHandler(errorHandler)

/* Routes */
app.register(registerUserRoute)

app.listen({
  port: 3333,
}).then(() => (
  console.log('HTTP server running.')
))