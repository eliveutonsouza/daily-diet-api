import { FastifyInstance } from "fastify";
import { knex } from '../database'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { checkIfUserLogon } from '../middlewares/check-if-user-logon'

export async function usersRoutes(app: FastifyInstance) {
  // Realiza o registro do usuário
  app.post('/register', async (req, reply) => {
    const createDietBodySchema = z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string(),
      avatar: z.string().url(),
    })

    const { name, avatar, email, password } = createDietBodySchema.parse(req.body)

    await knex('user').insert({
      id: randomUUID(),
      name,
      email,
      password,
      avatar
    })

    return reply.status(201).send({
      message: 'Create user.'
    })
  })

  // Realiza login no perfil do usuário registrado
  app.post('/login', async (req, reply) => {
    const createUserSchema = z.object({
      email: z.string().email(),
      password: z.string()
    })

    const createSearchForEmailSchema = z.object({
      id: z.string(),
      email: z.string(),
      password: z.string(),
    })

    // Busca de informações no body da requisição (Schema)
    const { email, password } = createUserSchema.parse(req.body)

    // Consultas ao banco de dados
    const searchForEmail = await knex('user').where({ email }).first()

    const dataBaseUser = createSearchForEmailSchema.parse(searchForEmail)

    // Pega o cookie sessionId
    let sessionId = req.cookies.sessionId

    if (email !== dataBaseUser.email || password !== dataBaseUser.password) {
      reply.status(404).send({
        error: 'User not found.',
      })
    }

    // Verifica se o usuário já está autenticado
    if (sessionId) {
      reply.status(201).send({
        message: "User already authenticated"
      })
    }

    // Verifica se o usuário já está autenticado, se não ele 
    // autentica e cria uma sessionId
    if (!sessionId) {
      reply.cookie("sessionId", dataBaseUser.id, {
        path: '/',
        maxAge: 1000 * 60 * 1 // 1 hour
      })

      reply.status(201).send({
        message: "User authenticated"
      })
    }
  })

  // Realiza o logou do usuário
  app.post('/logout', { preHandler: [checkIfUserLogon] }, async (req, reply) => {
    // Pega o cookie sessionId
    let sessionId = req.cookies.sessionId

    // Verifica se o usuário já está autenticado
    if (sessionId) {
      reply.clearCookie('sessionId')

      reply.status(201).send({
        message: "User logged out."
      })

    }
  })
}