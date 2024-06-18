import axios from 'axios';
import fs from 'fs/promises';
import sharp from 'sharp';

export const convertPhoto = async (filePath) => {
    try {
        // Read the uploaded file
        const data = await fs.readFile(filePath);

        // Resize the image and convert to PNG
        const resized = await sharp(data).resize(256).png().toBuffer();

        // Convert image to base64
        const b64 = Buffer.from(resized).toString('base64');

        return b64; // Store the base64 string directly as a buffer
    } catch (err) {
        throw new Error(`Error converting photo: ${err.message}`);
    }
};

export const getBase64 = async (url) => {
    try {

        // Download image from url and store in buffer
        const response = await axios.get(url, { responseType: 'arraybuffer' });

        // Convert buffer to base64
        const base64 = Buffer.from(response.data, 'binary').toString('base64')

        return base64;
    } catch (err) {
        throw new Error('Error converting profile picture to base64');
    }
}