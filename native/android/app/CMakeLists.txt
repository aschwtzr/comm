# For more information about using CMake with Android Studio, read the
# documentation: https://d.android.com/studio/projects/add-native-code.html
project(comm)

set (CMAKE_CXX_STANDARD 14)

# Sets the minimum version of CMake required to build the native library.

cmake_minimum_required(VERSION 3.4.1)

# Creates and names a library, sets it as either STATIC
# or SHARED, and provides the relative paths to its source code.
# You can define multiple libraries, and CMake builds them for you.
# Gradle automatically packages shared libraries with your APK.

set(PACKAGE_NAME "comm_jni_module")

find_package(fbjni
  NAMES fbjni fbjniLibrary
  REQUIRED CONFIG
)

# Allow for CMake build to run without invoking through gradle
file(STRINGS ${CMAKE_SOURCE_DIR}/../gradle.properties ConfigContents)
foreach(NameAndValue ${ConfigContents})
  # Strip leading spaces
  string(REGEX REPLACE "^[ ]+" "" NameAndValue ${NameAndValue})
  # Find variable name
  string(REGEX MATCH "^[^=]+" Name ${NameAndValue})
  # Find the value
  string(REPLACE "${Name}=" "" Value ${NameAndValue})
  # Set the variable
  set(${Name} "${Value}")
endforeach()

set(BUILD_TESTING OFF)
set(HAVE_SYMBOLIZE OFF)
set(WITH_GTEST OFF CACHE BOOL "Use googletest" FORCE)
set(WITH_GFLAGS OFF CACHE BOOL "Use gflags" FORCE)

# Protobuf
set(protobuf_BUILD_TESTS OFF)

# gRPC building parameters
set(gRPC_BUILD_CSHARP_EXT OFF)
set(gRPC_SSL_PROVIDER "package" CACHE STRING "SSL library provider")
# Disable unused plugins
set(gRPC_BUILD_GRPC_PHP_PLUGIN OFF)
set(gRPC_BUILD_GRPC_RUBY_PLUGIN OFF)
set(gRPC_BUILD_GRPC_PYTHON_PLUGIN OFF)
set(gRPC_BUILD_GRPC_CSHARP_PLUGIN OFF)
# We're updating parameters below for Cmake's find_OpenSSL() function
set(OPENSSL_ROOT_DIR "${CMAKE_CURRENT_SOURCE_DIR}/build/third-party-ndk/openssl/openssl-${OPENSSL_VERSION}/build/${CMAKE_ANDROID_ARCH_ABI}")
list(APPEND CMAKE_FIND_ROOT_PATH "${OPENSSL_ROOT_DIR}")

add_subdirectory(${CMAKE_SOURCE_DIR}/build/third-party-ndk/grpc/grpc-${GRPC_VERSION}/ ${CMAKE_CURRENT_BINARY_DIR}/grpc/ EXCLUDE_FROM_ALL)
add_subdirectory(${CMAKE_SOURCE_DIR}/build/third-party-ndk/glog/glog-${GLOG_VERSION}/)
add_subdirectory(../../node_modules/olm ./build)

# Common Comm Cpp projects
add_subdirectory(
  ${CMAKE_CURRENT_SOURCE_DIR}/../../../native/cpp
  ${CMAKE_CURRENT_BINARY_DIR}/cpp
)

include_directories(
  ../../node_modules/react-native/React
  ../../node_modules/react-native/React/Base
  ../../node_modules/react-native/ReactCommon
  ../../node_modules/react-native/ReactCommon/jsi
  ../../node_modules/react-native/ReactCommon/callinvoker
  ../../node_modules/react-native/ReactAndroid/src/main/java/com/facebook/react/turbomodule/core/jni/ReactCommon

  # OpenSSL
  ./build/third-party-ndk/openssl/openssl-${OPENSSL_VERSION}/build/${CMAKE_ANDROID_ARCH_ABI}/include

  # SQLCipher amalgamation
  ../../node_modules/@commapp/sqlcipher-amalgamation/src

  # symlinked React Native headers
  ../headers

  # external libs
  ./build/third-party-ndk/folly
  ./build/third-party-ndk/boost/boost
  ./build/third-party-ndk/double-conversion

  # comm android specific code
  ./src/cpp

  # Android ndk headers
  ${ANDROID_NDK_HOME}/toolchains/llvm/prebuilt/linux-x86_64/sysroot/usr/include/
)

# search for all cpp files in this directory
file(GLOB SQLCIPHER "../../node_modules/@commapp/sqlcipher-amalgamation/src/*.c")
file(GLOB ANDROID_NATIVE_CODE "./src/cpp/*.cpp")
file(GLOB DOUBLE_CONVERSION_SOURCES "./build/third-party-ndk/double-conversion/double-conversion/*.cc")

