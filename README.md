
# GciForJavaScript

JavaScript FFI wrapper for GemStone C Interface (GCI)

[GemStone](https://gemtalksystems.com/products/gs64/) is an object database and Smalltalk application runtime environment. You interact with the database through a dynamically linked C library available for Linux, macOS, and Windows. To use a C library from JavaScript we use [ffi-napi](https://github.com/node-ffi-napi/node-ffi-napi), a foreign function library wrapper that allows us to define C types, structures, and function entry points, then load and call a C library.

GemBuilder for C documentation ([HTML](https://downloads.gemtalksystems.com/docs/GemStone64/3.4.x/GS64-GemBuilderC-3.4/GS64-GemBuilderC-3.4.htm) or [PDF](https://downloads.gemtalksystems.com/docs/GemStone64/3.4.x/GS64-GemBuilderforC-3.4.pdf)) describes the API for the *single-threaded* GCI library. We are using a new *thread-safe* library that has fewer functions (but more features). It is not separately documented, but has a header file, `gcits.hf`, that is the definitive specification (a recent copy is included with this checkout).

The needed C libraries are not included as part of this checkout since there is a different set of libraries for each platform (Linux, macOS, and Windows), and for each GemStone version. You should download a recent version and the appropriate [product](https://gemtalksystems.com/products/gs64/) for your platform. Then move the appropriate files into the directory of your choice.

* Linux: libfloss-3.4.x-64.so and libgcits-3.4.x-64.so
* macOS: libfloss-3.4.x-64.dylib and libgcits-3.4.x-64.dylib
* Windows: libgcits-3.4.x-32.dll and libssl-3.4.x-32.dll

## Files

We use index.js to import GciSession which has the primary public API. This is strictly a proof-of-concept, and is used by [VSCode-GemStone](https://github.com/jgfoster/vscode-gemstone).

## Tests

With the Jest extension, create a debug configuration and run to see the tests.

## Contributing Code

To add new function wrappers follow these steps:

* Identify a new function from `gcits.hf` (pick from the list below);
* Add it to GciLibrary with the appropriate name, arguments, and return type;
* Add a wrapper function to GciSession to provide a JavaScript-like API;
* Add a test to show that it works; and, finally,
* Submit a pull request!

For inspiration, see [GciForPython](https://github.com/jgfoster/GciForPython).

# Function List

## Desired Functions

The following provides a list of all the functions defined in `gcits.hf` grouped to roughly parallel the tables in the GemBuilder for C manual. Checked items have been completed.

### Table 7.1 Functions for Controlling Sessions and Transactions

```C
✓   BoolType   GciTsAbort(GciSession sess, GciErrSType *err);
✓   BoolType   GciTsBegin(GciSession sess, GciErrSType *err);
✓   BoolType   GciTsCommit(GciSession sess, GciErrSType *err);
✓   char*      GciTsEncrypt(const char* password, char *outBuf, size_t outBuffSize);
✓   int        GciTsSessionIsRemote(GciSession sess);
✓   GciSession GciTsLogin(...);
✓   BoolType   GciTsLogout(GciSession sess, GciErrSType *err);
```

### Table 7.2 Functions for Handling Errors and Interrupts and for Debugging

```C
✓   BoolType   GciTsBreak(GciSession sess, BoolType hard, GciErrSType *err);
✓   int        GciTsCallInProgress(GciSession sess, GciErrSType *err);
✓   BoolType   GciTsClearStack(GciSession sess, OopType gsProcess, GciErrSType *err);
✓   OopType    GciTsContinueWith(GciSession sess, ...);
✓   int        GciTsGemTrace(GciSession sess, int enable, GciErrSType *err);
```

### Table 7.3 Functions for Managing Object Bitmaps

```C
✓   BoolType   GciTsReleaseObjs(GciSession sess, OopType *buf, int count, GciErrSType *err);
✓   BoolType   GciTsReleaseAllObjs(GciSession sess, GciErrSType *err);
✓   BoolType   GciTsSaveObjs(GciSession sess, OopType *buf, int count, GciErrSType *err);
```

### Table 7.4 Functions for Compiling and Executing Smalltalk Code in the Database

```C
✓   OopType    GciTsCompileMethod(GciSession sess, ...);
✓   BoolType   GciTsProtectMethods(GciSession sess, BoolType mode, GciErrSType *err);
✓   OopType    GciTsExecute(GciSession sess, ...);
✓   OopType    GciTsExecute_(GciSession sess, ...);
✓   ssize_t    GciTsExecuteFetchBytes(GciSession sess, ...);
✓   OopType    GciTsPerform(GciSession sess, ...);
✓   ssize_t    GciTsPerformFetchBytes(GciSession sess, ...);
```

### Table 7.5 Functions for Accessing Symbol Dictionaries

```C
✓   OopType    GciTsResolveSymbol(GciSession sess, ...);
✓   OopType    GciTsResolveSymbolObj(GciSession sess, ...);
```

### Table 7.6 Functions for creating and Initializing Objects

```C
✓   int        GciTsGetFreeOops(GciSession sess, OopType *buf, int numOopsRequested, GciErrSType *err);
✓   OopType    GciTsNewObj(GciSession sess, OopType aClass, GciErrSType *err);
✓   OopType    GciTsNewByteArray(GciSession sess, ...);
✓   OopType    GciTsNewString_(GciSession sess, ...);
✓   OopType    GciTsNewSymbol(GciSession sess, ...);
✓   OopType    GciTsNewUnicodeString_(GciSession sess, ...);
✓   OopType    GciTsNewUtf8String_(GciSession sess, ...);
✓   int64      GciTsFetchUnicode(GciSession sess, ...);
```

### Table 7.7 Functions for Converting Objects and Values

```C
✓   BoolType   GciTsOopIsSpecial(OopType oop);
✓   OopType    GciTsFetchSpecialClass(OopType oop);
✓   int        GciTsOopToChar(OopType oop);
✓   OopType    GciTsCharToOop(uint ch);
✓   OopType    GciTsDoubleToSmallDouble(double aFloat);
✓   OopType    GciI32ToOop(int arg);
✓   OopType    GciTsDoubleToOop(GciSession sess, double aDouble, GciErrSType *err);
✓   BoolType   GciTsOopToDouble(GciSession sess, OopType oop, ...);
✓   OopType    GciTsI64ToOop(GciSession sess, int64 arg, GciErrSType *err);
✓   BoolType   GciTsOopToI64(GciSession sess, OopType oop, int64 *result, GciErrSType *err);
```

### Table 7.8 Object Traversal and Path Functions

```C
    int        GciTsStoreTravDoTravRefs(GciSession sess, ...);
✓   int        GciTsFetchTraversal(GciSession sess, ...);
✓   BoolType   GciTsStoreTrav(GciSession sess, ...);
✓   int        GciTsMoreTraversal(GciSession sess, ...);
```

### Table 7.9 Structural Access Functions

```C
✓   int64      GciTsFetchBytes(GciSession sess, ...);
✓   int64      GciTsFetchChars(GciSession sess, ...);
✓   int64      GciTsFetchUtf8Bytes(GciSession sess, ...);
✓   BoolType   GciTsStoreBytes(GciSession sess, ...);
✓   int        GciTsFetchOops(GciSession sess, ...);
✓   BoolType   GciTsStoreOops(GciSession sess, ...);
✓   int        GciTsRemoveOopsFromNsc(GciSession sess, ...);
✓   int64      GciTsFetchObjInfo(GciSession sess, OopType objId, ...);
✓   int64      GciTsFetchSize(GciSession sess, OopType obj, GciErrSType *err);
✓   int64      GciTsFetchVaryingSize(GciSession sess, OopType obj, GciErrSType *err);
✓   OopType    GciTsFetchClass(GciSession sess, OopType obj, GciErrSType *err);
✓   int        GciTsIsKindOf(GciSession sess, ...);
✓   int        GciTsIsSubclassOf(GciSession sess, ...);
✓   int        GciTsIsKindOfClass(GciSession sess, ...);
✓   int        GciTsIsSubclassOfClass(GciSession sess, ...);
✓   BoolType   GciTsObjExists(GciSession sess, OopType obj);
```

### Table 7.10 Utility Functions

```C
✓   uint       GciTsVersion(char *buf, size_t bufSize);
    int        GciTsWaitForEvent(GciSession sess, int latencyMs, ...);
    BoolType   GciTsCancelWaitForEvent(GciSession sess, GciErrSType *err);
```

## Other Functions

### Fork

GciTs offers a variety of `Fork` functions that take a callback. But since `node-ffi` supports async library calls, we don't need to do it ourselves.

```C
    BoolType   GciTsForkLogin(...);
    BoolType   GciTsForkContinueWith(GciSession sess, ...);
    BoolType   GciTsForkExecute(GciSession sess, ...);
    BoolType   GciTsForkPerform(GciSession sess, ...);
    BoolType   GciTsForkStoreTravDoTravRefs(GciSession sess, ...);
```

### String

The following are deprecated in favor of the underscore version.

```C
    OopType    GciTsNewString(GciSession sess, ...);
    OopType    GciTsNewUnicodeString(GciSession sess, ...);
    OopType    GciTsNewUtf8String(GciSession sess, ...);
```

The following provide UTF-8 conversion that can be done in JavaScript.

```C
    BoolType   GciUtf8To8bit(const char* src, char *dest, ssize_t destSize);
    ssize_t    GciNextUtf8Character(const char* src, size_t len, uint *chOut);
```

### GCI Errors

The following do not seem to work.

```C
    BoolType   GciTsClassRemoveAllMethods(GciSession sess, ...);
    int64      GciTsFetchUtf8(GciSession sess, ...);
```
