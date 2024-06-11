import sharp from 'sharp';
import multer from 'multer';
import fs from 'fs/promises';
import createLogger from '../config/logger.mjs';

const logger = createLogger('profileController');

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, 'ProfilePic' + req.user._id)
    }
});
 
var upload = multer({ storage: storage });

export const uploadMiddleware = upload.single('profilePic')

export const updateProfilePic =  async (req, res) => {
	try {
        const user = req.user;

        // Check if file was uploaded when user clicks submit
        if (!req.file) {
            throw new Error('No file uploaded');
        }

        // Read the uploaded file
        const data = await fs.readFile(req.file.path);

        // Resize the image and convert to PNG
        const resized = await sharp(data).resize(256).png().toBuffer();

        // Convert image to base64
        const b64 = Buffer.from(resized).toString('base64');
        user.profilePic = b64; // Store the base64 string directly as a buffer

        // Save user
        await user.save();

        // Redirect to the profile page
        res.redirect('/profile');
    } catch (err) {
        logger.error(`Error updating profile picture: ${req.user._id} {${err}}`);
        res.status(500).send({ message: 'Error updating profile picture: ', error: err });
    }
};