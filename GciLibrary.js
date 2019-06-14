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
const OOP_CLASS_STRING = 74753;

const GciSessionType = ref.types.int64;     // int is 32-bits in node, but 64-bits in GemStone?
const OopType = ref.types.uint64;

const GciErrSType = Struct({       // gci.ht 
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
/* EXTERN_GCI_DEC(OopType) GciTsExecute(GciSession sess,
    const char* sourceStr, OopType sourceOop,
    OopType contextObject, OopType symbolList,
    int flags, // per GCI_PERFORM_FLAG* in gcicmn.ht
    ushort environmentId, // normally 0
    GciErrSType *err);
*/

GciLibrary = (path) => {
    return FFI.Library(path, {
        'GciI32ToOop'               : [ OopType,    [ 'int'] ], 
        'GciTsAbort'                : [ 'bool',     [ GciSessionType, ref.refType(GciErrSType) ] ],
        'GciTsBegin'                : [ 'bool',     [ GciSessionType, ref.refType(GciErrSType) ] ],
        'GciTsBreak'                : [ 'bool',     [ GciSessionType, 'bool', ref.refType(GciErrSType) ] ],
        'GciTsCommit'               : [ 'bool',     [ GciSessionType, ref.refType(GciErrSType) ] ],
        'GciTsCallInProgress'       : [ 'int',      [ GciSessionType, ref.refType(GciErrSType) ] ],
        'GciTsCharToOop'            : [ OopType,    [ 'uint' ] ],
        'GciTsDoubleToSmallDouble'  : [ OopType,    [ 'double'] ], 
        'GciTsExecute'              : [ OopType,    [ GciSessionType, 'string', OopType, OopType, OopType, 'int', 'uint16', ref.refType(GciErrSType) ] ],
        'GciTsFetchClass'           : [ OopType,    [ GciSessionType, OopType, ref.refType(GciErrSType) ] ],
        'GciTsFetchSize'            : [ 'int64',    [ GciSessionType, OopType, ref.refType(GciErrSType) ] ],
        'GciTsFetchVaryingSize'     : [ 'int64',    [ GciSessionType, OopType, ref.refType(GciErrSType) ] ],
        'GciTsGemTrace'             : [ 'int',      [ GciSessionType, 'int', ref.refType(GciErrSType) ] ],
        'GciTsIsKindOf'             : [ 'int',      [ GciSessionType, OopType, OopType, ref.refType(GciErrSType) ] ],
        'GciTsLogin'                : [ GciSessionType, [ 
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
        'GciTsLogout'               : [ 'bool',     [ GciSessionType, ref.refType(GciErrSType) ] ],
        'GciTsOopIsSpecial'         : [ 'bool',     [ OopType ] ],
        'GciTsOopToChar'            : [ 'int',      [ OopType ] ],
        'GciTsResolveSymbol'        : [ OopType,    [ OopType, 'string', OopType, ref.refType(GciErrSType) ] ],
        'GciTsSessionIsRemote'      : [ 'int',      [ GciSessionType ] ],
        'GciTsVersion'              : [ 'uint',     [ 'string', 'size_t' ] ],
    });
}

module.exports = { GciLibrary, GciErrSType, OOP_ILLEGAL, OOP_NIL, OOP_CLASS_STRING };
