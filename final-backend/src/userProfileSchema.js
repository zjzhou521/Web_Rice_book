const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required']
    },
    displayName: {
        type: String,
        required: [false, 'display name is not required']
    },
    phone: {
        type: String,
        required: [true, 'phone is required']
    },
    userId: {
        type: Number,
        required: [true, 'User id is required']
    },
    status: {
        type: String,
        required: [true, 'status is required']
    },
    email: {
        type: String,
        required: [true, 'email is required']
    },
    dob: {
        type: String,
        required: [true, 'date of birth is required']
    },
    zipcode: {
        type: String,
        required: [true, 'zipcode is required']
    },
    avatar: {
        type: String,
        required: [true, 'avatar url is required']
    },
    followingList: [{
        type: String,
    }],
    createdTime: {
        type: Date,
        required: [true, 'Created date is required']
    },
})

module.exports = userProfileSchema;
