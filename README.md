# GciForJavaScript
JavaScript FFI wrapper for GemStone C Interface (GCI)

[GemStone](https://gemtalksystems.com/products/gs64/) is an object database and Smalltalk application runtime environment. You interact with the database through a dynamically linked C library available for Linux, macOS, and Windows. To use a C library from JavaScript we use [ffi-napi](https://github.com/node-ffi-napi/node-ffi-napi), a foreign function library wrapper that, along with [ref](https://github.com/TooTallNate/ref), allows us to define C types, structures, and function entry points, then load and call a C library.

GemBuilder for C documentation ([HTML](https://downloads.gemtalksystems.com/docs/GemStone64/3.4.x/GS64-GemBuilderC-3.4/GS64-GemBuilderC-3.4.htm) or [PDF](https://downloads.gemtalksystems.com/docs/GemStone64/3.4.x/GS64-GemBuilderforC-3.4.pdf)) describes the API for the *single-threaded* GCI library. We are using a new *thread-safe* library that has fewer functions (but more features). It is not separately documented, but has a header file, `gcits.hf`, that is the definitive specification (a recent copy is included with this checkout).

The needed C libraries are not included as part of this checkout since there is a different set of libraries for each platform (Linux, macOS, and Windows), and for each GemStone version. You should download a recent version and the appropriate [product](https://gemtalksystems.com/products/gs64/) for your platform. Then move the appropriate files into this directory.

* Linux: libfloss-3.4.x-64.so and libgcits-3.4.x-64.so
* macOS: libfloss-3.4.x-64.dylib and libgcits-3.4.x-64.dylib
* Windows: libgcits-3.4.x-32.dll and libssl-3.4.x-32.dll

With the appropriate library, you should be able to run the code with the following:

```
npm install
node .
```

## Files

This checkout has only one code file, index.js. This is strictly a proof-of-concept, and the code should be broken down into a public API, a private API, and tests. (It would be nice to have help from someone who understands how Node.js files should be organized.)

## Contributing Code

To add new function wrappers follow these steps:

* Identify a new function from `gcits.hf` (pick from the list below);
* Add it to GciLibrary with the appropriate name, arguments, and return type;
* Add a wrapper function to GciSession to provide a JavaScript-like API; 
* Add a test to show that it works; and, finally,
* Submit a pull request!

For inspiration, see [GciForPython](https://github.com/jgfoster/GciForPython).

# Function List

The following provides a list of all the functions defined in `gcits.hf` grouped to roughly parallel the tables in the GemBuilder for C manual. Checked items have been completed. Numbered items are suggested next tasks (with priority).

### Table 7.1 Functions for Controlling Sessions and Transactions
```
✓	BoolType   GciTsAbort(GciSession sess, GciErrSType *err);
✓	BoolType   GciTsBegin(GciSession sess, GciErrSType *err);
✓	BoolType   GciTsCommit(GciSession sess, GciErrSType *err);
	char*      GciTsEncrypt(const char* password, char *outBuf, size_t outBuffSize);
✓	int        GciTsSessionIsRemote(GciSession sess);
✓	GciSession GciTsLogin(
	BoolType   GciTsForkLogin(
✓	BoolType   GciTsLogout(GciSession sess, GciErrSType *err);
```

### Table 7.2 Functions for Handling Errors and Interrupts and for Debugging
```
✓	BoolType   GciTsBreak(GciSession sess, BoolType hard, GciErrSType *err);
✓	int        GciTsCallInProgress(GciSession sess, GciErrSType *err);
	BoolType   GciTsClearStack(GciSession sess, OopType gsProcess, GciErrSType *err);
	OopType    GciTsContinueWith(GciSession sess,
	BoolType   GciTsForkContinueWith(GciSession sess,
	int        GciTsGemTrace(GciSession sess, int enable, GciErrSType *err);
```

### Table 7.3 Functions for Managing Object Bitmaps
```
	BoolType   GciTsReleaseObjs(GciSession sess, OopType *buf, int count, GciErrSType *err);
	BoolType   GciTsReleaseAllObjs(GciSession sess, GciErrSType *err);
	BoolType   GciTsSaveObjs(GciSession sess, OopType *buf, int count, GciErrSType *err);
```

### Table 7.4 Functions for Compiling and Executing Smalltalk Code in the Database
```
	OopType    GciTsCompileMethod(GciSession sess,
	BoolType   GciTsProtectMethods(GciSession sess, BoolType mode, GciErrSType *err);
	BoolType   GciTsClassRemoveAllMethods(GciSession sess, 
4	OopType    GciTsExecute(GciSession sess,
	BoolType   GciTsForkExecute(GciSession sess,
	OopType    GciTsExecute_(GciSession sess,
4	ssize_t    GciTsExecuteFetchBytes(GciSession sess,
4	OopType    GciTsPerform(GciSession sess,
	BoolType   GciTsForkPerform(GciSession sess,
4	ssize_t    GciTsPerformFetchBytes(GciSession sess,
```

### Table 7.5 Functions for Accessing Symbol Dictionaries
```
3	OopType    GciTsResolveSymbol(GciSession sess, 
	OopType    GciTsResolveSymbolObj(GciSession sess, 
```

### Table 7.6 Functions for creating and Initializing Objects
```
	int        GciTsGetFreeOops(GciSession sess, OopType *buf, int numOopsRequested, GciErrSType *err);
	OopType    GciTsNewObj(GciSession sess, OopType aClass, GciErrSType *err);
	OopType    GciTsNewByteArray(GciSession sess, 
	OopType    GciTsNewString_(GciSession sess, 
	OopType    GciTsNewString(GciSession sess, 
	OopType    GciTsNewSymbol(GciSession sess, 
	OopType    GciTsNewUnicodeString_(GciSession s,
	OopType    GciTsNewUnicodeString(GciSession sess, 
	OopType    GciTsNewUtf8String(GciSession sess, 
	OopType    GciTsNewUtf8String_(GciSession sess, 
	int64      GciTsFetchUnicode(GciSession sess,
	int64      GciTsFetchUtf8(GciSession sess,
```

### Table 7.7 Functions for Converting Objects and Values
```
✓	BoolType   GciTsOopIsSpecial(OopType oop);
3	OopType    GciTsFetchSpecialClass(OopType oop);
✓	int        GciTsOopToChar(OopType oop);
✓	OopType    GciTsCharToOop(uint ch);
✓	OopType    GciTsDoubleToSmallDouble(double aFloat);
	BoolType   GciUtf8To8bit(const char* src, char *dest, ssize_t destSize);
	ssize_t    GciNextUtf8Character(const char* src, size_t len, uint *chOut);
✓	OopType    GciI32ToOop(int arg);
	OopType    GciTsDoubleToOop(GciSession sess, double aDouble, GciErrSType *err);
	BoolType   GciTsOopToDouble(GciSession sess, OopType oop,
	OopType    GciTsI64ToOop(GciSession sess, int64 arg, GciErrSType *err);
	BoolType   GciTsOopToI64(GciSession sess, OopType oop, int64 *result, GciErrSType *err);
```

### Table 7.8 Object Traversal and Path Functions
```
	int        GciTsStoreTravDoTravRefs(GciSession sess,
	BoolType   GciTsForkStoreTravDoTravRefs(GciSession sess,
	int        GciTsFetchTraversal(GciSession sess, 
	BoolType   GciTsStoreTrav(GciSession sess, 
	int        GciTsMoreTraversal(GciSession sess,
```

### Table 7.9 Structural Access Functions
```
	int64      GciTsFetchBytes(GciSession sess,
	int64      GciTsFetchChars(GciSession sess,
	int64      GciTsFetchUtf8Bytes(GciSession sess,
	BoolType   GciTsStoreBytes(GciSession sess,
	int        GciTsFetchOops(GciSession sess,
	BoolType   GciTsStoreOops(GciSession sess,
	int        GciTsRemoveOopsFromNsc(GciSession sess, 
	int64      GciTsFetchObjInfo(GciSession sess, OopType objId, 
3	int64      GciTsFetchSize(GciSession sess, OopType obj, GciErrSType *err);
3	int64      GciTsFetchVaryingSize(GciSession sess, OopType obj, GciErrSType *err);
3	OopType    GciTsFetchClass(GciSession sess, OopType obj, GciErrSType *err);
3	int        GciTsIsKindOf(GciSession sess, 
3	int        GciTsIsSubclassOf(GciSession sess, 
3	int        GciTsIsKindOfClass(GciSession sess, 
	int        GciTsIsSubclassOfClass(GciSession sess, 
3	BoolType   GciTsObjExists(GciSession sess, OopType obj);
```

### Table 7.10 Utility Functions
```
✓	uint       GciTsVersion(char *buf, size_t bufSize);
	int        GciTsWaitForEvent(GciSession sess, int latencyMs,
	BoolType   GciTsCancelWaitForEvent(GciSession sess, GciErrSType *err);
```