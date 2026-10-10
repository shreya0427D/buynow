import express from "express";
import cors from "cors";
import "dotenv/config";

import fs from "node:fs";
import path from "node:path";


import * as Sentry from "@sentry/node"; 


import { clerkMiddleware } from "@clerk/express";
import { clerkWebhookHandler } from "./webhooks/clerk.js";
import { polarWebhookHandler } from "./webhooks/polar.js";
import { getEnv } from "./lib/env.js";
import keepAliveCron from "./lib/cron.js";

import productRouter from "./routes/productRouter";
import meRouter from "./routes/meRouter";
import streamRouter from "./routes/streamRouter.js";
import chekoutRouter from "./routes/chekoutRouter";

import adminRouter from "./routes/adminRouter";
import orderRouter from "./routes/orderRouter";





import { sentryClerkUserMiddleware } from "./middleware/sentryClerkUser.js";

const env = getEnv();

keepAliveCron.start();

const app = express();

const rawjson = express.raw({
    type: "application/json",
    limit: "1mb",
});

// Clerk webhook
app.post("/webhooks/clerk", rawjson, (req, res) => {
    void clerkWebhookHandler(req, res);
});

app.post("/webhooks/polar", rawjson, (req, res) => {
    void polarWebhookHandler(req, res);
});

// Normal JSON body parser
app.use(express.json());

app.use(clerkMiddleware());

app.use(cors());
app.use(sentryClerkUserMiddleware);

app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});

app.use("/api/me", meRouter);
app.use("/api/products", productRouter);
app.use("/api/stream", streamRouter);
app.use("/api/chekout", chekoutRouter);
app.use("/api/chekout", adminRouter);
app.use("/api/orders", orderRouter);

// Public folder
const publicDir = path.join(process.cwd(), "public");

if (fs.existsSync(publicDir)) {
    app.use(express.static(publicDir));

    app.get("/{*any}", (req, res, next) => {
        if (req.method !== "GET") {
            next();
            return;
        }

        if (
            req.path.startsWith("/api") ||
            req.path.startsWith("/webhooks")
        ) {
            next();
            return;
        }

        res.sendFile(
            path.join(publicDir, "index.html"),
            (err) => next(err)
        );
    });
}
// sentry will be attached to the response object
Sentry.setupExpressErrorHandler(app);

// todo: add error handler middleware
app.use(
    (
        err: unknown,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        const sentryId = (res as express.Response & { sentry?: string }).sentry;

        res.status(500).json({
            error: "Internal server error",
            ...(sentryId !== undefined && { sentryId }),
        });
    }
);



app.listen(env.PORT, () => {
    console.log("listening on port:", env.PORT);
});