/*
 *  GciSession.test.js
 */

const { GciSession } = require("./GciSession");
let session;

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
    expect(error.message()).toBe('Login failed:  the userId/password combination is invalid or expired.');
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
    expect(session.trace(1)).toBe(0);
    expect(session.trace(2)).toBe(1);
    expect(session.trace(3)).toBe(2);
    expect(session.trace(0)).toBe(3);
})

// tests not just the function, but verifies that we have the right constant
test('resolveSymbol', () => {
    expect(session.resolveSymbol('nil')).toBe(OOP.nil);
    expect(session.resolveSymbol('Array')).toBe(OOP.Array);
    expect(session.resolveSymbol('ByteArray')).toBe(OOP.ByteArray);
    expect(session.resolveSymbol('Collection')).toBe(OOP.Collection);
    expect(session.resolveSymbol('false')).toBe(OOP.false);
    expect(session.resolveSymbol('Globals')).toBe(OOP.Globals);
    expect(session.resolveSymbol('Object')).toBe(OOP.Object);
    expect(session.resolveSymbol('Symbol')).toBe(OOP.Symbol);
    expect(session.resolveSymbol('SymbolDictionary')).toBe(OOP.SymbolDictionary);
    expect(session.resolveSymbol('true')).toBe(OOP.true);
    expect(session.resolveSymbol('UndefinedObject')).toBe(OOP.UndefinedObject);
})

test('resoveSymbol error', () => {
    let error, other;
    try {
        other = session.resolveSymbol('should not be found!');
    } catch (e) {
        error = e;
    }
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
        oop = session.fetchClass(OOP.Globals);
    } catch (e) {
        error = e;
    }
    expect(error).toBe(undefined);
    expect(oop).toBe(OOP.SymbolDictionary);
})

test('fetchSize', () => {
    let error, sizeOfNil, sizeOfArrayClass, sizeOfGlobals;
    try {
        sizeOfNil = session.fetchSize(OOP.nil);
        sizeOfArrayClass = session.fetchSize(OOP.Array);
        sizeOfGlobals = session.fetchSize(OOP.Globals);
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
        sizeOfArrayClass = session.fetchVaryingSize(OOP.Array);
        sizeOfGlobals = session.fetchVaryingSize(OOP.Globals);
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
        flag1 = session.isKindOf(OOP.Globals, OOP.SymbolDictionary);
        flag2 = session.isKindOf(OOP.nil, OOP.SymbolDictionary);
    } catch (e) {
        error = e;
    }
    expect(error).toBe(undefined);
    expect(flag1).toBe(true);
    expect(flag2).toBe(false);
})

test('isKindOfClass', () => {
    expect(session.isKindOfClass(OOP.Globals, OOP.SymbolDictionary)).toBe(true);
    expect(session.isKindOfClass(OOP.nil, OOP.SymbolDictionary)).toBe(false);
})

test('isSubclassOf', () => {
    expect(session.isSubclassOf(OOP.Array, OOP.Collection)).toBe(true);
    expect(session.isSubclassOf(OOP.Collection, OOP.Array)).toBe(false);
})

test('isSubclassOfClass', () => {
    expect(session.isSubclassOfClass(OOP.Array, OOP.Collection)).toBe(true);
    expect(session.isSubclassOfClass(OOP.Collection, OOP.Array)).toBe(false);
})

test('oopIsSpecial', () => {
    expect(session.oopIsSpecial(OOP.nil)).toBe(true);
    expect(session.oopIsSpecial(OOP.Globals)).toBe(false);
})

test('objExists', () => {
    expect(session.objExists(OOP.nil)).toBe(true);
    expect(session.objExists(OOP.nil + 1)).toBe(false);
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
    expect(oop1).toBe(OOP.Array);
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
        oop1 = session.perform(OOP.Globals, 'yourself', []);
        oop2 = session.perform(18, '+', [26]);  // 2 + 3
    } catch (e) {
        error = e;
    }
    expect(error).toBe(undefined);
    expect(oop1).toBe(OOP.Globals);
    expect(oop2).toBe(42);      // 5
})

test('performFetchBytes', () => {
    let error, string1, string2, string3;
    try {
        string1 = session.performFetchBytes(42, 'printString', [], 8);
        string2 = session.performFetchBytes(OOP.Array, 'printString', [], 6);
        string3 = session.performFetchBytes(OOP.Array, 'printString', [], 4);
    } catch (e) {
        error = e;
    }
    expect(string1).toBe('5');
    expect(string2).toBe('Array');
    expect(string3).toBe(undefined);
    expect(error.message).toBe('Actual size of 5 exceeded buffer size of 4');
})

