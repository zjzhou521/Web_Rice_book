/*
 * Test suite for articles
 */
require('es6-promise').polyfill();
require('isomorphic-fetch');

const url = path => `http://localhost:3000${path}`;
let cookie;

describe('Validate Auth Functionality: ', () => {

    it('register new user', (done) => {
        let regUser = {
            username: "jay",
            password: "123",
            email: "12@2.com",
            dob: "19990101",
            zipcode: "12234"
        };
        fetch(url('/register'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(regUser)
        }).then(res => res.json()).then(res => {
            expect(res.username).toEqual('jay');
            expect(res.result == 'success' || res.result == 'Registration failed! (username conflict) ').toBe(true);
            done();
        });
    });

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

    it('logout user', (done) => {
        fetch(url('/logout'), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'cookie': cookie},
        }).then(res => {
            expect(res.statusText).toEqual('OK');
            done();
        });
    });
});
