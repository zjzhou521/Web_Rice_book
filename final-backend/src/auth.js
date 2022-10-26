const md5 = require('md5');
const redis = require('redis').createClient('redis://:xxxxxxxxxx');
const mongoose = require('mongoose');
const userSchema = require('./userSchema');
const userProfileSchema = require('./userProfileSchema');
const connectionString = 'mongodb+srv://xxxxxxx';

// cookieKey -> session id -> sessionUser
let sessionUser = new Map();
let cookieKey = "sid";
const User = mongoose.model('user', userSchema);
const UserProfile = mongoose.model('userProfile', userProfileSchema);


function register(req, res) {
    let username = req.body.username;
    let password = req.body.password;
    let displayName = req.body.displayName;
    let phone = req.body.phone;
    let email = req.body.email;
    let dob = req.body.dob; // in milliseconds
    let zipcode = req.body.zipcode;

    let salt = username + new Date().getTime();
    // check empty
    if (!username || !password) {
        return res.sendStatus(400);
    }
    let saltedPassword = md5(salt + password);
    // userObjs[username] = {salt: salt, hash: saltedPassword};
    (async () => {
        const connector = mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });
        /*
        async function createUser(username) {
            return new User({
                username: username,
                salt:salt,
                saltedPassword:saltedPassword,
                createdTime: Date.now(),
            }).save()
        }
        await (connector.then(async ()=> {
            await createUser(username)
        }));
        */
        const userExists = await User.exists({ username: username });
        if (userExists) {
            res.send({username: username, result: 'Registration failed! (username conflict) '});
        } else {
            await (connector.then(()=> {
                new User({
                    username: username,
                    salt:salt,
                    saltedPassword:saltedPassword,
                    createdTime: Date.now(),
                }).save()
            }))

            // first, get new user id
            await UserProfile.find().exec(async function (err,items) {
                let newUserId = items.length;
                // second, add user
                async function addUserProfile(username, userId, status, email, dob, zipcode, avatar) {
                    return new UserProfile({
                        username: username,
                        displayName: "",
                        phone: "123-123-1234",
                        userId: userId,
                        status: status,
                        email:email,
                        dob: dob,
                        zipcode:zipcode,
                        avatar: avatar,
                        followingList:[],
                        createdTime: Date.now(),
                    }).save()
                }
                async function addUserProfileComplete(username, userId, status, email, dob, zipcode, avatar, displayName, phone) {
                    return new UserProfile({
                        username: username,
                        displayName: displayName,
                        phone: phone,
                        userId: userId,
                        status: status,
                        email:email,
                        dob: dob,
                        zipcode:zipcode,
                        avatar: avatar,
                        followingList:[],
                        createdTime: Date.now(),
                    }).save()
                }
                await (connector.then(async ()=> {
                    if (displayName && phone) {
                        await addUserProfileComplete(username, newUserId, "Hello, World! ", email, dob, zipcode, "https://res.cloudinary.com/hxwpyrnb7/image/upload/v1638336810/sample.jpg", displayName, phone);
                    } else {
                        await addUserProfile(username, newUserId, "Hello, World! ", email, dob, zipcode, "https://res.cloudinary.com/hxwpyrnb7/image/upload/v1638336810/sample.jpg");
                    }
                }))
            });


            res.send({username: username, result: 'success'});
        }
    })();
}

function login(req, res) {
    let username = req.body.username;
    let password = req.body.password;
    if (!username || !password) {
        res.send({result: 'username or password cannot be empty'});
        return;
    }
    (async () => {
        const connector = mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });
        const userExists = await User.exists({ username: username});
        if (!userExists) {
            res.send({username: username, result: 'Login failed! (username not existed) '});
        } else {
            await User.find({username: username}).exec(function (err,items) {
                items.forEach(function(user) {
                    let saltedPassword = md5(user.salt + password);
                    if (saltedPassword == user.saltedPassword) {
                        //create session id, use sessionUser to map sid to user username
                        let sid = md5(user.saltedPassword + user.salt); // make sid a hash
                        sessionUser.set(sid, username);
                        // add them into redis cache
                        redis.hmset('sessions', sid, username);
                        // Adding cookie for session id
                        res.cookie(cookieKey, sid, { maxAge: 3600 * 1000, httpOnly: true, sameSite:'none', secure:true});
                        res.send({username: username, result: 'success'});
                    } else {
                        res.send({username: username, result: 'Login failed! (password not correct)'});
                    }
                })
            })
        }
    })();
}

function isLoggedIn(req, res, next) {
    // likely didn't install cookie parser
    if (!req.cookies) {
        // res.send({result: 'likely did not install cookie parser'});
        return res.sendStatus(401);
    }
    let sid = req.cookies[cookieKey];
    // no sid for cookie key
    if (!sid) {
        // res.send({result: 'Not logged in yet! '});
        return res.sendStatus(401);
    }
    let username = sessionUser.get(sid);
    // no username mapped to sid
    if (username) {
        req.username = username;
        next(); // continue to next endpoint
    }
    else {
        // res.send({result: 'Not logged in yet! '});
        return res.sendStatus(401)
    }
}

function logout(req, res) {
    if (req.cookies) {
        let sid = req.cookies[cookieKey];
        if (sid) {
            sessionUser.delete(sid);
            res.clearCookie(cookieKey);
        }
    }
    res.send('OK');
}



function putPassword(req, res) {
    let username = req.username; // currently logged username
    let newPassword = req.body.password;

    (async () => {
        const connector = mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });
        User.find({username: username}).exec(function (err,items) {
            if (items.length == 0) {
                res.send({result: "User not found! "});
            } else {
                let salt = items[0].salt;
                let newSaltedPassword = md5(salt + newPassword);
                if (newSaltedPassword) {
                    User.findOneAndUpdate({username: username}, {saltedPassword: newSaltedPassword}).exec(function (err,item) {
                        res.send({username: username, result: "success"});
                    })
                }
            }
        })
    })();
}


module.exports = (app) => {
    app.post('/register', register);
    app.post('/login', login);
    app.use(isLoggedIn);
    app.put('/password', putPassword); // change password
    app.put('/logout', logout);
}

