import fastifyMongo, { FastifyMongodbOptions } from "@fastify/mongodb";
import { FastifyInstance, FastifyPluginOptions } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { Document, Filter } from "mongodb";

import { MONGO_URL } from "./const";

async function dbConnector(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
) {
  fastify.register(fastifyMongo, {
    database: "nourl",
    url: MONGO_URL,
  } as FastifyMongodbOptions);
}

export default fastifyPlugin(dbConnector);

export function urlAggregatePipeline(
  filter: Filter<Document>,
  limit: number = 20,
  skip: number = 0,
  sort: Record<string, number> = {},
) {
  const $sort = Object.assign(sort, { _id: -1 });

  return [
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "id",
        as: "owner",
      },
    },
    {
      $set: {
        owner: {
          $ifNull: [{ $first: "$owner" }, null],
        },
      },
    },
    {
      $unset: [
        "id",
        "owner.id",
        "owner.github_id",
        "owner.facebook_id",
        "owner.google_id",
        "owner.hash_passwd",
      ],
    },
    {
      $match: filter,
    },
    {
      $sort,
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
  ];
}
