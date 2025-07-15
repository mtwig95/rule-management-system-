"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
console.log("Starting server...");
console.log("PORT:", PORT);
console.log("MONGO_URI:", process.env.MONGO_URI);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/', (req, res) => {
    res.send('Server is up and running!');
});
mongoose_1.default.connect(process.env.MONGO_URI || '', {})
    .then(() => {
    console.log('Connected to MongoDB');
    app.use('/api/users', user_routes_1.default);
    app.use((req, res, next) => {
        console.log(`[${req.method}] ${req.url}`);
        next();
    });
    app.listen(PORT, () => {
        console.log(`Server is listening on port ${PORT}`);
    });
})
    .catch((error) => {
    console.error('Error connecting to MongoDB', error);
});
