import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

app.get('/status', (req, res) => {
    res.json({ message: "API is running with JavaScript!" });
});

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});