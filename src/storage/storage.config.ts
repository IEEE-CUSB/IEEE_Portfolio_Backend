export interface R2Config {
  endpoint: string;
  accessKeyId: string;
  accessKeySecret: string;
  bucketName: string;
  region: string;
}

export const getR2Config = (): R2Config => {
  let endpoint = process.env.BB_ENDPOINT || '';
  if (endpoint && !endpoint.startsWith('http://') && !endpoint.startsWith('https://')) {
    endpoint = `https://${endpoint}`;
  }

  return {
    endpoint,
    accessKeyId: process.env.BB_ACCESS_KEY_ID || '',
    accessKeySecret: process.env.BB_SECRET_ACCESS_KEY || '',
    bucketName: process.env.BB_BUCKET_NAME || '',
    region: process.env.BB_REGION || '',
  };
};
