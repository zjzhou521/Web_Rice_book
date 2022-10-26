const auth = require('./src/auth');
const profile = require('./src/profile');
const article = require('./src/article');
const following = require('./src/following');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const userSchema = require('./src/userSchema');
const upCloud = require('./src/uploadCloudinary.js'); // add cloudinary
const User = mongoose.model('user', userSchema);
// google authentication
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

// TODO: add correct string
const connectionString = 'mongodb+srv://xxxxxxxxx';
// add CORS
const cors = require('cors');
const corsOptions = {origin: ["http://localhost:4200", "https://final-front-jay.surge.sh"], credentials: true};

// let frontendURL = "http://localhost:4200/";
let frontendURL = "https://final-front-jay.surge.sh/";


let articles = [{ id: 0, author: 'Mack', body: 'Post 1' },
    { id: 1, author: 'Jack', body: 'Post 2' },
    { id: 2, author: 'Zack', body: 'Post 3' }];


const hello = (req, res) => res.send({ hello: 'world' });



const getArticles = (req, res) => res.send(articles);

const getArticle = (req, res) => res.send(articles[req.params.id]);

const addArticle = (req, res) => {
    let post = req.body;
    let article = {id: articles.length, author: post.author, body: post.body}
    articles.push(article);
    res.send(articles);
}

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors(corsOptions));

app.use(session({
    secret: 'doNotGuessTheSecret',
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(user, done) {
    done(null, user);
});
passport.use(new GoogleStrategy({
            clientID: 'xxxxxxxx.apps.googleusercontent.com',
            clientSecret: 'xxxxxxxx',
            callbackURL: "/auth/google/callback"
        },
        function(accessToken, refreshToken, profile, done) {
            let user = {
                /*'email': profile.emails[0].value,
                'name' : profile.name.givenName + ' ' + profile.name.familyName,
                'id'   : profile.id,*/
                'token': accessToken
            };
            // You can perform any necessary actions with your user at this point,
            // e.g. internal verification against a users table,
            // creating new user entries, etc.

            return done(null, user);
            // User.findOrCreate(..., function(err, user) {
            //     if (err) { return done(err); }
            //     done(null, user);
            // });
        })
);
// Redirect the user to Google for authentication.  When complete,
// Google will redirect the user back to the application at
//     /auth/google/callback
app.get('/auth/google', passport.authenticate('google',{ scope: ['https://www.googleapis.com/auth/plus.login'] })); // could have a passport auth second arg {scope: 'email'}

// Google will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
app.get('/auth/google/callback',
    passport.authenticate('google', { successRedirect: frontendURL + 'main',
        failureRedirect: '/' }));
//express endpoints would normally start here



app.get('/', hello);
// upCloud.setup(app);
auth(app);
profile(app);
article(app);
following(app);


// Get the port from the environment, i.e., Heroku sets it
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
     const addr = server.address();
     console.log(`Server listening at http://${addr.address}:${addr.port}`)
});
