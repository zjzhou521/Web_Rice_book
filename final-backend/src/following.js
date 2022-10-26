const mongoose = require('mongoose');
const userSchema = require('./userSchema');
const userProfileSchema = require('./userProfileSchema');
const connectionString = 'mongodb+srv://xxxxxxx';

const UserProfile = mongoose.model('userProfile', userProfileSchema);

function getFollowing(req, res) { // get list of users followed by requested user
    let username = req.params.user;
    if (!username) {
        username = req.username; // currently logged username
    }
    (async () => {
        const connector = mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });
        await UserProfile.find({username: username}).exec(async function (err,items) {
            if (items.length == 0) {
                res.send({result: "User not found! "});
            } else {
                let userProfile = items[0];
                res.send({username: username, following: userProfile.followingList});
            }
        });
    })();
}

function putFollowing(req, res) {
    let username = req.username; // currently logged username
    let newFollowingUsername = req.params.user;
    let newFollowingList = [];
    if (username == newFollowingUsername) {
        res.send({result: "You can not follow yourself "});
        return;
    }

    (async () => {
        const connector = mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });
        await UserProfile.find({username: newFollowingUsername}).exec(async function (err,items) {
            if (items.length == 0) {
                res.send({result: "User not found! "});
            } else {
                UserProfile.find({username: username}).exec(async function (err,items) {
                    // add new following user
                    let curUserFollowingList = items[0].followingList;
                    for (let i = 0; i < curUserFollowingList.length; i++) {
                        if (curUserFollowingList[i] == newFollowingUsername) {
                            res.send({result: "You have already followed this user! "});
                            return;
                        }
                        newFollowingList.push(curUserFollowingList[i]);
                    }
                    newFollowingList.push(newFollowingUsername);
                    // update profile
                    await (connector.then(async ()=> {
                        UserProfile.findOneAndUpdate({username: username}, {followingList: newFollowingList}).exec(function (err,item) {
                            if (item) {
                                // third, get new following list
                                UserProfile.find({username: username}).exec(function (err,items) {
                                    res.send({username: username, following: items[0].followingList});
                                })
                            } else {
                                res.send({result: "User not found! "});
                            }
                        })
                    }))
                })
            }
        });
    })();
}

function deleteFollowing(req, res) {
    let username = req.username; // currently logged username
    let deleteFollowingUsername = req.params.user;
    let newFollowingList = [];

    (async () => {
        const connector = mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });
        await UserProfile.find({username: username}).exec(async function (err,items) {
            if (items.length == 0) {
                res.send({result: "User not found! "});
                return;
            } else {
                // delete a following user
                let curUserFollowingList = items[0].followingList;
                let hasFlag = false;
                for (let i = 0; i < curUserFollowingList.length; i++) {
                    if (curUserFollowingList[i] != deleteFollowingUsername) {
                        newFollowingList.push(curUserFollowingList[i]);
                    } else {
                        hasFlag = true;
                    }
                }
                if (!hasFlag) {
                    res.send({result: "User not found! "});
                    return;
                }
                // update profile
                await (connector.then(async ()=> {
                    UserProfile.findOneAndUpdate({username: username}, {followingList: newFollowingList}).exec(function (err,item) {
                        if (item) {
                            // third, get new following list
                            UserProfile.find({username: username}).exec(function (err,items) {
                                res.send({username: username, following: items[0].followingList});
                            })
                        } else {
                            res.send({result: "User not found! "});
                        }
                    })
                }))
            }
        });
    })();
}


module.exports = (app) => {
    app.get('/following/:user?', getFollowing);
    app.put('/following/:user', putFollowing);
    app.delete('/following/:user', deleteFollowing);

}

