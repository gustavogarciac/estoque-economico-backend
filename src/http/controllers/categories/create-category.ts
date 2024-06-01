import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { BadRequestError } from "src/http/_errors/bad-request-error";
import { prisma } from "src/lib/prismadb";
import z from "zod";

export async function createCategoryRoute(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post("/categories", {
      schema: {
        summary: "Create a new category",
        tags: ['categories'],
        body: z.object({
          name: z.string(),
          description: z.string().optional(),
          imageUrl: z.string().optional()
        }),
        response: {
          201: z.object({
            categoryId: z.string().uuid()
          })
        }
      }
    }, async (req, reply) => {

      const {
        name,
        description,
        imageUrl
      } = req.body
      
      const categoryAlreadyExists = await prisma.category.findUnique({
        where: {
          name
        }
      }) 

      if(categoryAlreadyExists) throw new BadRequestError('Category already exists')

      const category = await prisma.category.create({
        data: {
          name,
          description,
          imageUrl
        }
      })

      return reply.status(201).send({
        categoryId: category.id
      })

    })
}