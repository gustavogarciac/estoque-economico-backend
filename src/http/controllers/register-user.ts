import { hash } from "bcryptjs";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "src/lib/prismadb";
import z from "zod";

export async function registerUserRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>()
    .post("/users", {
      schema: {
        summary: "Register a new user",
        tags: ['users'],
        body: z.object({
          email: z.string().email(),
          name: z.string(),
          password: z.string().min(6)
        }),
        response: {
          201: z.object({
            userId: z.string().uuid()
          })
        }
      }
    }, async (req, reply) => {

      const {
        email,
        name,
        password
      } = req.body

      const emailAlreadyInUse = await prisma.user.findFirst({
        where: {
          email
        }
      })

      if(emailAlreadyInUse) {
        throw new Error()
      }

      const passwordHash = await hash(password, 8)

      const { id: userId } = await prisma.user.create({
        data: {
          email,
          name,
          passwordHash,
        }
      })

      return reply.status(201).send({
        userId
      })

    })
}