import { FastifyRequest, FastifyReply } from "fastify"

export async function checkIfUserLogon(req: FastifyRequest, reply: FastifyReply) {
  const sessionId = req.cookies.sessionId

  if (!sessionId) {
    return reply.status(401).send({
      error: 'Unauthorized.',
    })
  }
}