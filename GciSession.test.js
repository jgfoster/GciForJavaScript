/*
 *  GciSession.test.js
 */

const { GciSession } = require("./GciSession");
let session;
let nil, arrayClass, globals, objectClass, symbolDictionaryClass;

getLogin = () => {
    const fs = require('fs');
    fs.access('./GciLogin.js', fs.F_OK, (err) => {
    if (err) {
        fs.copyFile('./GciDefault.js', './GciLogin.js', (err) => {
        if (err) throw err;
        });
    }
    });
    return require("./GciLogin");
}
const login = getLogin();

test('bad user', () => {
    let error;
    try {
        session = new GciSession({...login, gs_user: 'no such user'});
    } catch (e) {
        error = e;
    }
    expect(session).toBe(undefined);
    expect(error.message).toBe('Login failed:  the userId/password combination is invalid or expired.');
})

test('login', () => {
    let error;
    try {
        session = new GciSession(login);
    } catch (e) {
        error = e;
    }
    expect(error).toBe(undefined);
    expect(session === undefined).toBe(false);
})

test('abort', () => {
    let error;
    try {
        session.abort();
    } catch (e) {
        error = e;
    }
    expect(error).toBe(undefined);
})

test('begin', () => {
    let error;
    try {
        session.begin();
    } catch (e) {
        error = e;
    }
    expect(error).toBe(undefined);
})

test('break (hard)', () => {
    let error;
    try {
        session.hardBreak();
    } catch (e) {
        error = e;
    }
    expect(error).toBe(undefined);
})

test('break (soft)', () => {
    let error;
    try {
        session.softBreak();
    } catch (e) {
        error = e;
    }
    expect(error).toBe(undefined);
})

test('commit', () => {
    let error;
    try {
        session.commit();
    } catch (e) {
        error = e;
    }
    expect(error).toBe(undefined);
})

test('isCallInProgress', () => {
    let error, flag;
    try {
        flag = session.isCallInProgress();
    } catch (e) {
        error = e;
    }
    expect(error).toBe(undefined);
    expect(flag).toBe(false);
})

test('trace', () => {
    let error, flag0, flag1, flag2, flag3;
    try {
        flag0 = session.trace(1);
        flag1 = session.trace(2);
        flag2 = session.trace(3);
        flag3 = session.trace(0);
    } catch (e) {
        error = e;
    }
    expect(error).toBe(undefined);
    expect(flag0).toBe(0);
    expect(flag1).toBe(1);
    expect(flag2).toBe(2);
    expect(flag3).toBe(3);
})

test('resolveSymbol', () => {
    let error, other;
    try {
        nil = session.resolveSymbol('nil');
        arrayClass = session.resolveSymbol('Array');
        globals = session.resolveSymbol('Globals');
        objectClass = session.resolveSymbol('Object');
        symbolDictionaryClass = session.resolveSymbol('SymbolDictionary');
        other = session.resolveSymbol('should not be found!');
    } catch (e) {
        error = e;
    }
    expect(nil).toBe(20);
    expect(arrayClass).toBe(66817);
    expect(objectClass).toBe(72193);
    expect(globals).toBe(207361);
    expect(other).toBe(undefined);
    expect(error.message).toBe('Symbol not found!');
})

test('resolveSymbolObj', () => {
    let error, oop;
    try {
        oop = session.execute('#Array');
        oop = session.resolveSymbolObj(oop);
    } catch (e) {
        error = e;
    }
    expect(error).toBe(undefined);
    expect(oop).toBe(66817);    // Array

})

test('fetchClass', () => {
    let error, oop;
    try {
        oop = session.fetchClass(globals);
    } catch (e) {
        error = e;
    }
    expect(error).toBe(undefined);
    expect(oop).toBe(symbolDictionaryClass);
})

test('fetchSize', () => {
    let error, sizeOfNil, sizeOfArrayClass, sizeOfGlobals;
    try {
        sizeOfNil = session.fetchSize(nil);
        sizeOfArrayClass = session.fetchSize(arrayClass);
        sizeOfGlobals = session.fetchSize(globals);
    } catch (e) {
        error = e;
    }
    expect(error).toBe(undefined);
    expect(sizeOfNil).toBe(0);
    expect(sizeOfArrayClass).toBe(19);
    expect(sizeOfGlobals > 1000).toBe(true);
})

test('fetchVaryingSize', () => {
    let error, sizeOfNil, sizeOfArrayClass, sizeOfGlobals;
    try {
        sizeOfArrayClass = session.fetchVaryingSize(arrayClass);
        sizeOfGlobals = session.fetchVaryingSize(globals);
    } catch (e) {
        error = e;
    }
    expect(error).toBe(undefined);
    expect(sizeOfArrayClass).toBe(0);
    expect(sizeOfGlobals > 1000).toBe(true);
})

test('isKindOf', () => {
    let error, flag1, flag2;
    try {
        flag1 = session.isKindOf(globals, symbolDictionaryClass);
        flag2 = session.isKindOf(nil, symbolDictionaryClass);
    } catch (e) {
        error = e;
    }
    expect(error).toBe(undefined);
    expect(flag1).toBe(true);
    expect(flag2).toBe(false);
})

test('execute', () => {
    let error, oop1, oop2;
    try {
        oop1 = session.execute('Array');
        oop2 = session.execute('2 + 3');
    } catch (e) {
        error = e;
    }
    expect(error).toBe(undefined);
    expect(oop1).toBe(arrayClass);
    expect(oop2).toBe(42);
})

test('executeFetchBytes', () => {
    let error, string;
    try {
        string = session.executeFetchBytes("'Hello World!'", 16);
    } catch (e) {
        error = e;
    }
    expect(error).toBe(undefined);
    expect(string).toBe('Hello World!');
})

test('perform', () => {
    let error, oop1, oop2;
    try {
        oop1 = session.perform(globals, 'yourself', []);
        oop2 = session.perform(18, '+', [26]);  // 2 + 3
    } catch (e) {
        error = e;
    }
    expect(error).toBe(undefined);
    expect(oop1).toBe(globals);
    expect(oop2).toBe(42);      // 5
})

test('performFetchBytes', () => {
    let error, string1, string2, string3;
    try {
        string1 = session.performFetchBytes(42, 'printString', [], 8);
        string2 = session.performFetchBytes(arrayClass, 'printString', [], 6);
        string3 = session.performFetchBytes(arrayClass, 'printString', [], 4);
    } catch (e) {
        error = e;
    }
    expect(string1).toBe('5');
    expect(string2).toBe('Array');
    expect(string3).toBe(undefined);
    expect(error.message).toBe('Actual size of 5 exceeded buffer size of 4');
})

test('logout', () => {
    let error;
    try {
        session.logout();
    } catch (e) {
        error = e;
    }
    expect(error).toBe(undefined);
})

test('logout', () => {
    let error;
    try {
        session.logout();
    } catch (e) {
        error = e;
    }
    expect(error.message).toBe('argument is not a valid GciSession pointer');
})

test('version', () => {
    const version = session.version();
    // expect(version).toBe('3.4.3 build gss64_3_4_x_branch-45183');
    expect(version).toBe('3.5.0 build 64bit-46205');
})

