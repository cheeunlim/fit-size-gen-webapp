import { Storage } from '@google-cloud/storage';
import { PROJECT_ID } from './constants.js';

const storage = new Storage({ projectId: PROJECT_ID });

const LOGS_BUCKET_NAME = process.env.GCS_BUCKET_LOGS || 'musinsa-snap-logs';
const ASSETS_BUCKET_NAME = process.env.GCS_BUCKET_ASSETS || 'musinsa-snap-assets';

export const logsBucket = storage.bucket(LOGS_BUCKET_NAME);
export const assetsBucket = storage.bucket(ASSETS_BUCKET_NAME);
export default storage;
