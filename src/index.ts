import { buildApp } from "./app";
import { PORT } from "./const";

const fastify = buildApp();

fastify.listen({ host: "0.0.0.0", port: PORT }, function (err, address) {
  if (err) {
    fastify.log.error(err);
  }

  fastify.log.debug(address);
});
