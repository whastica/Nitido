import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  OPENAI_API_KEY: z.string().default("sk-placeholder"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().default("https://placeholder.supabase.co"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().default("placeholder"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().default("placeholder"),
  // Clerk
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().optional(),
  CLERK_SECRET_KEY: z.string().optional(),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().default("/login"),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().default("/register"),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z.string().default("/dashboard"),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: z.string().default("/dashboard"),
  USE_MOCK_AI: z.enum(["true", "false"]).default("true"),
  USE_MOCK_DB: z.enum(["true", "false"]).default("true"),
  AI_TEMPERATURE: z.string().transform(Number).default("0.3"),
  RATE_LIMIT_REQUESTS_PER_MINUTE: z.string().transform(Number).default("10"),
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
}).refine(
  (data) => {
    if (data.NODE_ENV === "production" && data.USE_MOCK_AI === "false" && data.UPSTASH_REDIS_REST_URL) {
      return !!data.UPSTASH_REDIS_REST_TOKEN;
    }
    return true;
  },
  {
    message:
      "UPSTASH_REDIS_REST_TOKEN es obligatorio cuando UPSTASH_REDIS_REST_URL está configurado en producción",
  }
);

type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const formatted = result.error.errors
      .map((e) => `  ✗ ${e.path.join(".")}: ${e.message}`)
      .join("\n");
    throw new Error(
      `\n❌ Variables de entorno inválidas:\n${formatted}\n\n` +
      `Copia .env.example a .env.local y completa los valores requeridos.\n`
    );
  }
  return result.data;
}

export const env = validateEnv();
export const isDev = env.NODE_ENV === "development";
export const isProd = env.NODE_ENV === "production";
export const useMockAI = env.USE_MOCK_AI === "true";
export const useMockDB = env.USE_MOCK_DB === "true";
