/*
 *  GciSession.js
 *
 *  GciSession provides a wrapper around GciLibrary
 */

const GciErrSType    = require('./GciErrSType');
const GciLibrary     = require("./GciLibrary");
const { GciTravBufType, GciClampedTravArgsSType } = require('./GciTravBufType');
const GciTsObjInfo   = require('./GciTsObjInfo');
require("./GciConstants");

class GciSession {
    constructor(login) {
        this.gci = GciLibrary(login.library);
        this.error = new GciErrSType();
        const stoneNRS = '!tcp@localhost#server!' + login.stone;
        const gemNRS = '!tcp@' + login.gem_host + '#netldi:' + login.netldi + '#task!gemnetobject';
        this.session = this.gci.GciTsLogin(
            stoneNRS,               // const char *StoneNameNrs
            login.host_user,        // const char *HostUserId
            login.host_password,    // const char *HostPassword
            false,                  // BoolType hostPwIsEncrypted
            gemNRS,                 // const char *GemServiceNrs
            login.gs_user,          // const char *gemstoneUsername
            login.gs_password,      // const char *gemstonePassword
            0,                      // unsigned int loginFlags (per GCI_LOGIN* in gci.ht)
            0,                      // int haltOnErrNum
            this.error.ref()        // GciErrSType *err
        );
        if (this.session === 0) {
            throw this.error;
        }
    }

    abort() {
        if (!this.gci.GciTsAbort(this.session, this.error.ref())) {
            throw this.error;
        }
    }

    begin() {
        if (!this.gci.GciTsBegin(this.session, this.error.ref())) {
            throw this.error;
        }
    }

    clearStack(gsProcessOop) {
        if (!this.gci.GciTsClearStack(this.session, gsProcessOop, this.error.ref())) {
            throw this.error;
        }
    }

    commit() {
        if (!this.gci.GciTsCommit(this.session, this.error.ref())) {
            throw this.error;
        }
    }

    compileMethod(source, aClass, category = OOP.nil, symbolList = OOP.nil, overrideSelector = OOP.nil, compileFlags = 0, environmentId = 0) {
        const sourceOop = this.newString(source);
        const oop = this.gci.GciTsCompileMethod(this.session, sourceOop, aClass, category, symbolList, overrideSelector, compileFlags, environmentId, this.error.ref());
        if (oop === OOP.ILLEGAL) {
            throw this.error;
        }
        return oop;
    }

    continueWith(gsProcessOop, replaceTopOfStack = OOP.ILLEGAL) {
        const oop = this.gci.GciTsContinueWith(this.session, gsProcessOop, replaceTopOfStack, null, 0, this.error.ref());
        if (oop === OOP.ILLEGAL) {
            throw this.error;
        }
        return oop;
    }

    doubleToOop(double) {
        const oop = this.gci.GciTsDoubleToOop(this.session, double, this.error.ref());
        if (oop === OOP.ILLEGAL) {
            throw this.error;
        }
        return oop;
    }

    execute(string) {
        const oop = this.gci.GciTsExecute_(this.session, string, string.length, OOP.String, 
            OOP.ILLEGAL, OOP.nil, 0, 0, this.error.ref());
        if (oop === OOP.ILLEGAL) {
            throw this.error;
        }
        return oop;
    }

    executeFetchBytes(string, expectedSize = 1024) {
        const buffer = Buffer.alloc(expectedSize);
        const actualSize = this.gci.GciTsExecuteFetchBytes(this.session, string, string.length, OOP.String, 
            OOP.ILLEGAL, OOP.nil, buffer, buffer.length, this.error.ref());
        if (actualSize === -1) {
            throw this.error;
        }
        return buffer.toString('utf8', 0, actualSize);
    }

    fetchBytes(oop, startIndex = 0, expectedSize = 1024) {
        const buffer = Buffer.alloc(expectedSize);
        const actualSize = this.gci.GciTsFetchBytes(this.session, oop, startIndex + 1, buffer, buffer.length, this.error.ref());
        if (actualSize === -1) {
            throw this.error;
        }
        return buffer.slice(0, actualSize);
    }

