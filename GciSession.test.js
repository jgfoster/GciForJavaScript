/*
 *  GciSession.test.js
 */

const { GciSession } = require("./GciSession");
var session;

test('bad user', () => {
    var error;
    try {
        session = new GciSession('no such user');
    } catch (e) {
        error = e;
    }
    expect(session).toBe(undefined);
    expect(error.message).toBe('Login failed:  the userId/password combination is invalid or expired.');
})

test('login', () => {
    var error;
    try {
        session = new GciSession();
    } catch (e) {
        error = e;
    }
    expect(error).toBe(undefined);
    expect(session === undefined).toBe(false);
})
