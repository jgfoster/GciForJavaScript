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

class GciTsObjInfo {        // gcits.hf
    constructor()   { this.buffer = Buffer.alloc(40);       }   // 36 plus some padding
    ref()           { return this.buffer;                   }
    objId()         { return this.buffer.readIntLE(  0, 6); }
    objClass()      { return this.buffer.readIntLE(  8, 6); }
    objSize()       { return this.buffer.readIntLE( 16, 6); }
    namedSize()     { return this.buffer.readIntLE( 24, 4); }
    access()        { return this.buffer.readIntLE( 28, 4); }
    securityPolicy(){ return this.buffer.readIntLE( 32, 2); }
    bits()          { return this.buffer.readIntLE( 34, 2); }
    isInvariant()   { return this.bits() & 0x08 === 0x08;   }
    isIndexable()   { return this.bits() & 0x04 === 0x04;   }
    isPartial()     { return this.bits() & 0x10 === 0x10;   }
    isOverlayed()   { return this.bits() & 0x20 === 0x20;   }
    objImpl()       { return this.bits() & 0x03;            }
}

class GciObjRepSType {
    constructor(buf){ this.buffer = buf;    }
    _address()      { return this.buffer.byteOffset; }
}

class GciTravBufType {
    constructor(bodySize = 2048) { 
        if (bodySize < 2048) {
            bodySize = 2048;
        } else {
            bodySize = Math.floor((bodySize - 1) / 8) * 8 + 8;  // ensure size is rounded to 8 bytes
        }
        this.buffer = Buffer.alloc(bodySize + 8); 
        this.buffer.writeUInt32LE(bodySize, 0); // uint allocatedBytes; // allocated size of the body
        this.setUsedBytes(0);
    }
    _address()      { return this.buffer.byteOffset; }
    allocatedBytes(){ return this.buffer.readUInt32LE(0); }
    usedBytes()     { return this.buffer.readUInt32LE(4); }
    setUsedBytes(i) { this.buffer.writeUInt32LE(i, 4);    }
    firstReport()   { return new GciObjRepSType(this.buffer.slice(8));  }
    readLimit()     { return new GciObjRepSType(this.buffer.slice(8 + this.usedBytes())); }
    writeLimit()    { return new GciObjRepSType(this.buffer.slice(8 + this.allocatedBytes())); }
    firstReportHdr(){ return new GciObjRepHdrSType(this.firstReport()); }
    readLimitHdr()  { return new GciObjRepHdrSType(this.readLimit());   }
    writeLimitHdr() { return new GciObjRepHdrSType(this.writeLimit());  }
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
        'GciTsFetchObjInfo'         : [ 'int64',    [ GciSessionType, OopType, 'bool', 'pointer', 'pointer', 'int64', pGciErrSType ] ],
        'GciTsFetchOops'            : [ 'int',      [ GciSessionType, OopType, 'int64', 'pointer', 'int', pGciErrSType ] ],
        'GciTsFetchSize'            : [ 'int64',    [ GciSessionType, OopType, pGciErrSType ] ],
        'GciTsFetchSpecialClass'    : [ OopType,    [ OopType ] ],
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
                                        'pointer' // GciErrSType *err
                                    ] ],
        'GciTsLogout'               : [ 'bool',     [ GciSessionType, pGciErrSType ] ],
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
        'GciTsRemoveOopsFromNsc'    : [ 'int',      [ GciSessionType, OopType, 'pointer', 'int', pGciErrSType ] ],
        'GciTsResolveSymbol'        : [ OopType,    [ GciSessionType, 'string', OopType, pGciErrSType ] ],
        'GciTsResolveSymbolObj'     : [ OopType,    [ GciSessionType, OopType, OopType, pGciErrSType ] ],
        'GciTsSaveObjs'             : [ 'bool',     [ GciSessionType, 'pointer', 'int', pGciErrSType ] ],
        'GciTsSessionIsRemote'      : [ 'int',      [ GciSessionType ] ],
        'GciTsStoreBytes'           : [ 'bool',     [ GciSessionType, OopType, 'int64', 'pointer', 'int64', OopType, pGciErrSType ] ],
/*
EXTERN_GCI_DEC(BoolType) GciTsStoreTrav(GciSession sess, 
	GciTravBufType *travBuff, int flag, GciErrSType *err);
*/
        'GciTsStoreTrav'            : [ 'bool',     [ GciSessionType, 'pointer', 'int', pGciErrSType ] ],
        'GciTsVersion'              : [ 'uint',     [ 'string', 'size_t' ] ],
    });
}

module.exports = { 
    GciLibrary, GciErrSType, GciTsObjInfo, 
    GciTravBufType, 
    OOP_ILLEGAL, OOP_NIL, OOP_CLASS_STRING 
};
