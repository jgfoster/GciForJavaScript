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
        const gci = GciLibrary(library);
        const error = new GciErrSType();
        const stoneNRS = '!tcp@localhost#server!' + login.stone;
        const gemNRS = '!tcp@' + login.gem_host + '#netldi:' + login.netldi + '#task!gemnetobject';
        this.session = gci.GciTsLogin(
            stoneNRS, // const char *StoneNameNrs
            null, // const char *HostUserId
            null, // const char *HostPassword
            false, // BoolType hostPwIsEncrypted
            gemNRS, // const char *GemServiceNrs
            user, // const char *gemstoneUsername
            password, // const char *gemstonePassword
            0, // unsigned int loginFlags (per GCI_LOGIN* in gci.ht)
            0, // int haltOnErrNum
            error.ref() // GciErrSType *err
        );
        if (this.session === 0) {
            throw new Error(Buffer.from(error.message).toString('utf8').split('\0').shift());
        }
    }

}

module.exports = { GciSession, };
