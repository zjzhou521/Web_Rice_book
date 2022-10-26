/*
 * Test suite for articles
 */
require('es6-promise').polyfill();
require('isomorphic-fetch');

const url = path => `http://localhost:3000${path}`;
let cookie;

describe('Validate Profile Functionality: ', () => {
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

    it('put user\s new headline', (done) => {
        let newHeadline = {headline: 'new headline'};
        fetch(url('/headline'), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'cookie': cookie},
            body: JSON.stringify(newHeadline)
        }).then(res => {
            return res.json()
        }).then(res => {
            expect(res.username).toEqual('jay');
            expect(res.headline).toEqual(newHeadline.headline);
            done();
        });
    });

    it('get user\'s new headline', (done) => {
        fetch(url('/headline'), {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'cookie': cookie},
        }).then(res => {
            return res.json()
        }).then(res => {
            expect(res.headline).toEqual('new headline');
            done();
        });
    });

});
