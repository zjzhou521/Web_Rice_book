/*
 * Test suite for articles
 */
require('es6-promise').polyfill();
require('isomorphic-fetch');

const url = path => `http://localhost:3000${path}`;
let cookie;

describe('Validate Article Functionality: ', () => {
    it('login user', (done) => {
        let loginUser = {username: 'jay', password: '123'};
        fetch(url('/login'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginUser)
        }).then(res => {
            cookie = res.headers.get("set-cookie");
            return res.json()
        }).then(res => {
            expect(res.username).toEqual('jay');
            expect(res.result).toEqual('success');
            done();
        });
    });

    let oldUserArticleCnt = -1;
    let newUserArticleCnt = -1;

    it('get user articles before posting', (done) => {
        fetch(url('/articles'), {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'cookie': cookie},
        }).then(res => {
            return res.json()
        }).then(res => {
            oldUserArticleCnt = res.articles.length;
            expect(res.articles.length > 0).toBe(true);
            done();
        });
    });

    it('post a new article & validate list increased by one & validate contents of the new article', (done) => {
        let newArticle = {text: 'my new article'};
        fetch(url('/article'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'cookie': cookie},
            body: JSON.stringify(newArticle)
        }).then(res => {
            return res.json()
        }).then(res => {
            newUserArticleCnt = res.articles.length;
            expect(newUserArticleCnt - oldUserArticleCnt == 1).toBe(true); // validate list increased by one
            expect(res.articles[newUserArticleCnt-1].text).toEqual(newArticle.text); // validate contents of the new article
            done();
        });
    });

    it('get a specific articles using article id', (done) => {
        fetch(url('/articles/0'), {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'cookie': cookie},
        }).then(res => {
            return res.json()
        }).then(res => {
            oldUserArticleCnt = res.articles.length;
            expect(res.articles.length == 1).toBe(true);
            expect(res.articles[0].pid == 0).toBe(true);
            done();
        });
    });
});
