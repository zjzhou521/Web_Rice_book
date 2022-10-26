// this is profile.js which contains all user profile information except passwords which is in auth.js
const mongoose = require('mongoose');
const userProfileSchema = require('./userProfileSchema');
const connectionString = 'mongodb+srv://xxxxxx';
const UserProfile = mongoose.model('userProfile', userProfileSchema);
const uploadImage = require('./uploadCloudinary'); // add cloudinary
const cloudinary = require('cloudinary')

function getHeadline(req, res) {
    let requestUsername = req.params.user;
    let username = req.username; // currently logged username

    if (!requestUsername) { // get currently logged user's status
        (async () => {
            const connector = mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });
            await UserProfile.find({username: username}).exec(function (err,items) {
                items.forEach(function (userProfile) {
                    let headline = userProfile.status;
                    res.send({username: username, headline: headline});
                })
            })
        })();
    } else { // get requested logged user's status
        (async () => {
            const connector = mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });
            await UserProfile.find({username: requestUsername}).exec(function (err,items) {
                if (items.length > 0) {
                    items.forEach(function (userProfile) {
                        let headline = userProfile.status;
                        res.send({username: requestUsername, headline: headline});
                    })
                } else {
                    res.send({result: "Invalid username! "});
                }

            })
        })();
    }
}

function putHeadline(req, res) {
    let username = req.username; // currently logged username
    let newHeadline = req.body.headline;
    const filter = {username: username};
    const update = {status:newHeadline};
    (async () => {
        const connector = mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });
        await UserProfile.findOneAndUpdate(filter, update).exec(function (err,item) {
            res.send({username: username, headline: newHeadline});
        })
    })();
}

function getEmail(req, res) {
    let username = req.params.user;
    if (!username) {
        username = req.username; // current logged username
    }

    (async () => {
        const connector = mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });
        await UserProfile.find({username: username}).exec(async function (err,items) {
            if (items.length == 0) {
                res.send({result: "User not found! "});
            } else {
                res.send({username: username, email: items[0].email});
            }
        });
    })();
}

function getDisplayName(req, res) {
    let username = req.params.user;
    if (!username) {
        username = req.username; // current logged username
    }

    (async () => {
        const connector = mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });
        await UserProfile.find({username: username}).exec(async function (err,items) {
            if (items.length == 0) {
                res.send({result: "User not found! "});
            } else {
                res.send({username: username, displayname: items[0].displayName});
            }
        });
    })();
}

function putDisplayName(req, res) {
    let username = req.username; // currently logged username
    let newDisplayName = req.body.displayname;

    (async () => {
        const connector = mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });
        UserProfile.findOneAndUpdate({username: username}, {displayName: newDisplayName}).exec(function (err,item) {
            if (item) {
                // third, get new article
                UserProfile.find({username: username}).exec(function (err,items) {
                    res.send({username: username, displayname: items[0].displayName});
                })
            } else {
                res.send({result: "User profile not found! "});
            }
        })
    })();
}

function getPhone(req, res) {
    let username = req.params.user;
    if (!username) {
        username = req.username; // current logged username
    }

    (async () => {
        const connector = mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });
        await UserProfile.find({username: username}).exec(async function (err,items) {
            if (items.length == 0) {
                res.send({result: "User not found! "});
            } else {
                res.send({username: username, phone: items[0].phone});
            }
        });
    })();
}

function putPhone(req, res) {
    let username = req.username; // currently logged username
    let newPhone = req.body.phone;

    (async () => {
        const connector = mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });
        UserProfile.findOneAndUpdate({username: username}, {phone: newPhone}).exec(function (err,item) {
            if (item) {
                // third, get new article
                UserProfile.find({username: username}).exec(function (err,items) {
                    res.send({username: username, phone: items[0].phone});
                })
            } else {
                res.send({result: "User profile not found! "});
            }
        })
    })();
}

function putEmail(req, res) {
    let username = req.username; // currently logged username
    let newEmail = req.body.email;

    (async () => {
        const connector = mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });
        UserProfile.findOneAndUpdate({username: username}, {email: newEmail}).exec(function (err,item) {
            if (item) {
                // third, get new article
                UserProfile.find({username: username}).exec(function (err,items) {
                    res.send({username: username, email: items[0].email});
                })
            } else {
                res.send({result: "User profile not found! "});
            }
        })
    })();
}

function getDob(req, res) {
    let username = req.params.user;
    if (!username) {
        username = req.username; // current logged username
    }

    (async () => {
        const connector = mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });
        await UserProfile.find({username: username}).exec(async function (err,items) {
            if (items.length == 0) {
                res.send({result: "User not found! "});
            } else {
                res.send({username: username, dob: items[0].dob});
            }
        });
    })();
}

function getZipcode(req, res) {
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
                res.send({username: username, zipcode: items[0].zipcode});
            }
        });
    })();
}

function putZipcode(req, res) {
    let username = req.username; // currently logged username
    let newZipcode = req.body.zipcode;

    (async () => {
        const connector = mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });
        UserProfile.findOneAndUpdate({username: username}, {zipcode: newZipcode}).exec(function (err,item) {
            if (item) {
                UserProfile.find({username: username}).exec(function (err,items) {
                    res.send({username: username, zipcode: items[0].zipcode});
                })
            } else {
                res.send({result: "User profile not found! "});
            }
        })
    })();
}

function getAvatar(req, res) {
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
                res.send({username: username, avatar: items[0].avatar});
            }
        });
    })();
}

function uploadAvatar(req, res) {
    let username = req.username; // currently logged username
    const image = cloudinary.image(req.fileid, {
        format: "png", width: 100, height: 100, crop: "fill"
    });
    let newAvatarUrl = req.fileurl;

    (async () => {
        const connector = mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });
        UserProfile.findOneAndUpdate({username: username}, {avatar: newAvatarUrl}).exec(function (err,item) {
            if (item) {
                UserProfile.find({username: username}).exec(function (err,items) {
                    res.send({username: username, avatar: items[0].avatar});
                })
            } else {
                res.send({result: "User profile not found! "});
            }
        })
    })();
}


module.exports = (app) => {
    app.get('/headline/:user?', getHeadline);
    app.put('/headline', putHeadline);
    app.get('/email/:user?', getEmail);
    app.put('/email', putEmail);
    app.get('/phone/:user?', getPhone);
    app.put('/phone', putPhone);
    app.get('/displayname/:user?', getDisplayName);
    app.put('/displayname', putDisplayName);
    app.get('/dob/:user?', getDob);
    app.get('/zipcode/:user?', getZipcode);
    app.put('/zipcode', putZipcode);
    app.get('/avatar/:user?', getAvatar);
    app.put('/avatar', uploadImage.uploadImage('avatar'), uploadAvatar);
}