    fetchChars(oop, startIndex = 0, expectedSize = 1024) {
        const buffer = Buffer.alloc(expectedSize);
        const actualSize = this.gci.GciTsFetchChars(this.session, oop, startIndex + 1, buffer, buffer.length, this.error.ref());
        if (actualSize === -1) {
            throw this.error;
        }
        return buffer.toString('utf8', 0, actualSize);
    }

    fetchClass(oop) {
        const classOop = this.gci.GciTsFetchClass(this.session, oop, this.error.ref());
        if (classOop === OOP.ILLEGAL) {
            throw this.error;
        }
        return classOop;
    }

    fetchTraversal(oopArray) {
        const ctArgs = new GciClampedTravArgsSType();
        const travBuffer = new GciTravBufType();
        const oopBuffer = Buffer.alloc(oopArray.length * 8);
        for (let i = 0; i < oopArray.length; i++) {
            oopBuffer.writeIntLE(oopArray[i], i * 8, 6);
        }
        const result = this.gci.GciTsFetchTraversal(this.session, oopBuffer, oopArray.length, ctArgs.ref(), travBuffer.ref(), 0, this.error.ref());
        if (result === -1) {
            throw this.error;
        }
        const isDone = result === 1;
        return { isDone, travBuffer };
    }

    fetchObjInfo(objId) {
        const objInfo = new GciTsObjInfo;
        const result = this.gci.GciTsFetchObjInfo(this.session, objId, false, objInfo.ref(), null, 0, this.error.ref());
        if (result === -1) {
            throw this.error;
        }
        return objInfo;
    }

    fetchOops(theObject, startIndex = 0, numOops = 1) {
        const buffer = Buffer.alloc(numOops * 8);
        let actualSize = this.gci.GciTsFetchOops(this.session, theObject, startIndex + 1, buffer, numOops, this.error.ref());
        if (actualSize === -1) {
            throw this.error;
        }
        const array = new Array(actualSize);
        for (let i = 0; i < actualSize; i++) {
            array[i] = buffer.readIntLE(i * 8, 6);
        }
        return array;
    }

    fetchSize(oop) {
        const size = this.gci.GciTsFetchSize(this.session, oop, this.error.ref());
        if (size === -1) {
            throw this.error;
        }
        return size;
    }

    fetchSpecialClass(oop) {
        const result = this.gci.GciTsFetchSpecialClass(oop);
        if (result === OOP.ILLEGAL) {
            throw new Error('Not a special OOP');
        }
        return result;
    }

    fetchUnicode(oop) {
        let unicodeBuffer = Buffer.alloc(0);
        const sizeBuffer = Buffer.alloc(8);
        let actualSize = this.gci.GciTsFetchUnicode(this.session, oop, unicodeBuffer, unicodeBuffer.length, sizeBuffer, this.error.ref());
        if (actualSize === -1) {
            throw this.error;
        }
        const requiredSize = sizeBuffer.readIntLE(0, 6);
        unicodeBuffer = Buffer.alloc(requiredSize * 2);
        actualSize = this.gci.GciTsFetchUnicode(this.session, oop, unicodeBuffer, unicodeBuffer.length, sizeBuffer, this.error.ref());
        if (actualSize === -1) {
            throw this.error;
        }
        if (actualSize != requiredSize) { 
            throw new Error('Unicode conversion error');
        }
        return unicodeBuffer.toString('utf16le');
    }

    fetchUtf8(oop) {    // It seems that this doesn't work!
        let unicodeBuffer = Buffer.alloc(0);
        const sizeBuffer = Buffer.alloc(8);
        let actualSize = this.gci.GciTsFetchUtf8(this.session, oop, unicodeBuffer, unicodeBuffer.length, sizeBuffer, this.error.ref());
        if (actualSize === -1) {
            throw this.error;
        }
        const requiredSize = sizeBuffer.readIntLE(0, 6);
        unicodeBuffer = Buffer.alloc(requiredSize * 2);
        actualSize = this.gci.GciTsFetchUtf8(this.session, oop, unicodeBuffer, unicodeBuffer.length, sizeBuffer, this.error.ref());
        if (actualSize === -1) {
            throw this.error;
        }
        if (actualSize != requiredSize) { 
            throw new Error('Unicode conversion error');
        }
        return unicodeBuffer.toString('utf8');
    }

