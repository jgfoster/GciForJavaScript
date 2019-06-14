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

test('abort', () => {
    var error;
    try {
        session.abort();
    } catch (e) {
        error = e;
    }
    expect(error).toBe(undefined);
})

test('begin', () => {
    var error;
    try {
        session.begin();
    } catch (e) {
        error = e;
    }
    expect(error).toBe(undefined);
})

test('break (hard)', () => {
    var error;
    try {
        session.hardBreak();
    } catch (e) {
        error = e;
    }
    expect(error).toBe(undefined);
})

test('break (soft)', () => {
    var error;
    try {
        session.softBreak();
    } catch (e) {
        error = e;
    }
    expect(error).toBe(undefined);
})

test('commit', () => {
    var error;
    try {
        session.commit();
    } catch (e) {
        error = e;
    }
    expect(error).toBe(undefined);
})

test('isCallInProgress', () => {
    var error;
    var flag;
    try {
        flag = session.isCallInProgress();
    } catch (e) {
        error = e;
    }
    expect(error).toBe(undefined);
    expect(flag).toBe(false);
})

test('logout', () => {
    var error;
    try {
        session.logout();
    } catch (e) {
        error = e;
    }
    expect(error).toBe(undefined);
})

test('logout', () => {
    var error;
    try {
        session.logout();
    } catch (e) {
        error = e;
    }
    expect(error.message).toBe('argument is not a valid GciSession pointer');
})
