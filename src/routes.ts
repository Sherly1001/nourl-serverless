import { FastifyInstance, FastifyPluginOptions } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { Document, Filter } from "mongodb";
import { NOTFOUND_FALLBACK_URL } from "./const";
import { urlAggregatePipeline } from "./db";

interface GetSchema {
  Params: {
    code: string;
  };
}

interface PostSchema {
  Body: {
    code: string;
    url: string;
  };
}

interface PutSchema extends GetSchema, PostSchema {}

const bodyCodeSchema = {
  schema: {
    body: { $ref: "code#" },
  },
};

async function routes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
) {
  const urls = fastify.mongo.db?.collection("urls");

  const getUrls = (
    filter: Filter<Document>,
    limit: number = 20,
    skip: number = 0,
    sort: Record<string, number> = {},
  ) => {
    return urls
      ?.aggregate(urlAggregatePipeline(filter, limit, skip, sort))
      .toArray();
  };

  const addUrl = async (
    code: string,
    newCode: { code: string; url: string },
  ) => {
    if (/[^a-zA-Z0-9\-_ ]/.test(code)) {
      throw new Error(
        "Code may only contain letters, numbers, spaces, - and _",
      );
    }

    const dbUrl = (await getUrls({ code }))?.[0] ?? null;
    if (dbUrl && dbUrl.owner) {
      throw new Error("not permission");
    }

    return await urls?.updateOne({ code }, { $set: newCode }, { upsert: true });
  };

  const removeUrl = async (code: string) => {
    const dbUrl = (await getUrls({ code }))?.[0] ?? null;
    if (dbUrl && dbUrl.owner) {
      throw new Error("not permission");
    }

    return await urls?.findOneAndDelete({ code });
  };

  fastify.addSchema({
    $id: "code",
    type: "object",
    required: ["code", "url"],
    properties: {
      code: { type: "string" },
      url: { type: "string" },
    },
  });

  fastify.get("/", function (_req, res) {
    res.sendFile("index.html");
  });

  fastify.get("/nourl.png", function (_req, res) {
    res.sendFile("nourl.png");
  });

  fastify.get<{
    Querystring: Record<string, string>;
  }>("/all/sher/urls", async function (req, _res) {
    const filter = req.query;
    const limit = filter.limit ? parseInt(filter.limit) : undefined;
    const skip = filter.skip ? parseInt(filter.skip) : undefined;

    const _sort = filter.sort ? filter.sort?.split(",") : [];
    const sort: Record<string, number> = {};
    for (let idx = 0; idx < _sort.length; idx += 2) {
      sort[_sort[idx]] = parseInt(_sort[idx + 1]);
    }

    delete filter.limit;
    delete filter.skip;
    delete filter.sort;

    return await getUrls(filter, limit, skip, sort);
  });

  fastify.get<GetSchema>("/:code", async function (req, res) {
    const url = await urls?.findOne({ code: req.params.code });
    res.redirect(
      url?.url || NOTFOUND_FALLBACK_URL || `https://${req.hostname}`,
    );
  });

  fastify.post<PostSchema>("/", bodyCodeSchema, function (req, res) {
    addUrl(req.body.code, req.body)
      .then((rs) => {
        res.send(rs);
      })
      .catch((err) => {
        res.code(403).send(err);
      });
  });

  fastify.put<PutSchema>("/:code", bodyCodeSchema, function (req, res) {
    addUrl(req.params.code, req.body)
      .then((rs) => {
        res.send(rs);
      })
      .catch((err) => {
        res.code(403).send(err);
      });
  });

  fastify.delete<GetSchema>("/:code", function (req, res) {
    removeUrl(req.params.code)
      .then((rs) => {
        res.send(rs);
      })
      .catch((err) => {
        res.code(403).send(err);
      });
  });
}

export default fastifyPlugin(routes);
