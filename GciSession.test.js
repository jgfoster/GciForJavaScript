/*
 *  GciSession.test.js
 */

const { GciSession } = require("./GciSession");
var session;
var nil, arrayClass, globals, objectClass, symbolDictionaryClass;

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
    var error, flag;
    try {
        flag = session.isCallInProgress();
    } catch (e) {
        error = e;
    }
    expect(error).toBe(undefined);
    expect(flag).toBe(false);
})

test('trace', () => {
    var error, flag0, flag1, flag2, flag3;
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
    var error, other;
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

test('fetchClass', () => {
    var error, oop;
    try {
        oop = session.fetchClass(globals);
    } catch (e) {
        error = e;
    }
    expect(error).toBe(undefined);
    expect(oop).toBe(symbolDictionaryClass);
})

test('fetchSize', () => {
    var error, sizeOfNil, sizeOfArrayClass, sizeOfGlobals;
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
    var error, sizeOfNil, sizeOfArrayClass, sizeOfGlobals;
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
    var error, flag1, flag2;
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
    var error, oop1, oop2;
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
    var error, string;
    try {
        string = session.executeFetchBytes("'Hello World!'", 16);
    } catch (e) {
        error = e;
    }
    expect(error).toBe(undefined);
    expect(string).toBe('Hello World!');
})

test('perform', () => {
    var error, oop1, oop2;
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
    var error, string1, string2, string3;
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
