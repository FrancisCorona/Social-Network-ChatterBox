/*
* Group: Francis Corona, Ian Stewart
* Project: Social Network - Phase 3
* Due: 6/11/24, 11:59 PM EDT
*/

import Friends from '../models/friends.mjs';
import User from '../models/user.mjs';
import createLogger from '../config/logger.mjs';

const logger = createLogger('friendsController-module');

export const addFriend = async (req, res) => {
    try {
        // Check if the friend record for the user already exists
        let friendsRecord = await Friends.findOne({ user: req.user._id });

        // Ensure the friend exists in the User collection
        const friend = await User.findById(req.params.id);
        if (!friend) {
            logger.error(`${req.user._id} tried friending invalid user`);
            return res.status(404).send({ message: 'Friend not found' });
        }

        if (!friendsRecord) {
            // If no record exists, create a new one
            friendsRecord = new Friends({
                user: req.user._id, // Doesn't work to set the _id field to the user id
                friends: [req.params.id]
            });
        } else {
            // If record exists, add the friend if not already in the list
            if (!friendsRecord.friends.includes(req.params.id)) {
                friendsRecord.friends.push(req.params.id);
            }
        }

        await friendsRecord.save();
        res.redirect('/profile');
        logger.info(`${friend.name} added to ${req.user.name}'s friend list`);
    } catch (err) {
        logger.error(`Error adding friend: ${req.user._id} ${err}`);
        res.status(500).send({ message: 'Error adding friend', error: err });
    }
}

export const removeFriend = async (req, res) => {
    try {
        // Find the user's friends record
        const friendsRecord = await Friends.findOne({ user: req.user._id });

        // Ensure the friend exists in the User collection
        const friend = await User.findById(req.params.id);
        if (!friend) {
            logger.error(`${req.user._id} tried unfriending invalid user`);
            return res.status(404).send({ message: 'Friend not found' });
        }

        if (friendsRecord) {
            // Remove the friend from the list
            friendsRecord.friends = friendsRecord.friends.filter(id => id.toString() !== req.params.id);

            await friendsRecord.save();
            res.redirect('/profile');
            logger.info(`${friend.name} removed from ${req.user.name}'s friend list`);
        } else {
            logger.info(`Friends record not found for: ${req.user._id}`);
            res.status(404).send({ message: 'Friends record not found' });
        }
    } catch (err) {
        logger.error(`Error removing friend: ${req.user._id} ${err}`);
        res.status(500).send({ message: 'Error removing friend', error: err });
    }
}