    fetchUtf8Bytes(oop, startIndex = 0, expectedSize = 1024) {
        const utf8Buffer = Buffer.alloc(expectedSize);
        const oopBuffer = Buffer.alloc(8);
        const actualSize = this.gci.GciTsFetchUtf8Bytes(this.session, oop, startIndex + 1, 
            utf8Buffer, utf8Buffer.length, oopBuffer, this.error.ref(), 0 /* GCI_UTF8_FetchNormal */);
        if (actualSize === -1) {
            throw this.error;
        }
        const newOop = oopBuffer.readIntLE(0, 6);
        this.releaseObjs([newOop]);
        return utf8Buffer.toString('utf8', 0, actualSize);
    }

    fetchVaryingSize(oop) {
        const size = this.gci.GciTsFetchVaryingSize(this.session, oop, this.error.ref());
        if (size === -1) {
            throw this.error;
        }
        return size;
    }

    getFreeOops(numOopsRequested) {
        const buffer = Buffer.alloc(numOopsRequested * 8);
        const count = this.gci.GciTsGetFreeOops(this.session, buffer, numOopsRequested, this.error.ref());
        if (count === -1) {
            throw this.error;
        }
        const array = Array(count);
        for (let i = 0; i < count; i++) {
            array[i] = buffer.readIntLE(i * 8, 6);
        }
        return array;
    }

    hardBreak() {
        if (!this.gci.GciTsBreak(this.session, true, this.error.ref())) {
            throw this.error;
        }
    }

    i64ToOop(int) {
        const result = this.gci.GciTsI64ToOop(this.session, int, this.error.ref());
        if (result === OOP.ILLEGAL) {
            throw this.error;
        }
        return result;
    }

    isCallInProgress() {
        const flag = this.gci.GciTsCallInProgress(this.session, this.error.ref());
        if (flag === -1) {
            throw this.error;
        }
        return flag === 1;
    }

    isKindOf(objectOop, classOop) {
        const flag = this.gci.GciTsIsKindOf(this.session, objectOop, classOop, this.error.ref());
        if (flag === -1) {
            throw this.error;
        }
        return flag === 1;
    }

    isKindOfClass(objectOop, classOop) {
        const flag = this.gci.GciTsIsKindOfClass(this.session, objectOop, classOop, this.error.ref());
        if (flag === -1) {
            throw this.error;
        }
        return flag === 1;
    }

    isSubclassOf(child, parent) {
        const flag = this.gci.GciTsIsSubclassOf(this.session, child, parent, this.error.ref());
        if (flag === -1) {
            throw this.error;
        }
        return flag === 1;
    }

    isSubclassOfClass(child, parent) {
        const flag = this.gci.GciTsIsSubclassOfClass(this.session, child, parent, this.error.ref());
        if (flag === -1) {
            throw this.error;
        }
        return flag === 1;
    }

    logout() {
        if (!this.gci.GciTsLogout(this.session, this.error.ref())) {
            throw this.error;
        }
        this.session = 0;
    }

    moreTraversal() {
        const travBuffer = new GciTravBufType();
        const result = this.gci.GciTsMoreTraversal(this.session, travBuffer.ref(), this.error.ref());
        if (result === -1) {
            throw this.error;
        }
        const isDone = result === 1;
        return { isDone, travBuffer };
    }

    newByteArray(bytes = '', size = bytes.length) {
        const result = this.gci.GciTsNewByteArray(this.session, bytes, size, this.error.ref());
        if (result === OOP.ILLEGAL) {
            throw this.error;
        }
        return result;
    }

