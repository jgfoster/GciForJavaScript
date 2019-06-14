/*
 *  GciSession.js
 *
 *  GciSession provides a wrapper around GciLibrary
 */

const { GciLibrary, GciErrSType, OOP_ILLEGAL, OOP_NIL, OOP_CLASS_STRING } = require("./GciLibrary");

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

class GciSession {
    constructor(user = login.gs_user, password = login.gs_password, library = login.library) {
        this.gci = GciLibrary(library);
        this.error = new GciErrSType();
        const stoneNRS = '!tcp@localhost#server!' + login.stone;
        const gemNRS = '!tcp@' + login.gem_host + '#netldi:' + login.netldi + '#task!gemnetobject';
        this.session = this.gci.GciTsLogin(
            stoneNRS, // const char *StoneNameNrs
            null, // const char *HostUserId
            null, // const char *HostPassword
            false, // BoolType hostPwIsEncrypted
            gemNRS, // const char *GemServiceNrs
            user, // const char *gemstoneUsername
            password, // const char *gemstonePassword
            0, // unsigned int loginFlags (per GCI_LOGIN* in gci.ht)
            0, // int haltOnErrNum
            this.error.ref() // GciErrSType *err
        );
        if (this.session === 0) {
            throw new Error(Buffer.from(this.error.message).toString('utf8').split('\0').shift());
        }
    }

    abort() {
        if (!this.gci.GciTsAbort(this.session, this.error.ref())) {
            throw new Error(Buffer.from(this.error.message).toString('utf8').split('\0').shift());
        }
    }

    begin() {
        if (!this.gci.GciTsBegin(this.session, this.error.ref())) {
            throw new Error(Buffer.from(this.error.message).toString('utf8').split('\0').shift());
        }
    }

    commit() {
        if (!this.gci.GciTsCommit(this.session, this.error.ref())) {
            throw new Error(Buffer.from(this.error.message).toString('utf8').split('\0').shift());
        }
    }

    execute(string) {
        const oop = this.gci.GciTsExecute_(this.session, string, string.length, OOP_CLASS_STRING, 
            OOP_ILLEGAL, OOP_NIL, 0, 0, this.error.ref());
        if (oop === OOP_ILLEGAL) {
            throw new Error(Buffer.from(this.error.message).toString('utf8').split('\0').shift());
        }
        return oop;
    }

    executeFetchBytes(string, expectedSize) {
        const buffer = Buffer.alloc(expectedSize);
        const actualSize = this.gci.GciTsExecuteFetchBytes(this.session, string, string.length, OOP_CLASS_STRING, 
            OOP_ILLEGAL, OOP_NIL, buffer, buffer.length, this.error.ref());
        if (actualSize === -1) {
            throw new Error(Buffer.from(this.error.message).toString('utf8').split('\0').shift());
        }
        return buffer.toString('utf8', 0, actualSize);
    }

    fetchClass(oop) {
        const classOop = this.gci.GciTsFetchClass(this.session, oop, this.error.ref());
        if (classOop === OOP_ILLEGAL) {
            throw new Error(Buffer.from(this.error.message).toString('utf8').split('\0').shift());
        }
        return classOop;
    }

    fetchSize(oop) {
        const size = this.gci.GciTsFetchSize(this.session, oop, this.error.ref());
        if (size === -1) {
            throw new Error(Buffer.from(this.error.message).toString('utf8').split('\0').shift());
        }
        return size;
    }

    fetchVaryingSize(oop) {
        const size = this.gci.GciTsFetchVaryingSize(this.session, oop, this.error.ref());
        if (size === -1) {
            throw new Error(Buffer.from(this.error.message).toString('utf8').split('\0').shift());
        }
        return size;
    }

    hardBreak() {
        if (!this.gci.GciTsBreak(this.session, true, this.error.ref())) {
            throw new Error(Buffer.from(this.error.message).toString('utf8').split('\0').shift());
        }
    }

    isCallInProgress() {
        const flag = this.gci.GciTsCallInProgress(this.session, this.error.ref());
        if (flag === -1) {
            throw new Error(Buffer.from(this.error.message).toString('utf8').split('\0').shift());
        }
        return flag === 1;
    }

    isKindOf(objectOop, classOop) {
        const flag = this.gci.GciTsIsKindOf(this.session, objectOop, classOop, this.error.ref());
        if (flag === -1) {
            throw new Error(Buffer.from(this.error.message).toString('utf8').split('\0').shift());
        }
        return flag === 1;
    }

    logout() {
        if (!this.gci.GciTsLogout(this.session, this.error.ref())) {
            throw new Error(Buffer.from(this.error.message).toString('utf8').split('\0').shift());
        }
        this.session = 0;
    }

    perform(receiver, selector, oopArray) {
        const oop = this.gci.GciTsPerform(this.session, receiver, OOP_ILLEGAL, selector, oopArray, 
            oopArray.length, 0, 0, this.error.ref());
        if (oop === OOP_ILLEGAL) {
            throw new Error(Buffer.from(this.error.message).toString('utf8').split('\0').shift());
        }
        return oop;
    }

    performFetchBytes(receiver, selector, oopArray, expectedSize) {
        const buffer = Buffer.alloc(expectedSize + 10);
        const actualSize = this.gci.GciTsPerformFetchBytes(this.session, receiver, selector, 
            oopArray, oopArray.length, buffer, buffer.length, this.error.ref());
        if (actualSize === -1) {
            throw new Error(Buffer.from(this.error.message).toString('utf8').split('\0').shift());
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
            throw new Error(Buffer.from(this.error.message).toString('utf8').split('\0').shift());
        }
    }

    trace(level) {
        const flag = this.gci.GciTsGemTrace(this.session, level, this.error.ref());
        if (flag === -1) {
            throw new Error(Buffer.from(this.error.message).toString('utf8').split('\0').shift());
        }
        return flag;
    }
}

module.exports = { GciSession, };
