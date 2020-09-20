
module.exports = class GciTsObjInfo {        // gcits.hf
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
