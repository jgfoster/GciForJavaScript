
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

module.exports = GciErrSType;
