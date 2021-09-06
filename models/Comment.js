const mongoose = require('mongoose');
const { CommentStatus } = require('./constants');

const commentSchema = new mongoose.Schema({
    post: {
        type: mongoose.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    text: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: {
            values: [CommentStatus.PENDING, CommentStatus.ACCEPTED, CommentStatus.REJECTED],
            message: 'Status should be PENDING or ACCEPTED or REJECTED'
        },
        required: true
    }
}, { timestamps: true });

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;