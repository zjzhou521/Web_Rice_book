const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    pid: {
        type: Number,
        required: [true, 'post id is required']
    },
    author: {
        type: String,
        required: [true, 'author is required']
    },
    text: {
        type: String,
        required: [true, 'text is required']
    },
    imgUrl: {
        type: String,
        required: [false, 'imgUrl is not required']
    },
    date: {
        type: Date,
        required: [true, 'post date is required']
    },
    comments: [
        {
            commentAuthor: {
                type: String,
                required: [true, 'commentAuthor is required']
            },
            commentText: {
                type: String,
                required: [true, 'commentText is required']
            },
            commentDate: {
                type: Date,
                required: [true, 'commentDate is required']
            }
        }
    ],
    createdTime: {
        type: Date,
        required: [true, 'Created date is required']
    },
})

module.exports = articleSchema;
