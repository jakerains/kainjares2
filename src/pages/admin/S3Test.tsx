import React, { useState } from 'react';
import { Upload, CheckCircle, XCircle, RefreshCw, Save, Edit } from 'lucide-react';
import { S3Client, ListObjectsCommand } from '@aws-sdk/client-s3';
import { uploadToS3 } from '../../lib/s3';
import { createS3Client } from '../../lib/s3Client';

const S3Test = () => {
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [uploadUrl, setUploadUrl] = useState<string>('');
  const [bucketInfo, setBucketInfo] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [config, setConfig] = useState({
    endpoint: import.meta.env.VITE_S3_ENDPOINT || '',
    bucket: import.meta.env.VITE_S3_BUCKET || '',
    accessKey: import.meta.env.VITE_S3_ACCESS_KEY || '',
    secretKey: import.meta.env.VITE_S3_SECRET_KEY || ''
  });

  const handleConfigChange = (key: keyof typeof config) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig(prev => ({ ...prev, [key]: e.target.value }));
  };

  const handleSaveConfig = () => {
    // In a real application, you would save this to a secure storage
    // For now, we'll just update the state and use it for testing
    setIsEditing(false);
    // Reset connection status since config changed
    setConnectionStatus('idle');
    setErrorMessage('');
    setBucketInfo('');
  };

  const testConnection = async () => {
    setConnectionStatus('testing');
    setErrorMessage('');
    setBucketInfo('');
    
    const { endpoint, bucket, accessKey: accessKeyId, secretKey: secretAccessKey } = config;
    
    if (!accessKeyId || !secretAccessKey || !endpoint || !bucket) {
      setConnectionStatus('error');
      setErrorMessage('Missing required configuration. Please check all fields.');
      return;
    }
    
    try {
      // Initialize S3 client
      const client = createS3Client();
      
      // Test connection by attempting to list objects (with max 1 result)
      const command = new ListObjectsCommand({
        Bucket: bucket,
        MaxKeys: 1
      });
      
      await client.send(command);
      setBucketInfo(`Successfully connected to bucket: ${bucket}`);
      
      setConnectionStatus('success');
    } catch (error) {
      console.error('S3 connection test failed:', error);
      setConnectionStatus('error');
      let message = 'Failed to connect to S3. ';
      
      if (error instanceof Error) {
        if (error.name === 'NetworkingError' || error.message.includes('Network Error')) {
          message += 'Network error - check your internet connection and endpoint URL.';
        } else if (error.name === 'InvalidAccessKeyId') {
          message += 'Invalid access key - check your credentials.';
        } else if (error.name === 'SignatureDoesNotMatch') {
          message += 'Invalid secret key - check your credentials.';
        } else if (error.name === 'NoSuchBucket') {
          message += 'Bucket does not exist or you do not have access to it.';
        } else {
          message += error.message;
          // Log the full error for debugging
          console.error('Detailed error:', error);
        }
      }
      
      setErrorMessage(message);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file size (100MB limit)
    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB in bytes
    if (file.size > MAX_FILE_SIZE) {
      setUploadStatus('error');
      setErrorMessage('File size too large. Maximum size is 100MB.');
      return;
    }

    setUploadStatus('uploading');
    setErrorMessage('');
    setUploadUrl('');

    try {
      const url = await uploadToS3(file, 'test');
      setUploadUrl(url);
      setUploadStatus('success');
    } catch (error) {
      console.error('Test upload failed:', error);
      setUploadStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to upload file');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">S3 Connection Test</h1>
        <p className="mt-2 text-gray-400">
          Test your DreamObjects S3 connection and file uploads
        </p>
      </div>

      <div className="grid gap-6">
        {/* Connection Test */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Connection Test</h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <button
                onClick={testConnection}
                disabled={connectionStatus === 'testing'}
                className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50"
              >
                {connectionStatus === 'testing' ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <RefreshCw className="w-5 h-5" />
                )}
                Test Connection
              </button>

              {connectionStatus === 'success' && (
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  Connection successful {bucketInfo && `- ${bucketInfo}`}
                </div>
              )}

              {connectionStatus === 'error' && (
                <div className="flex items-center gap-2 text-red-400">
                  <XCircle className="w-5 h-5" />
                  Connection failed
                </div>
              )}
            </div>

            {errorMessage && (
              <p className="text-red-400">{errorMessage}</p>
            )}
          </div>
        </div>

        {/* Upload Test */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Upload Test</h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <input
                type="file"
                onChange={handleFileUpload}
                disabled={uploadStatus === 'uploading'}
                className="hidden"
                id="test-file"
              />
              <label
                htmlFor="test-file"
                className={`flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors cursor-pointer ${
                  (uploadStatus === 'uploading' || !config.endpoint || !config.bucket || !config.accessKey || !config.secretKey) ? 'opacity-50' : ''
                }`}
                onClick={(e) => {
                  if (!config.endpoint || !config.bucket || !config.accessKey || !config.secretKey) {
                    e.preventDefault();
                    setErrorMessage('Please configure all S3 settings before uploading');
                  }
                }}
              >
                {uploadStatus === 'uploading' ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Upload className="w-5 h-5" />
                )}
                {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload Test File'}
              </label>

              {uploadStatus === 'success' && (
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  Upload successful
                </div>
              )}

              {uploadStatus === 'error' && (
                <div className="flex items-center gap-2 text-red-400">
                  <XCircle className="w-5 h-5" />
                  Upload failed
                </div>
              )}
            </div>

            {errorMessage && (
              <p className="text-red-400">{errorMessage}</p>
            )}

            {uploadUrl && (
              <div className="mt-4">
                <p className="text-sm text-gray-400 mb-2">Uploaded file URL:</p>
                <a
                  href={uploadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-400 hover:underline break-all"
                >
                  {uploadUrl}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Configuration Info */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Configuration</h2>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            ) : (
              <button
                onClick={handleSaveConfig}
                className="flex items-center gap-2 px-3 py-1.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Endpoint URL
                <span className="text-xs text-gray-500 ml-2">(e.g., https://s3.us-east-005.dream.io)</span>
              </label>
              <input
                type="text"
                value={config.endpoint}
                onChange={handleConfigChange('endpoint')}
                disabled={!isEditing}
                placeholder="https://s3.us-east-005.dream.io"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-teal-500 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Bucket Name
              </label>
              <input
                type="text"
                value={config.bucket}
                onChange={handleConfigChange('bucket')}
                disabled={!isEditing}
                placeholder="your-bucket-name"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-teal-500 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Access Key
              </label>
              <input
                type="text"
                value={config.accessKey}
                onChange={handleConfigChange('accessKey')}
                disabled={!isEditing}
                placeholder="your-access-key"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-teal-500 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Secret Key
              </label>
              <input
                type="password"
                value={config.secretKey}
                onChange={handleConfigChange('secretKey')}
                disabled={!isEditing}
                placeholder="your-secret-key"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-teal-500 disabled:opacity-50"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default S3Test;