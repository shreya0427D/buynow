import { z } from "zod";

const envschema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.coerce.number().default(3000),
    DATABASE_URL: z.string().min(1),

    CLERK_PUBLISHABLE_KEY: z.string().min(1),
    CLERK_SECRET_KEY: z.string().min(1),
    CLERK_WEBHOOK_SECRET: z.string().optional(),

    FRONTEND_URL: z.string().url(),

    POLAR_ACCESS_TOKEN: z.string().optional(),
    POLAR_API_KEY: z.string().optional(),
    POLAR_API_BASE: z.string().url().default("https://api.polar.sh"),
    POLAR_CHECKOUT_PRODUCT_ID: z.string().uuid(),

    STREAM_API_KEY: z.string().min(1),
    STREAM_API_SECRET: z.string().min(1),

    IMAGEKIT_PUBLIC_KEY: z.string().min(1),
    IMAGEKIT_URL_ENDPOINT: z.string().url(),
    IMAGEKIT_PRIVATE_KEY: z.string().min(1),

    SENTER_DSN: z.string().url().optional(),
});

export type Env = z.infer<typeof envschema>;

let cachedEnv: Env | null = null;

export function getEnv() {
    if (!cachedEnv) {
        const parsed = envschema.safeParse(process.env);

        if (!parsed.success) {
            console.error(parsed.error.flatten().fieldErrors);
            throw new Error("Invalid environment variables");
        }

        cachedEnv = parsed.data;
    }

    return cachedEnv;
}