import express from "express";
import cors from "cors";
import "dotenv/config";

import fs from "node:fs";
import path from "node:path";

import { clerkMiddleware } from "@clerk/express";
import { clerkWebhookHandler } from "./webhooks/clerk";
import { getEnv } from "./lib/env.js";
import keepAliveCron from "./lib/cron.js";


import productRouter from "./routes/productRouter";
import meRouter from "./routes/meRouter";
import streamRouter from "./routes/streamRouter.js";

const env = getEnv();

const app = express();

const rawjson = express.raw({
    type: "application/json",
    limit: "1mb",
});

// Clerk webhook
app.post("/webhooks/clerk", rawjson, (req, res) => {
    void clerkWebhookHandler(req, res);
});

// Normal JSON body parser
app.use(express.json());

app.use(clerkMiddleware());

app.use(cors());

app.get("/health", (req, res) => {
    res.json({status: "ok"});
});

app.use("/api/me", meRouter);
app.use("/api/products", productRouter);
app.use("/api/stream", streamRouter);

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

app.listen(env.PORT, () => {
    console.log("listening on port:", env.PORT);
});