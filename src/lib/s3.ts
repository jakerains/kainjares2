import { Buffer } from 'buffer';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { createS3Client } from './s3Client';

/**
 * Upload a file to S3 compatible storage (DreamObjects)
 * @param file - The file to upload
 * @param path - The folder path where the file should be stored
 * @returns Promise with the public URL of the uploaded file
 */
export const uploadToS3 = async (
  file: File,
  path: string
): Promise<string> => {
  let s3Client;
  try {
    // Get S3 configuration from environment variables
    const bucket = import.meta.env.VITE_S3_BUCKET;
    const endpoint = import.meta.env.VITE_S3_ENDPOINT;
    const endpointUrl = new URL(endpoint);
    
    // Validate all required configuration
    const requiredConfig = {
      bucket,
      endpoint,
      accessKey: import.meta.env.VITE_S3_ACCESS_KEY,
      secretKey: import.meta.env.VITE_S3_SECRET_KEY
    };

    const missingConfig = Object.entries(requiredConfig)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingConfig.length > 0) {
      throw new Error(`Missing S3 configuration: ${missingConfig.join(', ')}`);
    }

    // Format the filename to be URL-safe and unique
    const timestamp = new Date().getTime();
    const safeFilename = file.name.replace(/[^a-zA-Z0-9.]/g, '-');
    const key = `${path}/${timestamp}-${safeFilename}`;
    
    // Get S3 client
    s3Client = createS3Client();
    
    // Validate file size
    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File size too large. Maximum size is 100MB.');
    }
    
    // Read file content
    const fileContent = await file.arrayBuffer();
    
    // Create upload parameters
    const uploadParams = {
      Bucket: bucket,
      Key: key.replace(/^\//, ''), // Remove leading slash if present
      Body: Buffer.from(fileContent), 
      ContentType: file.type || 'application/octet-stream',
      ACL: 'public-read',
      // Add metadata to help with troubleshooting
      Metadata: {
        'original-filename': file.name,
        'content-type': file.type || 'application/octet-stream'
      }
    };
    
    console.log('Starting S3 upload:', {
      bucket,
      key,
      contentType: file.type,
      fileSize: file.size,
      endpoint
    });

    // Upload to S3
    const command = new PutObjectCommand(uploadParams);
    let response;
    try {
      response = await s3Client.send(command);
    } catch (uploadError: any) {
      console.error('S3 upload command failed:', uploadError);
      throw new Error(uploadError.message || 'Failed to upload file to storage');
    }

    if (!response.$metadata.httpStatusCode || response.$metadata.httpStatusCode !== 200) {
      throw new Error('Upload failed: Unexpected response from storage service');
    }
    
    console.log('S3 upload completed:', response);
    
    // Construct the URL using path-style URL format for DreamObjects
    const urlSafeKey = key.replace(/^\//, '');
    return `${endpoint}/${bucket}/${urlSafeKey}`;
  } catch (error: any) {
    // Log detailed error information
    console.error('S3 Upload Error:', {
      message: error.message,
      code: error.code,
      name: error.name,
      $metadata: error.$metadata,
      requestId: error.requestId,
      statusCode: error.statusCode
    });
    
    // Provide more specific error messages
    let errorMessage = 'Failed to upload file. ';
    if (error.code === 'NetworkingError') {
      errorMessage += 'Please check your internet connection.';
    } else if (error.code === 'InvalidAccessKeyId') {
      errorMessage += 'Invalid access credentials.';
    } else if (error.code === 'NoSuchBucket') {
      errorMessage += 'The specified bucket does not exist.';
    } else if (error.$metadata?.httpStatusCode === 403) {
      errorMessage += 'Permission denied. Check your access credentials.';
    } else {
      errorMessage += error.message || 'Please try again later.';
    }
    
    throw new Error(errorMessage);
  }
};