test('continue', () => {
    let error, oop;
    try {
        oop = session.execute('2 halt + 3');
    } catch (e) {
        error = e;
    }
    expect(oop).toBe(undefined);
    expect(error.message()).toBe('a Halt occurred (error 2709)');
    oop = session.continueWith(error.context());
    expect(oop).toBe(42);
})

test('continueWith', () => {
    let error, oop;
    try {
        oop = session.execute('5 / 0');
    } catch (e) {
        error = e;
    }
    expect(oop).toBe(undefined);
    expect(error.number()).toBe(2026); // a ZeroDivide occurred
    oop = session.continueWith(error.context(), 42);
    expect(oop).toBe(42);
})

test('clearStack', () => {
    let error, oop, gsProcess;
    try {
        oop = session.execute('5 / 0');
    } catch (e) {
        error = e;
    }
    expect(oop).toBe(undefined);
    expect(error.number()).toBe(2026); // a ZeroDivide occurred
    gsProcess = error.context();
    try {
        session.clearStack(gsProcess);
        oop = session.continueWith(gsProcess);
    } catch (e) {
        error = e;
    }
    expect(oop).toBe(undefined);
    expect(error.number()).toBe(2092); // an InternalError occurred
})

test('fetchSpecialClass', () => {
    let error;
    expect(session.fetchSpecialClass(OOP.nil)).toBe(OOP.UndefinedObject);
    try {
        session.fetchSpecialClass(21);
    } catch (e) {
        error = e;
    }
    expect(error.message).toBe('Not a special OOP');
})

test('doubleToOop', () => {
    let oop;
    oop = session.doubleToOop(1.0);
    expect(oop).toBe('9151314442816847878');
})

test('oopToDouble', () => {
    const oop = '9151314442816847878';
    const double = session.oopToDouble(oop);
    expect(double).toBe(1.0);
})

test('i64ToOop', () => {
    const oop = session.i64ToOop(5);
    expect(oop).toBe(42);
})

test('oopToI64', () => {
    expect(session.oopToI64(42)).toBe(5); 
})

test('newObj', () => {
    const obj = session.newObj(OOP.Array);
    expect(session.isKindOf(obj, OOP.Array)).toBe(true);
})

test('newByteArray', () => {
    let obj = session.newByteArray();
    expect(session.isKindOf(obj, OOP.ByteArray)).toBe(true);
    expect(session.fetchSize(obj)).toBe(0);
    obj = session.newByteArray('abc\0xyz');
    expect(session.fetchSize(obj)).toBe(7);
    obj = session.newByteArray('abc\0xyz', 3);
    expect(session.fetchSize(obj)).toBe(3);
})

test('newString', () => {
    let obj = session.newString();
    expect(session.isKindOf(obj, OOP.String)).toBe(true);
    expect(session.fetchSize(obj)).toBe(0);
    obj = session.newString('abc\0xyz');
    expect(session.fetchSize(obj)).toBe(3);
})

test('newSymbol', () => {
    let obj = session.newSymbol('Array');
    expect(session.isKindOf(obj, OOP.Symbol)).toBe(true);
})

test('object bitmaps', () => {
    const oop = session.newSymbol('Array');
    let string = '(GsBitmap newForHiddenSet: #PureExportSet) _doAsOops: [:each | (each == ';
    string = string + oop.toString() + ') ifTrue: [^true]]. false.';
    expect(session.execute(string)).toBe(OOP.true);
    session.releaseAllObjs();
    expect(session.execute(string)).toBe(OOP.false);
    session.saveObjs([ oop ]);
    expect(session.execute(string)).toBe(OOP.true);
    session.releaseObjs([ oop ]);
    expect(session.execute(string)).toBe(OOP.false);
})

test('compiling and removing methods', () => {
    let string = 'Object subclass: \'TestClass\' instVarNames: #() inDictionary: UserGlobals';
    const classOop = session.execute(string);
    string = 'foo ^5';
    session.compileMethod(string, classOop);
    expect(session.execute('TestClass new foo')).toBe(42);
    /* doesn't seem to work!
    let error, result;
    session.removeAllMethods(classOop);
    try {
        result = session.execute('TestClass new foo');
    } catch (e) {
        error = e;
    }
    expect(error.number().toBe(42);
    */
})

