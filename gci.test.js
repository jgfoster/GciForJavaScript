/*
 *  gci.test.js
 *
 *  Based on https://jestjs.io/docs/en/getting-started
 */

const { gci, GciErrSType } = require("./GciLibrary");

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
var session = null;

test('Login info', () => {
    expect(login.gs_user === 'DataCurator');
});

test('GciTsCharToOop', () => {
    expect(gci.GciTsCharToOop("A".charCodeAt(0))).toBe(16668);
    expect(gci.GciTsCharToOop(1114111)).toBe(285212444);
    expect(gci.GciTsCharToOop(1114112)).toBe(1);
});

test('GciTsDoubleToSmallDouble', () => {
    expect(gci.GciTsDoubleToSmallDouble(1.0)).toBe('9151314442816847878');
    expect(gci.GciTsDoubleToSmallDouble(1.0e40)).toBe(1);
});

test('gci.GciI32ToOop', () => {
    expect(gci.GciI32ToOop(0)).toBe(2);
    expect(gci.GciI32ToOop(55)).toBe(442); 
});

test('GciTsOopIsSpecial', () => {
    // expect(gci.GciTsOopIsSpecial(1)).toBe(true);    // OOP_ILLEGAL
    // expect(gci.GciTsOopIsSpecial(20)).toBe(true);    // OOP_NIL
    // expect(gci.GciTsOopIsSpecial(16668)).toBe(true);
});

test('GciTsOopToChar', () => {
    expect(gci.GciTsOopToChar(16668)).toBe("A".charCodeAt(0));
    expect(gci.GciTsOopToChar(16667)).toBe(-1);
});

test('GciTsVersion', () => {
    // https://stackoverflow.com/questions/32134106/node-ffi-passing-string-pointer-to-c-library
    const maxStringLength = 200;
    const theStringBuffer = Buffer.alloc(maxStringLength);
    const result = gci.GciTsVersion(theStringBuffer, maxStringLength);
    var theString = theStringBuffer.toString('utf-8');
    const terminatingNullPos = theString.indexOf('\u0000');
    if (terminatingNullPos >= 0) {theString = theString.substr(0, terminatingNullPos);}
    expect(result).toBe(3);
    expect(theString).toBe('3.4.3 build gss64_3_4_x_branch-45183');
  });

  test('GciTsLogin with nulls', () => {
    error = new GciErrSType();
    session = gci.GciTsLogin(
        null, // const char *StoneNameNrs
        null, // const char *HostUserId
        null, // const char *HostPassword
        false, // BoolType hostPwIsEncrypted
        null, // const char *GemServiceNrs
        null, // const char *gemstoneUsername
        null, // const char *gemstonePassword
        0, // unsigned int loginFlags (per GCI_LOGIN* in gci.ht)
        0, // int haltOnErrNum
        error.ref() // GciErrSType *err
    );
    expect(session).toBe(0);
    expect(error.number).toBe(4051);
    expect(error.category).toBe(231169);
    expect(error.context).toBe(0);
    expect(error.exception).toBe(0);
    expect(error.argCount).toBe(0);
    expect(error.fatal).toBe(1);
    const message = Buffer.from(error.message).toString('utf8').split('\0').shift();
    var expected = 'gemstoneUsername is NULL or empty';
    expect(message).toBe(expected);
    const reason = Buffer.from(error.reason).toString('utf8').split('\0').shift();
    expect(reason).toBe('');
});

test('GciTsLogin', () => {
    error = new GciErrSType();
    stoneNRS = '!tcp@localhost#server!' + login.stone;
    gemNRS = '!tcp@' + login.gem_host + '#netldi:' + login.netldi + '#task!gemnetobject';
    session = gci.GciTsLogin(
        stoneNRS, // const char *StoneNameNrs
        null, // const char *HostUserId
        null, // const char *HostPassword
        false, // BoolType hostPwIsEncrypted
        gemNRS, // const char *GemServiceNrs
        login.gs_user, // const char *gemstoneUsername
        login.gs_password, // const char *gemstonePassword
        0, // unsigned int loginFlags (per GCI_LOGIN* in gci.ht)
        0, // int haltOnErrNum
        error.ref() // GciErrSType *err
    );
    expect(session === 0).toBe(false);
    expect(error.number).toBe(0);
    expect(error.category).toBe(0);
    expect(error.context).toBe(0);
    expect(error.exception).toBe(0);
    expect(error.argCount).toBe(0);
    expect(error.fatal).toBe(0);
    const message = Buffer.from(error.message).toString('utf8').split('\0').shift();
    var expected = '';
    expect(message).toBe(expected);
    const reason = Buffer.from(error.reason).toString('utf8').split('\0').shift();
    expect(reason).toBe('');
});

test('GciTsSessionIsRemote', () => {
    expect(gci.GciTsSessionIsRemote(session)).toBe(true);
    // expect(gci.GciTsSessionIsRemote(session + 1000)).toBe(false);
})

test('GciTsLogout', () => {
    error = new GciErrSType();
    expect(session === 0).toBe(false);
    expect(gci.GciTsLogout(session, error.ref()));
    expect(error.number).toBe(0);
    expect(!gci.GciTsLogout(session, error.ref()));
    expect(error.number).toBe(4100);
    expect(error.category).toBe(231169);
    expect(error.context).toBe(0);
    expect(error.exception).toBe(0);
    expect(error.argCount).toBe(0);
    expect(error.fatal).toBe(0);
    const message = Buffer.from(error.message).toString('utf8').split('\0').shift();
    var expected = 'argument is not a valid GciSession pointer';
    expect(message).toBe(expected);
    const reason = Buffer.from(error.reason).toString('utf8').split('\0').shift();
    expect(reason).toBe('');
});
