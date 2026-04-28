import { env } from "./env";

export type StoredAsset = {
  key: string;
  publicUrl: string;
};

export async function createUploadTarget(fileName: string): Promise<StoredAsset> {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
  const key = `exports/${Date.now()}-${safeName}`;

  if (!env.r2.bucketName || !env.r2.publicBaseUrl) {
    return {
      key,
      publicUrl: `/local-placeholder/${key}`
    };
  }

  return {
    key,
    publicUrl: `${env.r2.publicBaseUrl.replace(/\/$/, "")}/${key}`
  };
}
