import { Storage } from '@google-cloud/storage';

const storage = new Storage(); // Automatically uses GOOGLE_APPLICATION_CREDENTIALS from env
const bucketName = process.env.food-logger-storage;

const uploadFileToBucket = async (filePath, destination) => {
    const bucket = storage.bucket(bucketName);
    await bucket.upload(filePath, {
        destination,
        public: true,
    });
    console.log(`File uploaded to ${destination}`);
};

export { uploadFileToBucket };