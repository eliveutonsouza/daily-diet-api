import { describe, beforeAll, afterAll, beforeEach, it } from "vitest";
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'

describe("Daily Diet routes", () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it("Should be able to create a user", async () => {
    await request(app.server)
      .post('/users/register')
      .send({
        "name": "Lades Bella",
        "email": "lades@hotmail.com",
        "password": "87654321",
        "avatar": "https://github.com/isabellalades.png"
      })
      .expect(201)
  })

  it("Should be able to login withe a user", async () => {
    await request(app.server)
      .post('/users/register')
      .send({
        "name": "Lades Bella",
        "email": "lades@hotmail.com",
        "password": "87654321",
        "avatar": "https://github.com/isabellalades.png"
      })

    await request(app.server)
      .post('/users/login')
      .send({
        "email": "lades@hotmail.com",
        "password": "87654321",
      })
      .expect(201)
  })

  it("Should be able to login withe a user", async () => {
    await request(app.server)
      .post('/users/register')
      .send({
        "name": "Lades Bella",
        "email": "lades@hotmail.com",
        "password": "87654321",
        "avatar": "https://github.com/isabellalades.png"
      })

    const createLoginResponse = await request(app.server)
      .post('/users/login')
      .send({
        "email": "lades@hotmail.com",
        "password": "87654321",
      })

    const cookies = createLoginResponse.get('Set-Cookie')

    await request(app.server)
      .post('/users/logout')
      .set({})
      .expect(201)
  })
})