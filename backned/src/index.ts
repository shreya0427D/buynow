import express from "express";
import cors from "cors";
import "dotenv/config";

import fs from "fs";
import path from "node:path";

import { clerkMiddleware } from "@clerk/express";
import { clerkWebhookHandler } from "./webhooks/clerk";
import { getEnv } from "./lib/env";

const env = getEnv();

const app = express();

const rawjson = express.raw({
    type: "application/json",
    limit: "1mb",
});

app.post("/webhooks/clerk", rawjson, (req, res) => {
    void clerkWebhookHandler(req, res);
});

app.post("/webhooks/polar", rawjson, (req, res) => {
    void clerkWebhookHandler(req, res);
});
app.post("/api/users", rawjson, (req, res) => {
    void clerkWebhookHandler(req, res);
});
app.post("/webhooks/clerk", rawjson, (req, res) => {
    void clerkWebhookHandler(req, res);
});
app.post("/webhooks/clerk", rawjson, (req, res) => {
    void clerkWebhookHandler(req, res);
});
app.use(express.json());

app.use(clerkMiddleware());

app.use(cors());

const publicDir = path.join(process.cwd(), "public");
if(fs.existsSync(publicDir)){
    app.use(express.static(publicDir));

    app.get("*", (req, res, next) => {
        if(req.method !== "GET") {
            next();
            return;
        }

    if(req.path.startsWith("/api") || req.path.startsWith("/webhooks")) {
        next();
        return;
    } 
        res.sendFile(path.join(publicDir, "index.html"),(err) => next(err));

    });
}

app.listen(env.PORT, () => {
    console.log("listening on port:", env.PORT);
});