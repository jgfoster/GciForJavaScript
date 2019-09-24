/*
 *  GciLibrary.js
 */

const FFI = require('ffi-napi');

const pGciErrSType = 'pointer';
const GciSessionType = 'int64';
const OopType = 'int64';

module.exports = (path) => {
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
                                        pGciErrSType
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
                                        pGciErrSType
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
                                        pGciErrSType
                                    ] ],
        'GciTsFetchBytes'           : [ 'int64',    [ GciSessionType, OopType, 'int64', 'pointer', 'int64', pGciErrSType ] ],
        'GciTsFetchChars'           : [ 'int64',    [ GciSessionType, OopType, 'int64', 'pointer', 'int64', pGciErrSType ] ],
        'GciTsFetchClass'           : [ OopType,    [ GciSessionType, OopType, pGciErrSType ] ],
        'GciTsFetchObjInfo'         : [ 'int64',    [ GciSessionType, OopType, 'bool', 'pointer', 'pointer', 'int64', pGciErrSType ] ],
        'GciTsFetchOops'            : [ 'int',      [ GciSessionType, OopType, 'int64', 'pointer', 'int', pGciErrSType ] ],
        'GciTsFetchSize'            : [ 'int64',    [ GciSessionType, OopType, pGciErrSType ] ],
        'GciTsFetchSpecialClass'    : [ OopType,    [ OopType ] ],
        'GciTsFetchTraversal'       : [ 'int',      [ GciSessionType, 'pointer', 'int', 'pointer', 'pointer', 'int', pGciErrSType ] ],
        'GciTsFetchUnicode'         : [ 'int64',    [ GciSessionType, OopType, 'pointer', 'int64', 'pointer', pGciErrSType ] ],
        'GciTsFetchUtf8'            : [ 'int64',    [ GciSessionType, OopType, 'pointer', 'int64', 'pointer', pGciErrSType ] ],
        'GciTsFetchUtf8Bytes'       : [ 'int64',    [ GciSessionType, OopType, 'int64', 'pointer', 'int64', 'pointer', pGciErrSType, 'int' ] ],
        'GciTsFetchVaryingSize'     : [ 'int64',    [ GciSessionType, OopType, pGciErrSType ] ],
        'GciTsGemTrace'             : [ 'int',      [ GciSessionType, 'int', pGciErrSType ] ],
        'GciTsGetFreeOops'          : [ 'int',      [ GciSessionType, 'pointer', 'int', pGciErrSType ] ],
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
                                        pGciErrSType
                                    ] ],
        'GciTsLogout'               : [ 'bool',     [ GciSessionType, pGciErrSType ] ],
        'GciTsMoreTraversal'        : [ 'int',      [ GciSessionType, 'pointer', pGciErrSType ] ],
        'GciTsNewByteArray'         : [ OopType,    [ GciSessionType, 'string', 'int', pGciErrSType ] ],
        'GciTsNewObj'               : [ OopType,    [ GciSessionType, OopType, pGciErrSType ] ],
        'GciTsNewString'            : [ OopType,    [ GciSessionType, 'string', 'int', pGciErrSType ] ],
        'GciTsNewSymbol'            : [ OopType,    [ GciSessionType, 'string', pGciErrSType ] ],
        'GciTsNewUnicodeString_'    : [ OopType,    [ GciSessionType, 'pointer', 'int', pGciErrSType ] ],
        'GciTsNewUtf8String_'       : [ OopType,    [ GciSessionType, 'pointer', 'int', 'bool', pGciErrSType ] ],
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
                                        pGciErrSType
                                    ] ],
        'GciTsPerformFetchBytes'    : [ OopType,    [ 
                                        GciSessionType, 
                                        OopType,    // receiver 
                                        'string',   // const char *selectorStr
                                        'pointer',  // const OopType *args 
                                        'int',      // int numArgs
                                        'pointer',  // ByteType *result
                                        'uint64',   // ssize_t  maxResultSize
                                        pGciErrSType 
                                    ] ],
        'GciTsProtectMethods'       : [ 'bool',     [ GciSessionType, 'bool', pGciErrSType ] ],
        'GciTsReleaseAllObjs'       : [ 'bool',     [ GciSessionType, pGciErrSType ] ],
        'GciTsReleaseObjs'          : [ 'bool',     [ GciSessionType, 'pointer', 'int', pGciErrSType ] ],
        'GciTsRemoveOopsFromNsc'    : [ 'int',      [ GciSessionType, OopType, 'pointer', 'int', pGciErrSType ] ],
        'GciTsResolveSymbol'        : [ OopType,    [ GciSessionType, 'string', OopType, pGciErrSType ] ],
        'GciTsResolveSymbolObj'     : [ OopType,    [ GciSessionType, OopType, OopType, pGciErrSType ] ],
        'GciTsSaveObjs'             : [ 'bool',     [ GciSessionType, 'pointer', 'int', pGciErrSType ] ],
        'GciTsSessionIsRemote'      : [ 'int',      [ GciSessionType ] ],
        'GciTsStoreBytes'           : [ 'bool',     [ GciSessionType, OopType, 'int64', 'pointer', 'int64', OopType, pGciErrSType ] ],
        'GciTsStoreTrav'            : [ 'bool',     [ GciSessionType, 'pointer', 'int', pGciErrSType ] ],
        'GciTsStoreTravDoTravRefs'  : [ 'int',      [ GciSessionType, 'pointer', 'int', 'pointer', 'int', 'pointer', 'pointer', pGciErrSType ] ],
        'GciTsVersion'              : [ 'uint',     [ 'string', 'size_t' ] ],
    });
}
