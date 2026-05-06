import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import Fastify from "fastify";
import path from "node:path";

import { CORS_ORIGIN } from "./const";
import dbConnector from "./db";
import routes from "./routes";

export function buildApp() {
  const fastify = Fastify({ logger: true });

  fastify.register(dbConnector);
  fastify.register(routes);
  fastify.register(cors, { origin: CORS_ORIGIN });
  fastify.register(fastifyStatic, {
    root: path.join(__dirname, "../front/dist"),
  });

  return fastify;
}