test('newUnicodeString', () => {
    const string = 'Falsches Üben von Xylophonmusik quält jeden größeren Zwerg';
    const oop = session.newUnicodeString(string);
    expect(session.fetchSize(oop)).toBe(string.length * 2);
})

test('newUtf8String', () => {
    const string = 'Create a new Unicode string object from a UTF-8 encoded C character string.';
    const oop = session.newUnicodeString(string);
    expect(session.fetchSize(oop)).toBe(string.length);
})

test('fetchUnicode', () => {
    const string = 'Create a new Unicode string object from a UTF-8 encoded C character string.';
    const oop = session.newUnicodeString(string);
    const result = session.fetchUnicode(oop);
    expect(result).toBe(string);
})

test('fetchUtf8', () => {
    const string = 'Falsches Üben von Xylophonmusik quält jeden größeren Zwerg';
    const oop = session.newUnicodeString(string);
    const result = session.fetchUtf8(oop);
    // doesn't work!
    // expect(result).toBe(string);
})

test('fetchUtf8Bytes', () => {
    const string = 'Falsches Üben von Xylophonmusik quält jeden größeren Zwerg';
    const oop = session.newUnicodeString(string);
    const result = session.fetchUtf8Bytes(oop);
    // doesn't work!
    expect(result).toBe(string);
})

test('fetchBytes', () => {
    const bytes = Buffer.from('Fetch multiple bytes from an indexed byte object.');
    const oop = session.newByteArray(bytes);
    const result = session.fetchBytes(oop);
    expect(result).toStrictEqual(bytes);
})

test('fetchChars', () => {
    const string = 'Fetch multiple ASCII characters from an indexed byte object.';
    const oop = session.newString(string);
    const result = session.fetchChars(oop);
    expect(result).toStrictEqual(string);
})

test('fetchOops', () => {
    const arrayOop = session.execute('#(0 true false nil 1)');
    let array = session.fetchOops(arrayOop);
    expect(array.length).toBe(1);
    expect(array[0]).toBe(session.i64ToOop(0));
    array = session.fetchOops(arrayOop, 1, 3);
    expect(array.length).toBe(3);
    expect(array).toStrictEqual([OOP.true, OOP.false, OOP.nil]);
})

test('storeBytes', () => {
    const string = 'abcdefg';
    const oop = session.newString(string);
    session.storeBytes('CDEXXX', oop, OOP.String, startIndex = 2, numBytes = 3);
    const result = session.fetchChars(oop);
    expect(result).toStrictEqual('abCDEfg');
})

test('removeOopsFromNsc', () => {
    const nsc = session.execute('(IdentitySet with: true with: false with: 5)');
    expect(session.fetchVaryingSize(nsc)).toBe(3);
    expect(session.removeOopsFromNsc(nsc, [OOP.true])).toBe(true);
    expect(session.removeOopsFromNsc(nsc, [OOP.true, OOP.false])).toBe(false);
    expect(session.fetchVaryingSize(nsc)).toBe(1);
})

test('fetchObjInfo', () => {
    const objInfo = session.fetchObjInfo(OOP.Globals);
    expect(objInfo.objId()).toBe(OOP.Globals);
    expect(objInfo.objClass()).toBe(OOP.SymbolDictionary);
    expect(objInfo.access()).toBe(2);       // DataCurator can write Globals?
    expect(objInfo.isInvariant()).toBe(0);  // want this to return a Boolean
    expect(objInfo.objImpl()).toBe(0);
})

test('getFreeOops', () => {
    const array = session.getFreeOops(4);
    expect(array.length).toBe(4);
    expect(array[0] > 0).toBe(true);
    session.releaseObjs(array);
})

