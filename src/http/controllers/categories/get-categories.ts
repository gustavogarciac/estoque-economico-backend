import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { ResourceNotFoundError } from "src/http/_errors/resource-not-found-error";
import { prisma } from "src/lib/prismadb";
import z from "zod";

export async function getCategoriesRoute(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get("/organizations/:organizationId/categories", {
      schema: {
        summary: "Get a organization categories",
        tags: ['categories', 'organizations'],
        params: z.object({
          organizationId: z.string().uuid(),
        }),
        response: {
          200: z.array(z.object({
            id: z.string().uuid(),
            name: z.string(),
            description: z.string().nullish(),
            imageUrl: z.string().nullish(),
         }))
        }
      }
    }, async (req, reply) => {
      const { organizationId } = req.params

      const organization = await prisma.organization.findUnique({
        where: {
          id: organizationId
        }
      })

      if(!organization) throw new ResourceNotFoundError("Organization not found!")
      
      const categories = await prisma.category.findMany({
        where: {
          organizationId
        },
        select: {
          id: true,
          name: true,
          description: true,
          imageUrl: true
        },
        orderBy: {
          name: 'asc'
        }
      })

      return reply.status(200).send(categories)
    })
}