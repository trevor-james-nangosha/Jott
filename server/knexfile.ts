require('dotenv').config()
import type { Knex } from "knex";
import {configDev, configProd} from "./config";

// Update with your config settings.

const config: { [key: string]: Knex.Config } = {
  production: configProd,
  development: configDev,

  // staging: {
  //   client: "postgresql",
  //   connection: {
  //     database: "my_db",
  //     user: "username",
  //     password: "password"
  //   },
  //   pool: {
  //     min: 2,
  //     max: 10
  //   },
  //   migrations: {
  //     tableName: "knex_migrations"
  //   }
  // },


};

module.exports = config;
