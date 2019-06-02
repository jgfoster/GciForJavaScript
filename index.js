
// https://www.npmjs.com/package/ffi-napi
// https://github.com/node-ffi-napi/node-ffi-napi
// https://github.com/node-ffi/node-ffi/wiki/Node-FFI-Tutorial 

var FFI = require('ffi-napi');

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
class GciLibrary {
    constructor(version) {
        // this needs to handle Linux, macOS, and Windows
        this.load('libgcits-' + version + '-64.dylib');
    }

    load(path) {
        this.library = FFI.Library(path, {
            // Add function definitions here

            // uint GciTsVersion(char *buf, size_t bufSize);
            'GciTsVersion': [ 'uint', [ 'string', 'size_t' ] ],
        });
    }

    // add wrapper functions here

    // answer a string describing version information
    // this does not require a login and shows pretty well that we are talking to the library
    version() {
        // https://stackoverflow.com/questions/32134106/node-ffi-passing-string-pointer-to-c-library
        const buffer = Buffer.alloc(64);
        const result = this.library.GciTsVersion(buffer, buffer.length);
        console.assert(result === 3);
        var string = buffer.toString('utf-8');
        const index = string.indexOf('\u0000');
        if (index >= 0) {
            string = string.substr(0, index);
        }
        return string;
    }
}

const gci = new GciLibrary('3.4.3');
const version = gci.version();
console.log(version);


// var ref = require('ref');
// var Struct = require('ref-struct');

// var TimeVal = Struct({
//     'tv_sec': 'long',
//     'tv_usec': 'long'
// });
// var TimeValPtr = ref.refType(TimeVal);

// var lib = new FFI.Library(null, { 'gettimeofday': [ 'int', [ TimeValPtr, "pointer" ] ]});
// var tv = new TimeVal();
// lib.gettimeofday(tv.ref(), null);
// console.log("Seconds since epoch: " + tv.tv_sec);