import { Firestore } from '@google-cloud/firestore';
import { PROJECT_ID } from './constants.js';

const firestore = new Firestore({ 
    projectId: PROJECT_ID, 
    ignoreUndefinedProperties: true 
});

export default firestore;
