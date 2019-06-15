/*
 *  GciSession.js
 *
 *  GciSession provides a wrapper around GciLibrary
 */

const { GciLibrary, GciErrSType, OOP_ILLEGAL, OOP_NIL, OOP_CLASS_STRING } = require("./GciLibrary");

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
            throw new Error(this.error.message());
        }
    }

    abort() {
        if (!this.gci.GciTsAbort(this.session, this.error.ref())) {
            throw new Error(this.error.message());
        }
    }

    begin() {
        if (!this.gci.GciTsBegin(this.session, this.error.ref())) {
            throw new Error(this.error.message());
        }
    }

    commit() {
        if (!this.gci.GciTsCommit(this.session, this.error.ref())) {
            throw new Error(this.error.message());
        }
    }

    execute(string) {
        const oop = this.gci.GciTsExecute_(this.session, string, string.length, OOP_CLASS_STRING, 
            OOP_ILLEGAL, OOP_NIL, 0, 0, this.error.ref());
        if (oop === OOP_ILLEGAL) {
            throw new Error(this.error.message());
        }
        return oop;
    }

    executeFetchBytes(string, expectedSize) {
        const buffer = Buffer.alloc(expectedSize);
        const actualSize = this.gci.GciTsExecuteFetchBytes(this.session, string, string.length, OOP_CLASS_STRING, 
            OOP_ILLEGAL, OOP_NIL, buffer, buffer.length, this.error.ref());
        if (actualSize === -1) {
            throw new Error(this.error.message());
        }
        return buffer.toString('utf8', 0, actualSize);
    }

    fetchClass(oop) {
        const classOop = this.gci.GciTsFetchClass(this.session, oop, this.error.ref());
        if (classOop === OOP_ILLEGAL) {
            throw new Error(this.error.message());
        }
        return classOop;
    }

    fetchSize(oop) {
        const size = this.gci.GciTsFetchSize(this.session, oop, this.error.ref());
        if (size === -1) {
            throw new Error(this.error.message());
        }
        return size;
    }

    fetchVaryingSize(oop) {
        const size = this.gci.GciTsFetchVaryingSize(this.session, oop, this.error.ref());
        if (size === -1) {
            throw new Error(this.error.message());
        }
        return size;
    }

    hardBreak() {
        if (!this.gci.GciTsBreak(this.session, true, this.error.ref())) {
            throw new Error(this.error.message());
        }
    }

    isCallInProgress() {
        const flag = this.gci.GciTsCallInProgress(this.session, this.error.ref());
        if (flag === -1) {
            throw new Error(this.error.message());
        }
        return flag === 1;
    }

    isKindOf(objectOop, classOop) {
        const flag = this.gci.GciTsIsKindOf(this.session, objectOop, classOop, this.error.ref());
        if (flag === -1) {
            throw new Error(this.error.message());
        }
        return flag === 1;
    }

    logout() {
        if (!this.gci.GciTsLogout(this.session, this.error.ref())) {
            throw new Error(this.error.message());
        }
        this.session = 0;
    }

    perform(receiver, selector, oopArray) {
        const args = Buffer.alloc(80);
        var i;
        for (i = 0; i < 10; i++) {
            args.writeIntLE(oopArray[i], i * 8, 6);
        }
        const oop = this.gci.GciTsPerform(this.session, receiver, OOP_ILLEGAL, selector, args, 
            oopArray.length, 0, 0, this.error.ref());
        if (oop === OOP_ILLEGAL) {
            throw new Error(this.error.message());
        }
        return oop;
    }

    performFetchBytes(receiver, selector, oopArray, expectedSize) {
        const args = Buffer.alloc(80);
        var i;
        for (i = 0; i < 10; i++) {
            args.writeIntLE(oopArray[i], i * 8, 6);
        }
        const buffer = Buffer.alloc(expectedSize + 10);
        const actualSize = this.gci.GciTsPerformFetchBytes(this.session, receiver, selector, 
            args, oopArray.length, buffer, buffer.length, this.error.ref());
        if (actualSize === -1) {
            throw new Error(this.error.message());
        }
        if (actualSize > expectedSize) {
            throw new Error('Actual size of ' + actualSize.toString() + 
                ' exceeded buffer size of ' + expectedSize.toString());
        }
        return buffer.toString('utf8', 0, actualSize);
    }

    resolveSymbol(string, symbolList = OOP_NIL) {
        const oop = this.gci.GciTsResolveSymbol(this.session, string, symbolList, this.error.ref());
        if (oop === OOP_ILLEGAL) {
            throw new Error('Symbol not found!');
        }
        return oop;
    }

    softBreak() {
        if (!this.gci.GciTsBreak(this.session, false, this.error.ref())) {
            throw new Error(this.error.message());
        }
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

    trace(level) {
        const flag = this.gci.GciTsGemTrace(this.session, level, this.error.ref());
        if (flag === -1) {
            throw new Error(this.error.message());
        }
        return flag;
    }
}

module.exports = { GciSession, };
