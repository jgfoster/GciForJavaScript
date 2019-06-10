/*
 *  GciLibrary.js
 */


const FFI = require('ffi-napi');
const ref = require('ref');
const Struct = require('ref-struct');

const GCI_ERR_STR_SIZE = 1024;
const GCI_ERR_REASON_SIZE = GCI_ERR_STR_SIZE;
const GCI_MAX_ERR_ARGS = 10;
const OOP_ILLEGAL = 1;
const OOP_NIL = 20;
const OopType = ref.types.uint64;

// uint GciTsVersion(char *buf, size_t bufSize);
const GCI = FFI.Library('libgcits-3.4.3-64.dylib', {
    'GciI32ToOop': [ OopType, [ 'int'] ], 
    'GciTsCharToOop': [ OopType, [ 'uint' ] ],
    'GciTsDoubleToSmallDouble': [ OopType, [ 'double'] ], 
    'GciTsOopIsSpecial': [ 'bool', [ OopType ] ],
    'GciTsOopToChar': [ 'int', [ OopType ] ],
    'GciTsVersion': [ 'uint', [ 'string', 'size_t' ] ],
});

const GciErrSType = Struct({

});

module.exports = GCI;
