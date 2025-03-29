import { S3Client } from '@aws-sdk/client-s3';

// Create and cache the S3 client
let s3ClientInstance: S3Client | null = null;

/**
 * Creates or returns a cached S3 client instance
 */
export const createS3Client = (): S3Client => {
  if (s3ClientInstance) {
    return s3ClientInstance;
  }

  // Get credentials from environment variables
  const accessKeyId = import.meta.env.VITE_S3_ACCESS_KEY;
  const secretAccessKey = import.meta.env.VITE_S3_SECRET_KEY;
  const endpoint = import.meta.env.VITE_S3_ENDPOINT;
  const bucket = import.meta.env.VITE_S3_BUCKET;

  if (!accessKeyId || !secretAccessKey || !endpoint || !bucket) {
    throw new Error('Missing S3 credentials. Check environment variables.');
  }

  // Parse endpoint to ensure correct format
  const endpointUrl = new URL(endpoint);
  const region = endpointUrl.hostname.split('.')[1] || 'us-east-1';

  // Initialize S3 client with DreamObjects configuration
  s3ClientInstance = new S3Client({
    endpoint,
    region, // Use region from endpoint
    credentials: {
      accessKeyId,
      secretAccessKey
    },
    forcePathStyle: true, // Required for DreamObjects
    // Configure retries and timeouts
    maxAttempts: 5,
    retryMode: 'standard'
  });

  return s3ClientInstance;
};