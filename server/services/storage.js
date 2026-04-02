import storage, { logsBucket, assetsBucket } from '../config/storage.js';

// Helper: Get Proxy URL instead of Signed URL
export const getProxyUrl = (bucketName, filename) => {
    return `/api/proxy-image?bucket=${bucketName}&file=${filename}`;
};

// Upload Buffer to GCS
export const uploadToGCS = async (buffer, bucket, filename) => {
    try {
        const file = bucket.file(filename);
        await file.save(buffer, {
            resumable: false,
            metadata: { contentType: 'image/png' }
        });
        // Use Proxy URL to avoid Signing Error locally
        return { 
            filename, 
            uri: `gs://${bucket.name}/${filename}`, 
            signedUrl: getProxyUrl(bucket.name, filename) 
        };
    } catch (err) {
        console.error(`Upload failed for ${filename}:`, err);
        throw err;
    }
};

// Copy file
export const copyFile = async (filename, sourceBucket, destBucket) => {
    const srcFile = sourceBucket.file(filename);
    const destFile = destBucket.file(filename);
    await srcFile.copy(destFile);
    
    return { 
        filename, 
        uri: `gs://${destBucket.name}/${filename}`, 
        signedUrl: getProxyUrl(destBucket.name, filename) 
    };
};

export const saveAsset = async (uri, targetName, folderPath) => {
    if (!uri) return null;
    // Extract bucket and filename from generic GCS URI or just assume logsBucket for now
    const parts = uri.replace('gs://', '').split('/');
    const bucketName = parts.shift(); 
    const filename = parts.join('/');
    
    const srcBucket = storage.bucket(bucketName);
    const srcFile = srcBucket.file(filename);

    const destFile = assetsBucket.file(`${folderPath}${targetName}`);
    await srcFile.copy(destFile);

    return {
        uri: `gs://${assetsBucket.name}/${folderPath}${targetName}`
    };
};
