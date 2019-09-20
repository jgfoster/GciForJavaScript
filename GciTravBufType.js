/*
 *  GciTravBufType.js
 */

class GciObjRepHdrSType {   // gci.ht
    constructor(buf){ 
        this.buffer = buf; 
        this.headerSize = 40; 
        // definitions of bottom 8 bits within _idxSizeBits
        this.implem_mask        = 0x03;  // GC_IMPLEMENTATION_MASK
        this.indexable_mask     = 0x04;  // GC_INDEXABLE_MASK
        this.invariant_mask     = 0x08;  // GC_INVARIANT_MASK
        this.partial_mask       = 0x10;                
        this.overlay_mask       = 0x20;
        this.no_read_auth_mask  = 0x40;
        this.clamped_mask       = 0x80;
        // other constants
        this.swiz_kind_mask     = 0x300; // a GciByteSwizEType
        this.swiz_kind_shift    = 8;
        this.unused_mask        = 0xFC00;
        this.all_bits_mask      = 0xFFFF;
        this.all_bits_numDynIvs_mask = 0xFFFFFF;
    }
    // C++ class members
    valueBuffSize()     { return this.buffer.readIntLE ( 0, 4); }   // size in bytes of obj's value buff 
    namedSize()         { return this.buffer.readIntLE ( 4, 2); }   // number of named instVars
    securityPolicy()    { return this.buffer.readUIntLE( 6, 2); }   // always UNDEFINED_ObjectSecurityPolicyId
    objId()             { return this.buffer.readIntLE ( 8, 6); }   // OOP of the object
    oclass()            { return this.buffer.readIntLE (16, 6); }   // OOP of the class of the object
    firstOffset()       { return this.buffer.readIntLE (24, 6); }   // absolute offset of first instVar in the value buffer
    // _idxSizeBits  
    idxSize()           { return this.buffer.readUIntLE(29, 5); }   // 40 bits of size
    numDynamicIvs()     { return this.buffer.readUIntLE(30, 1); }   //  8 bits numDynamicIvs
    bitFlags()          { return this.buffer.readUIntLE(31, 2); }   // 16 bit flags

    // internal and debugging functions
    _setIdxSizeBits(value)      { this.buffer.writeUIntLE(value, 32, 6); }
    _class()                    { return 'GciObjRepHdrSType'; }
    _address()                  { return this.buffer.byteOffset; }
    _setBitFlags(mask, value)   { this.buffer.writeUIntLE((this.bitFlags() & ~ mask) | (value & mask), 31, 2); }

    // public accessors
    nextReport()            { return new GciObjRepHdrSType(this.buffer.slice(this.usedBytes())); }
    numOopsInValue()        { return this.valueBuffSize() / 8; }
    objImpl()               { return this.bitFlags() & this.implem_mask; }
    objSize()               { return this.idxSize() + this.namedSize() }
    usedBytes()             { return this.headerSize + this.valueBuffSize(); }
    valueBuffer()           { return this.buffer.slice(this.headerSize); }

    // public mutators
    setObjImpl(value)       { this._setBitFlags(this.implem_mask, value); }
    setIdxSize(size)        { this.buffer.writeUIntLE(size, 29, 5); }
    setNumDynamicIvs(size)  { this.buffer.writeUIntLE(size, 30, 1); }

    // public accessors and mutators for bit flags
    isClamped()             { return (this.bitFlags() & this.clamped_mask     ) != 0; }
    isIndexable()           { return (this.bitFlags() & this.indexable_mask   ) != 0; }
    isInvariant()           { return (this.bitFlags() & this.invariant_mask   ) != 0; }
    isNoReadAuthorization() { return (this.bitFlags() & this.no_read_auth_mask) != 0; }
    isOverlayed()           { return (this.bitFlags() & this.overlay_mask     ) != 0; }
    isPartial()             { return (this.bitFlags() & this.partial_mask     ) != 0; }
    clearBits      (           ){ this._setBitFlags(this.all_bits_mask    ,             0); }
    setIsClamped   (flag = true){ this._setBitFlags(this.clamped_mask     , flag ? -1 : 0); }
    setIndexable   (flag = true){ this._setBitFlags(this.indexable_mask   , flag ? -1 : 0); }
    setInvariant   (flag = true){ this._setBitFlags(this.invariant_mask   , flag ? -1 : 0); }
    setisNoReadAuth(flag = true){ this._setBitFlags(this.no_read_auth_mask, flag ? -1 : 0); }
    setOverlayed   (flag = true){ this._setBitFlags(this.overlay_mask     , flag ? -1 : 0); }
    setPartial     (flag = true){ this._setBitFlags(this.partial_mask     , flag ? -1 : 0); }
}

class GciObjRepSType {      // gci.ht
    constructor(buf){ this.buffer = buf; }
    _address()      { return this.buffer.byteOffset; }
    header()        { return new GciObjRepHdrSType(this.buffer); }
    bytes()         { return this.buffer.slice(); }
    oops()          { return this.buffer.slice(); }
    usedBytes()     { return this.header().usedBytes(); }
    nextReport()    { return this.header().nextReport(); }
}

module.exports = class GciTravBufType {      // gcicmn.ht
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
    _address()      { return this.buffer.byteOffset;      }
    allocatedBytes(){ return this.buffer.readUInt32LE(0); }
    usedBytes()     { return this.buffer.readUInt32LE(4); }
    setUsedBytes(i) { this.buffer.writeUInt32LE(i, 4);    }
    firstReport()   { return new GciObjRepSType(this.buffer.slice(8                        )); }
    readLimit()     { return new GciObjRepSType(this.buffer.slice(8 + this.usedBytes()     )); }
    writeLimit()    { return new GciObjRepSType(this.buffer.slice(8 + this.allocatedBytes())); }
    firstReportHdr(){ return this.firstReport().header(); }
    readLimitHdr()  { return this.readLimit().header();   }
    writeLimitHdr() { return this.writeLimit().header();  }
}