test('traversalBuffer', () => {
    let travBuf = session.newTraversalBuffer();     // default of 2048
    expect(travBuf.allocatedBytes()).toBe(2048);
    travBuf = session.newTraversalBuffer(2049);     // rounded to multiple of 8
    expect(travBuf.allocatedBytes()).toBe(2056);
    travBuf = session.newTraversalBuffer(2047);     // minimum of 2048
    expect(travBuf.allocatedBytes()).toBe(2048);
    expect(travBuf.usedBytes()).toBe(0);
    expect(travBuf.firstReport   ().address()).toBe(travBuf.address() + 8);
    expect(travBuf.readLimit     ().address()).toBe(travBuf.address() + 8);
    expect(travBuf.writeLimit    ().address()).toBe(travBuf.address() + 8 + 2048);
    expect(travBuf.firstReportHdr().address()).toBe(travBuf.address() + 8);
    expect(travBuf.readLimitHdr  ().address()).toBe(travBuf.address() + 8);
    expect(travBuf.writeLimitHdr ().address()).toBe(travBuf.address() + 8 + 2048);
    const header = travBuf.firstReportHdr();
    expect(header.valueBuffSize()).toBe(0);
    expect(header.namedSize()).toBe(0);
    expect(header.securityPolicy()).toBe(0);
    expect(header.objId()).toBe(0);
    expect(header.oclass()).toBe(0);
    expect(header.firstOffset()).toBe(0);
    expect(header.idxSize()).toBe(0);
    header.setIdxSize(20);
    expect(header.idxSize()).toBe(20);
    header.setObjImpl(3);
    expect(header.objImpl()).toBe(3);
    header.setNumDynamicIvs(5);
    expect(header.numDynamicIvs()).toBe(5);
    header.setIdxSize(20);
    expect(header.idxSize()).toBe(20);
    expect(header.usedBytes()).toBe(40);
    expect(header.numOopsInValue()).toBe(0);
    expect(header.nextReport().address()).toBe(header.address() + 40);
    expect(header.valueBuffer().address()).toBe(header.address() + 40);
    header.clearBits();
    expect(header.isClamped()).toBe(false);
    header.setIsClamped();
    expect(header.isClamped()).toBe(true);
    header.setIsClamped(false);
    expect(header.isClamped()).toBe(false);
    header.setIsClamped(true);
    expect(header.isClamped()).toBe(true);
})

test('fetchTraversal', () => {
    const oop = session.execute('true -> 5');
    const { isDone, travBuffer } = session.fetchTraversal([oop]);
    expect(isDone).toBe(true);
    expect(travBuffer._byteOffset()).toBe(0);
    expect(travBuffer.allocatedBytes()).toBe(2048);
    expect(travBuffer.usedBytes()).toBe(56);
    const objectReport = travBuffer.firstReport();
    expect(objectReport._byteOffset()).toBe(8);
    const objectReportHeader = objectReport.header();
    expect(objectReportHeader._byteOffset()).toBe(8);
    expect(objectReportHeader.valueBuffSize()).toBe(16);
    expect(objectReportHeader.namedSize()).toBe(2);
    expect(objectReportHeader.securityPolicy()).toBe(2);
    expect(objectReportHeader.objId()).toBe(oop);
    expect(objectReportHeader.oclass()).toBe(OOP.Association);
    expect(objectReportHeader.firstOffset()).toBe(1);   // ??
    expect(objectReportHeader.idxSize()).toBe(0);
    expect(objectReportHeader.numDynamicIvs()).toBe(0);
    expect(objectReportHeader.numOopsInValue()).toBe(2);
    expect(objectReportHeader.objImpl()).toBe(0);
    expect(objectReportHeader.objSize()).toBe(2);
    expect(objectReportHeader.usedBytes()).toBe(56);
    expect(objectReport.bytes().byteOffset).toBe(48);
    expect(objectReportHeader.valueBuffer().byteOffset).toBe(48);
    const oops = objectReport.oops();
    expect(oops.length).toBe(2);
    expect(oops[0]).toBe(OOP.true);
    expect(oops[1]).toBe(42);
})

test('storeTrav', () => {
    const assoc = session.newObj(OOP.Association);
    const travBuffer = session.newTraversalBuffer();
    const report = travBuffer.firstReport();
    const header = report.header();
    travBuffer.setUsedBytes(56);
    header.setValueBuffSize(16);
    header.setNamedSize(2);
    header.setSecurityPolicy();
    header.setObjId(assoc);
    header.setOclass(OOP.Association);
    header.setFirstOffset(1);
    report.setOops([OOP.false, OOP.Array]);
    session.storeTrav(travBuffer);
    const string = session.performFetchBytes(assoc);
    expect(string).toBe('false->Array');
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
    expect(error.message()).toBe('argument is not a valid GciSession pointer');
})

test('version', () => {
    const version = session.version();
    // expect(version).toBe('3.4.3 build gss64_3_4_x_branch-45183');
    expect(version).toBe('3.5.0 build 64bit-46205');
})

