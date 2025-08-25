import { db } from "../../firebase";

export function logErrorToFirestore(error: any): void {
    console.log('Logging error into Firestore...', error);
    try {
        // Print db object to check if it's correctly initialized
        console.log('DB object available:', !!db);
        
        const docRef = db.collection('errors').doc();
        console.log('Created document reference');
        
        // Print more details about the error
        const errorData = {
            message: error.message || 'Unknown error',
            stack: error.stack || 'No stack trace',
            timestamp: new Date(),
            name: error.name || 'Unknown',
            code: error.code || 'none',
            additionalInfo: JSON.stringify(error)
        };
        
        console.log('Preparing to write error data:', errorData);
        
        docRef.set(errorData)
            .then(() => console.log('Error successfully logged to Firestore'))
            .catch(err => {
                console.error('Failed to write error into Firestore:', err);
                // Show more details about the Firestore write error
                console.error('Error details:', {
                    name: err.name,
                    code: err.code,
                    message: err.message,
                    stack: err.stack
                });
            });
    } catch (err) {
        console.error(`Exception when logging error into Firestore:`, err);
    }
};