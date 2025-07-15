import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { errorHandler } from './middlewares/errorHandler';

import rulesRoutes from "./routes/rule.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => {
    res.send('Server is up and running!');
});

mongoose.connect(process.env.MONGO_URI || '')
    .then(() => {
        console.log('Connected to MongoDB');

        app.use('/api/rules', rulesRoutes);

        app.use(errorHandler);

        app.listen(PORT, () => {
            console.log(`Server is listening on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB', error);
    });
