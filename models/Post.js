const mongoose = require('mongoose');
const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    caption: {
        type: String,
        required: true,
        maxLength: 40
    },
    photo: {
        type: String,
        required: true,
    },
    comments: {
        type: [mongoose.Types.ObjectId],
        ref: 'Comment'
    },
    creator: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
        select: false
    }
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);

module.exports = Post;