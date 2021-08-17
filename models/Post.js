const mongoose = require('mongoose');
const postSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
        maxLength: 40
    },
    photoPath: {
        type: String,
        required: true,
    },

}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);

module.exports = Post;