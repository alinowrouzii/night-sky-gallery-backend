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
    //previous photos
    prevPhotos: {
        type: [String],
        select: false
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


//find document with all fields. It includes fields with select=false
postSchema.statics.findOneAndSelectAll = function (post) {
    return this.findOne(post).select('+prevPhotos').select('+creator');
}


const Post = mongoose.model('Post', postSchema);

module.exports = Post;