    newObj(classOop) {
        const result = this.gci.GciTsNewObj(this.session, classOop, this.error.ref());
        if (result === OOP.ILLEGAL) {
            throw this.error;
        }
        return result;
    }

    newString(bytes = '', size = bytes.length) {
        const result = this.gci.GciTsNewString(this.session, bytes, size, this.error.ref());
        if (result === OOP.ILLEGAL) {
            throw this.error;
        }
        return result;
    }

    newSymbol(bytes) {
        const result = this.gci.GciTsNewSymbol(this.session, bytes, this.error.ref());
        if (result === OOP.ILLEGAL) {
            throw this.error;
        }
        return result;
    }

    newTraversalBuffer(size) {
        return new GciTravBufType(size);
    }

    newUnicodeString(string) {
        const buffer = Buffer.from(string, 'utf16le');
        const result = this.gci.GciTsNewUnicodeString_(this.session, buffer, string.length, this.error.ref());
        if (result === OOP.ILLEGAL) {
            throw this.error;
        }
        return result;
    }

    newUtf8String(bytes) {
        const result = this.gci.GciTsNewUtf8String_(this.session, bytes, bytes.length, this.error.ref());
        if (result === OOP.ILLEGAL) {
            throw this.error;
        }
        return result;
    }

    objExists(oop) {
        return this.gci.GciTsObjExists(this.session, oop);
    }

    oopIsSpecial(oop) {
        return this.gci.GciTsOopIsSpecial(oop);
    }

    oopToDouble(oop) {
        const buffer = Buffer.alloc(8);
        const flag = this.gci.GciTsOopToDouble(this.session, oop, buffer, this.error.ref());
        if (!flag) {
            throw this.error;
        }
        return buffer.readDoubleLE();
    }

    oopToI64(oop) {
        const buffer = Buffer.alloc(8);
        const flag = this.gci.GciTsOopToI64(this.session, oop, buffer, this.error.ref());
        if (!flag) {
            throw this.error;
        }
        const hi = buffer.readInt32LE(4), lo = buffer.readInt32LE(0);
        return hi * 0x100000000 + lo;
    }

    perform(receiver, selector, oopArray) {
        const args = Buffer.alloc(80);
        var i;
        for (i = 0; i < 10; i++) {
            args.writeIntLE(oopArray[i], i * 8, 6);
        }
        const oop = this.gci.GciTsPerform(this.session, receiver, OOP.ILLEGAL, selector, args, 
            oopArray.length, 0, 0, this.error.ref());
        if (oop === OOP.ILLEGAL) {
            throw this.error;
        }
        return oop;
    }

    performFetchBytes(receiver, selector = 'printString', oopArray = [], expectedSize = 1024) {
        const args = Buffer.alloc(80);
        var i;
        for (i = 0; i < 10; i++) {
            args.writeIntLE(oopArray[i], i * 8, 6);
        }
        const buffer = Buffer.alloc(expectedSize + 10);
        const actualSize = this.gci.GciTsPerformFetchBytes(this.session, receiver, selector, 
            args, oopArray.length, buffer, buffer.length, this.error.ref());
        if (actualSize === -1) {
            throw this.error;
        }
        if (actualSize > expectedSize) {
            throw new Error('Actual size of ' + actualSize.toString() + 
                ' exceeded buffer size of ' + expectedSize.toString());
        }
        return buffer.toString('utf8', 0, actualSize);
    }

    releaseAllObjs() {
        if (!this.gci.GciTsReleaseAllObjs(this.session, this.error.ref())) {
            throw this.error;
        }
    }

    releaseObjs(oopArray) {
        const buffer = Buffer.alloc(oopArray.length * 8);
        for (let i = 0; i < oopArray.length; i++) {
            buffer.writeIntLE(oopArray[i], i * 8, 6);
        }
        if (!this.gci.GciTsReleaseObjs(this.session, buffer, oopArray.length, this.error.ref())) {
            throw this.error;
        }
    }

    removeAllMethods(classOop) {
        if (!this.gci.GciTsClassRemoveAllMethods(this.session, classOop, this.error.ref())) {
            throw this.error;
        }
    }

