/*
 *  GciLibrary.js
 */

const FFI = require('ffi-napi');

const OOP_ILLEGAL = 1;
const OOP_NIL = 20;
const OOP_CLASS_STRING = 74753;

const pGciErrSType = 'pointer';
const GciSessionType = 'int64';
const OopType = 'int64';

class GciErrSType {       // gci.ht 
    constructor() { this.buffer = Buffer.alloc(2200);   }   // 2163 plus some padding
    ref()       { return this.buffer;                   }
    category()  { return this.buffer.readIntLE(  0, 6); }   // size is actually 8 bytes, but Buffer only supports 6 bytes before Node.js v12.0.0
    context()   { return this.buffer.readIntLE(  8, 6); }   // OOP of GsProcess
    exception() { return this.buffer.readIntLE( 16, 6); }   // OOP of Exception object
    // args() an array of 10 OopType values
    number()    { return this.buffer.readIntLE(104, 4); }
    argCount()  { return this.buffer.readIntLE(108, 4); }
    fatal()     { return this.buffer.readIntLE(112, 1); }
    message()   { return this.buffer.toString('utf8',  113, 1025).split('\0').shift() }
    reason()    { return this.buffer.toString('utf8', 1138, 1025).split('\0').shift() }
}

GciLibrary = (path) => {
    return FFI.Library(path, {
        'GciI32ToOop'               : [ OopType,    [ 'int'] ], 
        'GciTsAbort'                : [ 'bool',     [ GciSessionType, pGciErrSType ] ],
        'GciTsBegin'                : [ 'bool',     [ GciSessionType, pGciErrSType ] ],
        'GciTsBreak'                : [ 'bool',     [ GciSessionType, 'bool', pGciErrSType ] ],
        'GciTsCallInProgress'       : [ 'int',      [ GciSessionType, pGciErrSType ] ],
        'GciTsCharToOop'            : [ OopType,    [ 'uint' ] ],
        'GciTsClassRemoveAllMethods': [ 'bool',     [ GciSessionType, OopType, pGciErrSType ] ],
        'GciTsClearStack'           : [ OopType,    [ GciSessionType, OopType, pGciErrSType ] ],
        'GciTsCompileMethod'        : [ OopType,    [ GciSessionType, OopType, OopType, OopType, OopType, OopType, 'int', 'ushort', pGciErrSType ] ],
        'GciTsCharToOop'            : [ OopType,    [ 'uint' ] ],
        'GciTsContinueWith'         : [ OopType,    [ GciSessionType, OopType, OopType, 'pointer', 'int', pGciErrSType ] ],
        'GciTsCommit'               : [ 'bool',     [ GciSessionType, pGciErrSType ] ],
        'GciTsDoubleToOop'          : [ OopType,    [ GciSessionType, 'double', pGciErrSType ] ],
        'GciTsDoubleToSmallDouble'  : [ OopType,    [ 'double', pGciErrSType ] ], 
        'GciTsEncrypt'              : [ 'string',   [ 'string', 'pointer', 'int64' ]],
        'GciTsExecute'              : [ OopType,    [ 
                                        GciSessionType, 
                                        'string',   // const char* sourceStr
                                        OopType,    // sourceOop
                                        OopType,    // contextObject
                                        OopType,    // symbolList
                                        'int',      // int flags
                                        'uint16',   // ushort environmentId
                                        'pointer'   // GciErrSType *err
                                    ] ],
        'GciTsExecute_'             : [ OopType,    [ 
                                        GciSessionType, 
                                        'string',   // const char* sourceStr
                                        'int64',    // ssize_t sourceSize
                                        OopType,    // sourceOop
                                        OopType,    // context
                                        OopType,    // symbolList
                                        'int',      // flags
                                        'uint16',   // ushort environmentId
                                        'pointer'   // GciErrSType *err
                                    ] ],
        'GciTsExecuteFetchBytes'    : [ 'int64',    [ 
                                        GciSessionType, 
                                        'string',   // const char* sourceStr
                                        'int64',    // ssize_t sourceSize
                                        OopType,    // sourceOop
                                        OopType,    // context
                                        OopType,    // symbolList
                                        'pointer',  // ByteType *result
                                        'uint64',   // ssize_t maxResultSize
                                        'pointer'   // GciErrSType *err
                                    ] ],
        'GciTsFetchBytes'           : [ 'int64',    [ GciSessionType, OopType, 'int64', 'pointer', 'int64', pGciErrSType ] ],
        'GciTsFetchChars'           : [ 'int64',    [ GciSessionType, OopType, 'int64', 'pointer', 'int64', pGciErrSType ] ],
        'GciTsFetchClass'           : [ OopType,    [ GciSessionType, OopType, pGciErrSType ] ],
        'GciTsFetchSize'            : [ 'int64',    [ GciSessionType, OopType, pGciErrSType ] ],
        'GciTsFetchSpecialClass'    : [ OopType,    [ OopType ] ],
        'GciTsFetchUnicode'         : [ 'int64',    [ GciSessionType, OopType, 'pointer', 'int64', 'pointer', pGciErrSType ] ],
        'GciTsFetchUtf8'            : [ 'int64',    [ GciSessionType, OopType, 'pointer', 'int64', 'pointer', pGciErrSType ] ],
        'GciTsFetchUtf8Bytes'       : [ 'int64',    [ GciSessionType, OopType, 'int64', 'pointer', 'int64', 'pointer', pGciErrSType, 'int32' ] ],
        'GciTsFetchVaryingSize'     : [ 'int64',    [ GciSessionType, OopType, pGciErrSType ] ],
        'GciTsGemTrace'             : [ 'int',      [ GciSessionType, 'int', pGciErrSType ] ],
        'GciTsI64ToOop'             : [ OopType,    [ GciSessionType, 'int64', pGciErrSType ] ],
        'GciTsIsKindOf'             : [ 'int',      [ GciSessionType, OopType, OopType, pGciErrSType ] ],
        'GciTsIsKindOfClass'        : [ 'int',      [ GciSessionType, OopType, OopType, pGciErrSType ] ],
        'GciTsIsSubclassOf'         : [ 'int',      [ GciSessionType, OopType, OopType, pGciErrSType ] ],
        'GciTsIsSubclassOfClass'    : [ 'int',      [ GciSessionType, OopType, OopType, pGciErrSType ] ],
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
                                        'pointer' // GciErrSType *err
                                    ] ],
        'GciTsLogout'               : [ 'bool',     [ GciSessionType, pGciErrSType ] ],
        'GciTsNewByteArray'         : [ OopType,    [ GciSessionType, 'string', 'int32', pGciErrSType ] ],
        'GciTsNewObj'               : [ OopType,    [ GciSessionType, OopType, pGciErrSType ] ],
        'GciTsNewString'            : [ OopType,    [ GciSessionType, 'string', 'int32', pGciErrSType ] ],
        'GciTsNewSymbol'            : [ OopType,    [ GciSessionType, 'string', pGciErrSType ] ],
        'GciTsNewUnicodeString_'    : [ OopType,    [ GciSessionType, 'pointer', 'int32', pGciErrSType ] ],
        'GciTsNewUtf8String_'       : [ OopType,    [ GciSessionType, 'pointer', 'int32', 'bool', pGciErrSType ] ],
        'GciTsObjExists'            : [ 'bool',     [ GciSessionType, OopType ] ],
        'GciTsOopIsSpecial'         : [ 'bool',     [ OopType ] ],
        'GciTsOopToChar'            : [ 'int',      [ OopType ] ],
        'GciTsOopToDouble'          : [ 'bool',     [ GciSessionType, OopType, 'pointer', pGciErrSType ] ],
        'GciTsOopToI64'             : [ 'bool',     [ GciSessionType, OopType, 'pointer', pGciErrSType ] ],
        'GciTsPerform'              : [ OopType,    [ 
                                        GciSessionType, 
                                        OopType,    // receiver
                                        OopType,    // aSymbol 
                                        'string',   // const char* selectorStr 
                                        'pointer',  // const OopType *args
                                        'int',      // int numArgs
                                        'int',      // int flags
                                        'uint16',   // ushort environmentId
                                        'pointer'   // GciErrSType *err
                                    ] ],
        'GciTsPerformFetchBytes'    : [ OopType,    [ 
                                        GciSessionType, 
                                        OopType,    // receiver 
                                        'string',   // const char *selectorStr
                                        'pointer',  // const OopType *args 
                                        'int',      // int numArgs
                                        'pointer',  // ByteType *result
                                        'uint64',   // ssize_t  maxResultSize
                                        'pointer'   // GciErrSType *err 
                                    ] ],
        'GciTsProtectMethods'       : [ 'bool',     [ GciSessionType, 'bool', pGciErrSType ] ],
        'GciTsReleaseAllObjs'       : [ 'bool',     [ GciSessionType, pGciErrSType ] ],
        'GciTsReleaseObjs'          : [ 'bool',     [ GciSessionType, 'pointer', 'int', pGciErrSType ] ],
        'GciTsResolveSymbol'        : [ OopType,    [ GciSessionType, 'string', OopType, pGciErrSType ] ],
        'GciTsResolveSymbolObj'     : [ OopType,    [ GciSessionType, OopType, OopType, pGciErrSType ] ],
        'GciTsSaveObjs'             : [ 'bool',     [ GciSessionType, 'pointer', 'int', pGciErrSType ] ],
        'GciTsSessionIsRemote'      : [ 'int',      [ GciSessionType ] ],
        'GciTsStoreBytes'           : [ 'bool',     [ GciSessionType, OopType, 'int64', 'pointer', 'int64', OopType, pGciErrSType ] ],
        'GciTsVersion'              : [ 'uint',     [ 'string', 'size_t' ] ],
    });
}

module.exports = { GciLibrary, GciErrSType, OOP_ILLEGAL, OOP_NIL, OOP_CLASS_STRING };
