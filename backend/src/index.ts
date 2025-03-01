import express, { Application, Request, Response } from 'express';
import cors from 'cors';

const PORT = 3000;

const app: Application = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors());

app.get('/', (req, res) => {
    res.json('Hello World');
});

app.post('/api/screenshot', (req: Request, res: Response) => {
    const { screenshot } = req.body;
    
    if (!screenshot) {
        res.status(400).json({ error: 'Screenshot missing' });
        return 
    }
    console.log(screenshot);

    

    // Store screenshot in database

    res.status(200).json('Screenshot received');
    return
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
