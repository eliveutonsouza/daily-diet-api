import { Knex } from "knex";

declare module 'knex/types/tables' {
  export interface Tables {
    user: {
      id: string,
      name: string,
      email: string,
      password:string,
      avatar: string,
      created_at: string
    },
    register_meal: {
      id: string,
      name: string,
      description: string,
      date_time: string,
      in_diet: boolean,
      created_at: string,
      user_id: string
    }
  }
}