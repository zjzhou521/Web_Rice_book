const mongoose = require('mongoose');
const articleSchema = require('./articleSchema');
const userProfileSchema = require("./userProfileSchema");
const uploadImage = require("./uploadCloudinary");
const cloudinary = require("cloudinary");
const connectionString = 'mongodb+srv://xxxxxxxxx';
const Article = mongoose.model('article', articleSchema);
const UserProfile = mongoose.model('userProfile', userProfileSchema);

function getArticles(req, res) {
    let articleId = req.params.id;
    let reqUsername = articleId;
    let username = req.username; // current logged username
    let allArticles = [];

    if (!articleId) { // get all articles feed by current user
        (async () => {
            // first, get current logged user's written articles
            const connector = mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });
            await Article.find({author: username}).exec(async function (err,items) {
                items.forEach(function(article) {
                    allArticles.push(article);
                })
                if (allArticles) { // second, find user's following list, then get following users' written articles
                    UserProfile.find({username: username}).exec(async function (err,items) {
                        let curUserFollowingList = items[0].followingList;
                        if (curUserFollowingList.length == 0) {
                            res.send({articles: allArticles});
                            return;
                        } else {
                            // only need to efficiently query once in mongoDB
                            Article.find().exec(async function (err,items) {
                                items.forEach(function (article) {
                                    for (let i = 0; i < curUserFollowingList.length; i++) {
                                        if (article.author == curUserFollowingList[i]) {
                                            allArticles.push(article);
                                            break;
                                        }
                                    }
                                })
                                res.send({articles: allArticles});
                            });
                        }
                    })
                }
            });
        })();
    } else { // get a specific article by id / username
        (async () => {
            const connector = mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });
            await Article.find({pid: articleId}).exec(async function (err,items) {
                if (!items) { // try username
                    await Article.find({author: reqUsername}).exec(async function (err,items) {
                        if (!items) {
                            res.send({result: "article id/username not found! "});
                        } else {
                            items.forEach(function(article) {
                                allArticles.push(article);
                            })
                            res.send({articles: allArticles});
                        }
                    });
                } else {
                    items.forEach(function(article) {
                        allArticles.push(article);
                    })
                    res.send({articles: allArticles});
                }
            });
        })();
    }
}

function putArticles(req, res) {
    let username = req.username; // currently logged username
    let articleId = req.params.id;
    let text = req.body.text;
    let commentId = req.body.commentId;
    let updateArticles = [];

    if (commentId == "") { // update article's text
        const filter = {pid: articleId, author: username}; // check if forbidden
        const update = {text: text};
        (async () => {
            const connector = mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });
            await Article.findOneAndUpdate(filter, update).exec(function (err,item) {
                if (!item) {
                    res.send({result: "Forbidden! "});
                } else {
                    Article.find(filter).exec(function (err,item) {
                        updateArticles.push(item);
                        res.send({articles: updateArticles});
                    })
                }
            })
        })();
    } else { // update comment's text
        if (commentId != -1) { // update this comment
            let curComments = [];
            (async () => {
                const connector = mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });
                // first, add comment
                await Article.find({pid: articleId}).exec(async function (err,items) {
                    if (items.length == 0) {
                        res.send({result: "Article not found! "});
                    } else {
                        for (let i = 0; i < items[0].comments.length; i++) {
                            curComments.push(items[0].comments[i]);
                        }
                        if (commentId >= curComments.length) {
                            res.send({result: "Comment not found! "});
                        } else if ( curComments[commentId].commentAuthor != username) {
                            res.send({result: "Forbidden! "});
                        } else {
                            curComments[commentId].commentText = text;
                            // curComments[commentId].commentDate = Date.now();
                            // second, update article
                            await (connector.then(async ()=> {
                                Article.findOneAndUpdate({pid: articleId}, {comments: curComments}).exec(function (err,item) {
                                    if (item) {
                                        // third, get new article
                                        Article.find({pid: articleId}).exec(function (err,items) {
                                            updateArticles.push(items[0]);
                                            res.send({articles: updateArticles});
                                        })
                                    } else {
                                        res.send({result: "Article not found! "});
                                    }
                                })
                            }))
                        }
                    }
                });
            })();
        } else { // add a new comment
            let curComments = [];
            (async () => {
                const connector = mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });
                // first, add comment
                await Article.find({pid: articleId}).exec(async function (err,items) {
                    if (items.length == 0) {
                        res.send({result: "Article not found! "});
                    } else {
                        for (let i = 0; i < items[0].comments.length; i++) {
                            curComments.push(items[0].comments[i]);
                        }
                        curComments.push({commentAuthor: username, commentText: text, commentDate: Date.now()});
                        // second, update article
                        await (connector.then(async ()=> {
                            Article.findOneAndUpdate({pid: articleId}, {comments: curComments}).exec(function (err,item) {
                                if (item) {
                                    // third, get new article
                                    Article.find({pid: articleId}).exec(function (err,items) {
                                        updateArticles.push(items[0]);
                                        res.send({articles: updateArticles});
                                    })
                                } else {
                                    res.send({result: "Article not found! "});
                                }
                            })
                        }))
                    }
                });
            })();
        }
    }
}

function uploadArticleImg(req, res) {
    let username = req.username; // current logged username
    const image = cloudinary.image(req.fileid, {
        format: "png", width: 100, height: 100, crop: "fill"
    });
    let newImageUrl = req.fileurl;
    res.send({imageUrl: newImageUrl});
}

function postArticle(req, res) { // only accept new articles with text only, no pictures.
    let username = req.username; // currently logged username
    let newArticleAuthor = username;
    let newArticleText = req.body.text;
    let newArticleImageUrl = req.body.imageUrl;
    if (newArticleImageUrl == null || newArticleImageUrl == "") {
        newArticleImageUrl = "";
    }
    let newArticleDate = Date.now();
    let newArticleComments = [];
    let allArticles = [];
    (async () => {
        const connector = mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });
        // first, get total post id
        await Article.find().exec(async function (err,items) {
            let newArticleId = items.length;
            // second, add post
            async function addArticle(newArticleId, newArticleAuthor, newArticleText, newArticleDate, newArticleComments) {
                return new Article({
                    pid: newArticleId,
                    author: newArticleAuthor,
                    text: newArticleText,
                    imgUrl: newArticleImageUrl,
                    date: newArticleDate,
                    comments: newArticleComments,
                    createdTime: Date.now(),
                }).save()
            }
            await (connector.then(async ()=> {
                await addArticle(newArticleId, newArticleAuthor, newArticleText, newArticleDate, newArticleComments);
                // third, get new post list for this user
                Article.find({author: username}).exec(function (err,items) {
                    items.forEach(function(article) {
                        allArticles.push(article);
                    })
                    res.send({articles: allArticles});
                })
            }))
        });
    })();
}



module.exports = (app) => {
    app.get('/articles/:id?', getArticles);
    app.put('/articles/:id', putArticles);
    app.post('/article', postArticle);
    app.put('/articleimage', uploadImage.uploadImage('avatar'), uploadArticleImg);
}

