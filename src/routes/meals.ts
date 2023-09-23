import { FastifyInstance } from "fastify";
import { knex } from "../database";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { checkIfUserLogon } from "../middlewares/check-if-user-logon";

export async function mealsRoutes(app: FastifyInstance) {
  // Cria uma Meal no banco de dados de acordo com o usuário logado
  app.post("/", { preHandler: [checkIfUserLogon] }, async (req, reply) => {
    console.log(req.body);

    const createRegisterMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      date_time: z.string(),
      in_diet: z.boolean(),
    });

    const userId = req.cookies.sessionId;

    const { name, description, date_time, in_diet } =
      createRegisterMealBodySchema.parse(req.body);

    await knex("register_meal").insert({
      id: randomUUID(),
      name,
      description,
      date_time,
      in_diet,
      user_id: userId,
    });

    return reply.status(201).send();
  });

  // Lista estatísticas do usuário todas as Meals do banco de dados de acordo com o usuário logado
  app.get(
    "/summary",
    { preHandler: [checkIfUserLogon] },
    async (req, reply) => {
      const sessionId = req.cookies.sessionId;

      const countMeals = await knex("register_meal")
        .where("user_id", sessionId)
        .select()
        .count("id", { as: "count" })
        .first();
      const countInDiet = await knex("register_meal")
        .where({ user_id: sessionId, in_diet: true })
        .select()
        .count("in_diet", { as: "in_diet" })
        .first();
      const countOutDiet = await knex("register_meal")
        .where({ user_id: sessionId, in_diet: false })
        .select()
        .count("in_diet", { as: "out_diet" })
        .first();

      if (
        countMeals &&
        countInDiet !== undefined &&
        countOutDiet !== undefined
      ) {
        const bestSequence =
          countInDiet.in_diet > countOutDiet.out_diet
            ? countInDiet
            : countOutDiet;

        const summary = {
          count: countMeals.count,
          in_diet: countInDiet.in_diet,
          out_diet: countOutDiet.out_diet,
          bestSequence: bestSequence,
        };

        return reply.status(201).send({ summary });
      }

      return reply.status(404).send({ message: "Summary not found." });
    }
  );

  // Lista todas as Meals do banco de dados de acordo com o usuário logado
  app.get("/", { preHandler: [checkIfUserLogon] }, async (req, reply) => {
    const sessionId = req.cookies.sessionId;

    const meals = await knex("register_meal")
      .where("user_id", sessionId)
      .select();

    return reply.status(201).send({ meals });
  });

  // Pega uma Meal especifica pelo ID no banco de dados de acordo com o usuário logado
  app.get("/:id", { preHandler: [checkIfUserLogon] }, async (req, reply) => {
    const getMealsParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = getMealsParamsSchema.parse(req.params);

    const { sessionId } = req.cookies;

    const meal = await knex("register_meal")
      .where({
        user_id: sessionId,
        id,
      })
      .select();

    return reply.status(201).send({ meal });
  });

  // Altera uma Meal no banco de dados de acordo com o usuário logado
  app.put("/:id", { preHandler: [checkIfUserLogon] }, async (req, reply) => {
    const getMealsParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const createRegisterMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      date_time: z.string(),
      in_diet: z.boolean(),
    });

    const { id } = getMealsParamsSchema.parse(req.params);

    const { sessionId } = req.cookies;

    const { 
      name, 
      description, 
      date_time, 
      in_diet 
    } =
      createRegisterMealBodySchema.parse(req.body);

    const [returnUpdate] = await knex("register_meal")
      .where({
        user_id: sessionId,
        id,
      })
      .select()
      .update({
        name,
        description,
        date_time,
        in_diet,
        user_id: sessionId,
      })
      .returning("*");

    if (!returnUpdate) {
      return reply.status(404).send({
        message: "Meal not found.",
      });
    }

    return reply.status(201).send();
  });

  // Apaga uma Meal especifica pelo ID no banco de dados de acordo com o usuário logado
  app.delete("/:id", { preHandler: [checkIfUserLogon] }, async (req, reply) => {
    const getMealsParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = getMealsParamsSchema.parse(req.params);

    const { sessionId } = req.cookies;

    const meal = await knex("register_meal")
      .where({
        user_id: sessionId,
        id,
      })
      .select()
      .del();

    console.log(meal);

    return reply.status(201).send();
  });
}
