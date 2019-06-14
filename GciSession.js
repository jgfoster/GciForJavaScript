/*
 *  GciSession.js
 *
 *  GciSession provides a wrapper around GciLibrary
 */

const { GciLibrary, GciErrSType } = require("./GciLibrary");

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

    logout() {
        if (!this.gci.GciTsLogout(this.session, this.error.ref())) {
            throw new Error(Buffer.from(this.error.message).toString('utf8').split('\0').shift());
        }
        this.session = 0;
    }

    softBreak() {
        if (!this.gci.GciTsBreak(this.session, false, this.error.ref())) {
            throw new Error(Buffer.from(this.error.message).toString('utf8').split('\0').shift());
        }
    }
}

module.exports = { GciSession, };
