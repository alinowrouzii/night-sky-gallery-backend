const mongoose = require('mongoose');
const { CommentStatus } = require('./constants');

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



postSchema.statics.findAndPapulate = function (filter) {

    return this.find(filter).populate(
        {
            path: 'comments',
            match: {
                //to only return ACCEPTED comment
                status: CommentStatus.ACCEPTED
            },
            //TODO: add status field to be exclUded
            select: '-post -__v',

            populate: {
                path: 'user',
                select: '+firstName +lastName +username -_id -__v -createdAt -updatedAt'
            }
        }
    ).select('-__v').lean()
}

const Post = mongoose.model('Post', postSchema);

module.exports = Post;