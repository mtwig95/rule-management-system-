import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './app';

dotenv.config();

const PORT = process.env.PORT || 3001;

mongoose.connect(process.env.MONGO_URI || '')
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Server is listening on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB', error);
    });
