/*
* Group: Francis Corona, Ian Stewart
* Project: Social Network - Phase 3
* Due: 6/13/24, 11:59 PM EDT
*/

import multer from 'multer';
import createLogger from '../config/logger.mjs';
import { convertPhoto } from '../utils/convertPhoto.mjs';

const logger = createLogger('profileController');

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        cb(null, 'ProfilePic' + req.user._id);
    }
});

const upload = multer({ storage: storage });

export const uploadMiddleware = upload.single('profilePic')

export const updateProfilePic = async (req, res) => {
    try {
        const user = req.user;

        // Check if file was uploaded when user clicks submit
        if (!req.file) {
            throw new Error('No file uploaded');
        }

        // Convert photo to base64
        user.profilePic = await convertPhoto(req.file.path);

        // Save user
        await user.save();

        // Redirect to the profile page
        res.redirect('/profile');
    } catch (err) {
        let errorMessage = 'Error updating profile picture';
        if (err.message === 'No file uploaded') {
            errorMessage = 'No file uploaded';
        }
        logger.error(`Error updating profile picture: ${req.user._id} ${err}`);
        res.status(500).send({ message: errorMessage, error: err });
    }
};