    removeOopsFromNsc(theNsc, theOops) {
        const buffer = Buffer.alloc(theOops.length * 8);
        for (let i = 0; i < theOops.length; i++) {
            buffer.writeIntLE(theOops[i], i * 8, 6);
        }
        const result = this.gci.GciTsRemoveOopsFromNsc(this.session, theNsc, buffer, theOops.length, this.error.ref());
        if (result === -1) {
            throw this.error;
        }
        return result == 1;
   }

    resolveSymbol(string, symbolList = OOP.nil) {
        const oop = this.gci.GciTsResolveSymbol(this.session, string, symbolList, this.error.ref());
        if (oop === OOP.ILLEGAL) {
            throw new Error('Symbol not found!');
        }
        return oop;
    }

    resolveSymbolObj(stringOop, symbolList = OOP.nil) {
        const oop = this.gci.GciTsResolveSymbolObj(this.session, stringOop, symbolList, this.error.ref());
        if (oop === OOP.ILLEGAL) {
            throw new Error('Symbol not found!');
        }
        return oop;
    }

    saveObjs(oopArray) {
        const buffer = Buffer.alloc(oopArray.length * 8);
        for (let i = 0; i < oopArray.length; i++) {
            buffer.writeIntLE(oopArray[i], i * 8, 6);
        }
        if (!this.gci.GciTsSaveObjs(this.session, buffer, oopArray.length, this.error.ref())) {
            throw this.error;
        }
    }

    softBreak() {
        if (!this.gci.GciTsBreak(this.session, false, this.error.ref())) {
            throw this.error;
        }
    }

    storeBytes(bytes, oopObject, oopClass, startIndex = 0, numBytes = bytes.length) {
        let buffer;
        if (typeof bytes == 'Buffer') {
            buffer = bytes;
        } else {
            buffer = Buffer.from(bytes);
        }
        if (!this.gci.GciTsStoreBytes(this.session, oopObject, startIndex + 1, buffer, numBytes, oopClass, this.error.ref())) {
            throw this.error;
        }
    }

    storeTrav(
        travBuf,                    // GciTravBufType
        shouldReplace = false,      // use REPLACE semantics for varying instvars of Nsc's
        shouldCreate = false,       // If an object to be stored into does not exist, use GciCreate to create it
        doDeferredUpdates = false,  // execute GciProcessDeferredUpdates qfter processing the last object report
    ) {
        const flag = (shouldReplace ? 1 : 0) | (shouldCreate ? 2 : 0) | (doDeferredUpdates ? 8 : 0);
        if (!this.gci.GciTsStoreTrav(this.session, travBuf.ref(), flag, this.error.ref())) {
            throw this.error;
        }
    }
/*
EXTERN_GCI_DEC(int) GciTsStoreTravDoTravRefs(GciSession sess,
    const OopType *oopsNoLongerReplicated, int numNotReplicated,
    const OopType *oopsGcedOnClient, int numGced,
    GciStoreTravDoArgsSType *stdArgs, GciClampedTravArgsSType *ctArgs,
    GciErrSType *err);
*/

    storeTravDoTravRefs(
        oopsNoLongerReplicated = [],
        oopsGcedOnClient = [],
        stdArgs,
        ctArgs
    ) {

    }

    trace(level) {
        const flag = this.gci.GciTsGemTrace(this.session, level, this.error.ref());
        if (flag === -1) {
            throw this.error;
        }
        return flag;
    }

    version() {
        const maxStringLength = 200;
        const theStringBuffer = Buffer.alloc(maxStringLength);
        const result = this.gci.GciTsVersion(theStringBuffer, maxStringLength);
        var theString = theStringBuffer.toString('utf-8');
        const terminatingNullPos = theString.indexOf('\u0000');
        if (terminatingNullPos >= 0) {theString = theString.substr(0, terminatingNullPos);}
        if (result !== 3) {
            throw new Error('GciTsVersion() returned ' + result.toString());
        }
        return theString;
    }

}

module.exports = { GciSession };
