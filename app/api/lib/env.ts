import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

export const env = {
  appId: required("APP_ID"),
  appSecret: required("APP_SECRET"),
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: required("DATABASE_URL"),
  vapidPublicKey: required("VAPID_PUBLIC_KEY"),
  vapidPrivateKey: required("VAPID_PRIVATE_KEY"),
  onesignalAppId: required("ONESIGNAL_APP_ID"),
  onesignalApiKey: required("ONESIGNAL_API_KEY"),
};
