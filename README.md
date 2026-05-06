# nourl-serverless

URL shortener on AWS Lambda + API Gateway. Custom domain `nourl.space` via Cloudflare.

## Stack

- **Backend:** Fastify 4 + MongoDB Atlas, deployed as Lambda via `@fastify/aws-lambda`
- **Frontend:** React + Vite + Chakra UI, served as static files from Lambda
- **Infra:** AWS SAM, API Gateway HTTP API, ACM cert, Cloudflare DNS (orange cloud)

## Local Dev

```sh
cp .env.example .env
# fill in MONGO_URL

yarn install
cd front && yarn install && yarn build && cd ..
yarn dev        # backend on :9669, serves front/dist/
```

Frontend hot-reload:
```sh
cd front && yarn dev   # Vite dev server on :5173
```

## Deploy

### First time

```sh
# 1. Store MongoDB URL in SSM (ap-northeast-1)
aws ssm put-parameter \
  --name /nourl/mongo-url \
  --value "mongodb+srv://..." \
  --type SecureString \
  --region ap-northeast-1

# 2. Build
cd front && yarn build && cd ..
yarn build
sam build

# 3. Deploy — stack pauses at ACM cert creation
sam deploy --guided
# → open ACM console (ap-northeast-1), copy _<hash>.nourl.space CNAME
# → add to Cloudflare DNS (gray cloud, unproxied)
# → stack auto-continues once cert is ISSUED (~2 min)
```

### Cloudflare DNS setup (post-deploy)

| Step | Type | Name | Target | Proxy |
|------|------|------|--------|-------|
| Cert validation | CNAME | `_<hash>` | value from ACM console | Off (gray) |
| Live traffic | CNAME | `@` | `ApiGatewayDomainTarget` output from SAM | On (orange) |

Cloudflare SSL mode: **Full (Strict)**

### Subsequent deploys

```sh
cd front && yarn build && cd ..
yarn build
sam build
sam deploy
```

## Architecture

```
nourl.space (Cloudflare, orange cloud)
       ↓
API Gateway HTTP API (ap-northeast-1)
       ↓
Lambda: Fastify monolith
  ├── GET /            → front/dist/index.html
  ├── GET /assets/*    → front/dist/assets/
  ├── GET /:code       → redirect to URL (fallback: nourl.space)
  ├── POST /           → create short URL
  ├── PUT /:code       → upsert short URL
  ├── DELETE /:code    → remove short URL
  └── GET /all/sher/urls → admin list
       ↓
MongoDB Atlas
```

## Env Vars (Lambda / .env)

| Variable | Required | Default |
|----------|----------|---------|
| `MONGO_URL` | yes | — |
| `NOTFOUND_FALLBACK_URL` | no | `https://google.com` |
| `CORS_ORIGIN` | no | `*` |
| `PORT` | no (local only) | `9669` |

`MONGO_URL` in production is fetched from SSM Parameter Store (`/nourl/mongo-url`).

## Admin UI

Type `` on the keyboard (keys pressed on `document.body`) to reveal the List tab.
