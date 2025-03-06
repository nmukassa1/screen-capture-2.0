import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs-extra';
import path from 'path';
import tagRoutes from './routes/tagRoutes';
import screenshotRoutes from './routes/screenshotRoutes';

const PORT = 3000;

const app: Application = express();

// Ensure upload directory exists
const UPLOAD_DIR = path.join(__dirname, 'uploads');
fs.ensureDirSync(UPLOAD_DIR);

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors({ origin: '*' }));

app.get('/', (req, res) => {
    res.json('Hello World');
});

app.use("/tags", tagRoutes);
app.use("/screenshots", screenshotRoutes);

app.post('/api/screenshot', (req: Request, res: Response) => {
    const { screenshot } = req.body;
    
    if (!screenshot) {
        res.status(400).json({ error: 'Screenshot missing' });
        return 
    }
   
    const result = convertImageToFile(screenshot);
    console.log(result);
    

    res.status(200).json({ success: true });
    return
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

async function convertImageForStorage(image: string) {
    const base64Data = image.replace(/^data:image\/png;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    return buffer;
}

interface ConvertImageResult {
    success?: boolean;
    path?: string;
    error?: string;
}

async function convertImageToFile(image: string): Promise<ConvertImageResult>  {
    try {
        // Remove Base64 prefix (data:image/png;base64,)
        const base64Data = image.replace(/^data:image\/png;base64,/, "");
        
        // Generate unique filename
        const filename = `${uuidv4()}.png`;
        const filePath = path.join(UPLOAD_DIR, filename);

        // Convert Base64 to a file
        await fs.writeFile(filePath, base64Data, 'base64');

        // Here, you would store `filename` or `filePath` in a database
        console.log(`Saved screenshot as: ${filePath}`);

        return {success: true, path: `/uploads/${filename}`};
    } catch (error) {
        console.error('Error saving screenshot:', error);
        return {error: 'Failed to save screenshot'};
    }
}