# @platypus/node

A lightweight structured logger for Node.js applications.

Platypus provides simple logging with support for log levels, request IDs, and structured metadata.

## Installation

```bash
pnpm add @platypus/node
```

or:

```bash
npm install @platypus/node
```

## Quick Start

Create a logger with a service name and logging endpoint:

```ts
import { createLogger } from "@platypus/node";

const logger = createLogger({
  service: "my-api",
  endpoint: "",
});
```

You can then write logs using the available log levels:

```ts
logger.debug("Processing request");

logger.info("Server started");

logger.warn("Rate limit approaching");

logger.error("Database connection failed");
```

## Request IDs

Platypus supports request IDs to help trace individual requests across multiple log entries.

```ts
import { randomUUID } from "node:crypto";
import { createLogger } from "@platypus/node";

const logger = createLogger({
  service: "my-api",
  endpoint: "",
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

## Structured Logging

Attach additional metadata to your log entries:

```ts
logger.info("User authenticated", requestId, {
  userId: "123",
  method: "password",
});
```

Structured metadata keeps contextual information separate from the log message and makes logs easier to process and inspect.

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

`createLogger` requires both `service` and `endpoint`.

```ts
const logger = createLogger({
  service: "my-api",
  endpoint: "",
});
```

### `service`

Identifies the application or service producing the logs.

```ts
service: "payments-api"
```

### `endpoint`

Specifies the endpoint used by Platypus for log delivery.

```ts
endpoint: "https://example.com/logs"
```

For local development or when no remote endpoint is being used:

```ts
endpoint: ""
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
  endpoint: "",
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
  endpoint: "",
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
  endpoint: "",
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
