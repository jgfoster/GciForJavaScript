/*
 *  GciLibrary.js
 */


const FFI = require('ffi-napi');
const ref = require('ref');
const ArrayType = require('ref-array');
const Struct = require('ref-struct');

const GCI_ERR_STR_SIZE = 1024;
const GCI_ERR_reasonSize = GCI_ERR_STR_SIZE;
const GCI_MAX_ERR_ARGS = 10;
const OOP_ILLEGAL = 1;
const OOP_NIL = 20;

const GciSession = ref.types.int;
const OopType = ref.types.uint64;
const GciErrSType = Struct({        // gci.ht 
    category:   OopType,    // error dictionary
    context:    OopType,    // GemStone Smalltalk execution state , a GsProcess
    exception:  OopType,    // an instance of AbstractException, or nil; 
                            // nil if error was not signaled from Smalltalk execution
    args:       ArrayType(OopType, GCI_MAX_ERR_ARGS),  // arguments to error text
    number:     'int',      // GemStone error number
    argCount:   'int',      // num of arg in the args[]
    fatal:      'uchar',    // nonzero if err is fatal 
    message:    ArrayType('char', GCI_ERR_STR_SIZE + 1),     // null-terminated Utf8
    reason:     ArrayType('char', GCI_ERR_reasonSize + 1)    // null-terminated Utf8
});

// uint GciTsVersion(char *buf, size_t bufSize);
const path = '/pitcairn1/users/jfoster/checkouts/trunk/slow42/gs/product/lib/libgcits-3.5.0-64.dylib';
const gci = FFI.Library(path, {
    'GciI32ToOop': [ OopType, [ 'int'] ], 
    'GciTsCharToOop': [ OopType, [ 'uint' ] ],
    'GciTsDoubleToSmallDouble': [ OopType, [ 'double'] ], 
    'GciTsLogin': [ GciSession, [ 
        'string', // const char *StoneNameNrs
        'string', // const char *HostUserId
        'string', // const char *HostPassword
        'bool',   // BoolType hostPwIsEncrypted
        'string', // const char *GemServiceNrs
        'string', // const char *gemstoneUsername
        'string', // const char *gemstonePassword
        'uint',   // unsigned int loginFlags (per GCI_LOGIN* in gci.ht)
        'int',    // int haltOnErrNum
        ref.refType(GciErrSType) // GciErrSType *err
     ] ],
    'GciTsOopIsSpecial': [ 'bool', [ OopType ] ],
    'GciTsOopToChar': [ 'int', [ OopType ] ],
    'GciTsVersion': [ 'uint', [ 'string', 'size_t' ] ],
});

module.exports = { gci, GciErrSType };
