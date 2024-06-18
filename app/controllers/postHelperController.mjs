/*
* Group: Francis Corona, Ian Stewart
* Project: Social Network - Phase 3
* Due: 6/13/24, 11:59 PM EDT
*/

import createLogger from '../config/logger.mjs';
import { aiquery } from '../utils/callAPI.mjs';

const logger = createLogger('postHelperController-module');

export const expandContent = async (req, res) => {
    const { title, content } = req.body;
    logger.info('Request made to AI');
    try {
        const data = {
            inputs: content,
            system_context: `You are an advanced AI model designed to help users expand and elaborate on their thoughts to share on social media.
                            When given a message by a user, your task is to provide a more detailed version of that message by added a few more sentences.`, // Context to instrust the ai how to respond
        };

        const generatedText = await aiquery(data);

        // Store the generated text and title in sessions so that forms can be pre-filled
        req.session.generatedText = generatedText;
        req.session.title = title;

        res.redirect('/profile'); // Redirect the user to the profile page after post creation to refresh feed
    } catch (err) {
        const errorMessage = `AI Error: ${err.message}`;
        logger.error(`AI Error: ${req.user._id} ${errorMessage} - ${err}`);
        // Redirect to profile page with error message if authentication fails
        res.redirect(`/profile?error=${encodeURIComponent(errorMessage)}`);
    }
};