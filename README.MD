# @platypus/node

A lightweight structured logger for Node.js applications.

Platypus provides simple logging with support for log levels, request IDs, structured metadata, and API-key authentication. Logs are sent to the Platypus backend and can be viewed through the Platypus web interface.

## Installation

```bash
pnpm add @platypus/node
```

or:

```bash
npm install @platypus/node
```

## Quick Start

Create a logger with a service name and API key:

```ts
import { createLogger } from "@platypus/node";

const logger = createLogger({
  service: "my-api",
  apiKey: process.env.PLATYPUS_API_KEY!,
});
```

The Platypus backend endpoint is managed by the SDK by default, so you do not need to configure it manually.

You can then write logs using the available log levels:

```ts
logger.debug("Processing request");

logger.info("Server started");

logger.warn("Rate limit approaching");

logger.error("Database connection failed");
```

> **Security:** Store your API key in an environment variable. Never commit API keys to your source code or version control.

## Request IDs

Platypus supports request IDs to help trace individual requests across multiple log entries.

```ts
import { randomUUID } from "node:crypto";
import { createLogger } from "@platypus/node";

const logger = createLogger({
  service: "my-api",
  apiKey: process.env.PLATYPUS_API_KEY!,
});

const requestId = randomUUID();

logger.info("Request started", requestId);

logger.info("Processing request", requestId, {
  method: "GET",
  path: "/users",
});

logger.info("Request completed", requestId);
```

A request ID lets you associate multiple log entries with the same request:

```text
requestId=req_123 Request started
requestId=req_123 Processing request
requestId=req_123 Request completed
```

Request IDs are optional. You can also create logs without one:

```ts
logger.info("Server started");
```

## Structured Logging

Attach additional metadata to your log entries:

```ts
logger.info("User authenticated", requestId, {
  userId: "123",
  method: "password",
});
```

Structured metadata keeps contextual information separate from the log message and makes logs easier to process and inspect.

You can also attach metadata without a request ID:

```ts
logger.info("Server started", undefined, {
  port: 3000,
});
```

## Log Levels

Platypus supports four log levels:

```text
debug
info
warn
error
```

Example:

```ts
logger.debug("Processing request", requestId);

logger.info("User logged in", requestId);

logger.warn("Rate limit approaching", requestId);

logger.error("Database connection failed", requestId);
```

## Configuration

`createLogger` requires a `service` name and an `apiKey`. The `endpoint` is optional.

```ts
const logger = createLogger({
  service: "my-api",
  apiKey: process.env.PLATYPUS_API_KEY!,
});
```

### `service`

Identifies the application or service producing the logs.

```ts
service: "payments-api";
```

The service name is used to identify and organize logs in the Platypus dashboard.

### `apiKey`

Authenticates your application with the Platypus backend.

```ts
apiKey: process.env.PLATYPUS_API_KEY!;
```

Store your API key securely in an environment variable:

```env
PLATYPUS_API_KEY=plat_xxxxxxxxxxxxxxxxx
```

The SDK sends the key using the `Authorization` header:

```http
Authorization: Bearer plat_xxxxxxxxxxxxxxxxx
```

Do not commit your API key to source control.

### `endpoint`

The hosted Platypus backend endpoint is used by default.

For self-hosted deployments, you can provide your own Platypus backend endpoint:

```ts
const logger = createLogger({
  service: "my-api",
  apiKey: process.env.PLATYPUS_API_KEY!,
  endpoint: "http://localhost:3000/api",
});
```

The SDK sends logs to:

```text
{endpoint}/v1/logs
```

For example:

```text
http://localhost:3000/api/v1/logs
```

## Hono Example

Platypus can be used with Node.js frameworks such as Hono.

```ts
import { randomUUID } from "node:crypto";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { createLogger } from "@platypus/node";

const logger = createLogger({
  service: "platypus-hono-demo",
  apiKey: process.env.PLATYPUS_API_KEY!,
});

const app = new Hono();

app.get("/", (c) => {
  const requestId = randomUUID();

  logger.info("Root request started", requestId);

  logger.info("Processing request", requestId, {
    method: c.req.method,
    path: c.req.path,
  });

  return c.text("Hello Hono!");
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
```

## Express Example

Platypus can also be used with Express applications.

```ts
import { randomUUID } from "node:crypto";
import express from "express";
import { createLogger } from "@platypus/node";

const app = express();

const logger = createLogger({
  service: "platypus-express-demo",
  apiKey: process.env.PLATYPUS_API_KEY!,
});

app.get("/", (req, res) => {
  const requestId = randomUUID();

  logger.info("Root request started", requestId);

  logger.info("Processing request", requestId, {
    method: req.method,
    path: req.path,
  });

  res.send("Hello Express!");
});

app.listen(3000, () => {
  logger.info("Server started", undefined, {
    port: 3000,
  });
});
```

### Express Request Logging Middleware

For applications that want to log every incoming request, you can use Platypus in Express middleware:

```ts
import { randomUUID } from "node:crypto";
import express from "express";
import { createLogger } from "@platypus/node";

const app = express();

const logger = createLogger({
  service: "platypus-express-demo",
  apiKey: process.env.PLATYPUS_API_KEY!,
});

app.use((req, res, next) => {
  const requestId = randomUUID();

  logger.info("Request started", requestId, {
    method: req.method,
    path: req.path,
  });

  res.on("finish", () => {
    logger.info("Request completed", requestId, {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
    });
  });

  next();
});

app.get("/", (req, res) => {
  res.send("Hello Express!");
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
```

The middleware allows you to follow a request from start to completion using the same request ID:

```text
requestId=req_123 Request started
requestId=req_123 Request completed
```

## Viewing Logs

Logs sent by the Node.js SDK are received by the Platypus backend and made available through the Platypus web interface.

The dashboard can be used to:

- View application logs
- Filter logs by service
- Filter by log level
- Search log messages
- Follow requests using request IDs
- Inspect structured metadata

## Future Improvements

Planned features may include:

- Project-based log isolation
- Improved self-hosting support
- Additional Node.js integrations
- More advanced log filtering and search

## TypeScript

Platypus is written in TypeScript and includes TypeScript declarations.

```ts
import { createLogger } from "@platypus/node";
```

No additional type package is required.

## Development Status

Platypus is currently in early development.

The `0.x` releases may introduce API changes as the project evolves.

## License

MIT
