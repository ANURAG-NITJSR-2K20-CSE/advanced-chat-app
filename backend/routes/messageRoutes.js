const express = require('express');
const router = express.Router();
const {protect} = require('../middleware/authMiddlware');
const { sendMessage, allMessages, reactToMessage } = require("../controllers/messageControllers");

router.route('/').post(protect, sendMessage);
/* Support both URL shapes in case a proxy or client strips a path segment */
router.put('/react/:messageId', protect, reactToMessage);
router.put('/:messageId/react', protect, reactToMessage);
router.route('/:chatId').get(protect, allMessages);

module.exports = router;