add_library(
  # Sets the name of the library.
  ${PACKAGE_NAME}

  # Sets the library as a shared library.
  SHARED

  # Provides a relative path to your source file(s).
  ../../node_modules/react-native/ReactCommon/jsi/jsi/jsi.cpp
  ../../node_modules/react-native/ReactAndroid/src/main/java/com/facebook/react/turbomodule/core/jni/ReactCommon/CallInvokerHolder.cpp
  ../../node_modules/react-native/ReactCommon/react/nativemodule/core/ReactCommon/TurboModule.cpp
  ../../node_modules/react-native/ReactCommon/react/nativemodule/core/ReactCommon/LongLivedObject.cpp
  ../../node_modules/react-native/ReactCommon/react/nativemodule/core/ReactCommon/TurboModuleUtils.cpp

  # SQLCipher
  ${SQLCIPHER}

  # folly
  ./build/third-party-ndk/folly/folly/detail/Futex.cpp
  ./build/third-party-ndk/folly/folly/synchronization/ParkingLot.cpp
  ./build/third-party-ndk/folly/folly/lang/SafeAssert.cpp
  ./build/third-party-ndk/folly/folly/FileUtil.cpp
  ./build/third-party-ndk/folly/folly/Subprocess.cpp
  ./build/third-party-ndk/folly/folly/File.cpp
  ./build/third-party-ndk/folly/folly/Format.cpp
  ./build/third-party-ndk/folly/folly/Conv.cpp
  ./build/third-party-ndk/folly/folly/io/IOBuf.cpp
  ./build/third-party-ndk/folly/folly/memory/detail/MallocImpl.cpp
  ./build/third-party-ndk/folly/folly/ScopeGuard.cpp
  ./build/third-party-ndk/folly/folly/hash/SpookyHashV2.cpp
  ./build/third-party-ndk/folly/folly/io/IOBufQueue.cpp
  ./build/third-party-ndk/folly/folly/lang/Assume.cpp
  ./build/third-party-ndk/folly/folly/String.cpp
  ./build/third-party-ndk/folly/folly/portability/SysUio.cpp
  ./build/third-party-ndk/folly/folly/net/NetOps.cpp
  ./build/third-party-ndk/folly/folly/dynamic.cpp
  ./build/third-party-ndk/folly/folly/json.cpp
  ./build/third-party-ndk/folly/folly/json_pointer.cpp
  ./build/third-party-ndk/folly/folly/Unicode.cpp

  # double-conversion
  ${DOUBLE_CONVERSION_SOURCES}

  # comm code
  ${ANDROID_NATIVE_CODE}
)

add_definitions(
  ## Folly
  -DFOLLY_NO_CONFIG=1
  -DFOLLY_HAVE_CLOCK_GETTIME=1
  -DFOLLY_HAVE_MEMRCHR=1
  -DFOLLY_MOBILE=1

  ## SQLCipher
  -DSQLITE_THREADSAFE=0
  -DSQLITE_HAS_CODEC
  -DSQLITE_TEMP_STORE=2
  -DSQLCIPHER_CRYPTO_OPENSSL
)

find_library(log-lib log)

if (CMAKE_CXX_COMPILER_ID STREQUAL "Clang")
  # Clang and GCC differ on how they expose the std namespace
  # Only define this, if using clang
  add_definitions(
    -DFOLLY_USE_LIBCPP=1
  )
endif()

add_library(
    # OpenSSL Crypto lib
    openssl-crypto
    STATIC
    IMPORTED
)
set_target_properties(
    # OpenSSL Crypto lib
    openssl-crypto
    PROPERTIES IMPORTED_LOCATION "${CMAKE_CURRENT_SOURCE_DIR}/build/third-party-ndk/openssl/openssl-${OPENSSL_VERSION}/build/${CMAKE_ANDROID_ARCH_ABI}/lib/libcrypto.a"
)
add_library(
    # OpenSSL SSL lib
    openssl-ssl
    STATIC
    IMPORTED
)
set_target_properties(
    # OpenSSL SSL lib
    openssl-ssl
    PROPERTIES IMPORTED_LOCATION "${CMAKE_CURRENT_SOURCE_DIR}/build/third-party-ndk/openssl/openssl-${OPENSSL_VERSION}/build/${CMAKE_ANDROID_ARCH_ABI}/lib/libssl.a"
)

target_link_libraries(
  ${PACKAGE_NAME}
  fbjni::fbjni
  android
  ${log-lib}
  glog::glog
  olm
  openssl-crypto
  openssl-ssl
  grpc++
  libprotobuf

  # Comm
  comm-modules-native
  comm-databasemanagers
  comm-tools
  comm-grpc
  comm-backup
  comm-blob
  comm-tunnelbroker
  comm-sqlite-orm
)

# add a dummy library which is required by CallInvokerHolderImpl.java
add_library(
  turbomodulejsijni
  # Sets the library as a shared library.
  SHARED
  # Provides a relative path to your source file(s).
  ./src/cpp/dummy.cpp
)
