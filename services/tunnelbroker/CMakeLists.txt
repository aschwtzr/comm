PROJECT(tunnelbroker-service C CXX)

cmake_minimum_required(VERSION 3.16)

set(CMAKE_RUNTIME_OUTPUT_DIRECTORY bin)

if(COMMAND cmake_policy)
  cmake_policy(SET CMP0003 NEW)
endif(COMMAND cmake_policy)

set(CMAKE_CXX_STANDARD 17)

find_package(PkgConfig REQUIRED)

find_package(double-conversion REQUIRED)
find_package(Folly REQUIRED)
find_package(protobuf CONFIG REQUIRED)
find_package(gRPC REQUIRED)

# Find AMQP-CPP installation
find_package(amqpcpp CONFIG REQUIRED)

# Find Cryptopp installation
pkg_check_modules(CRYPTOPP REQUIRED libcryptopp=8.6)

# Find Libuv installation
pkg_check_modules(LIBUV REQUIRED libuv>=1.43)

if(${CMAKE_CURRENT_SOURCE_DIR} STREQUAL "/transferred")
  # Inside the docker build contex
  set(proto-path "grpc")
else()
  # Inside repo
  set(proto-path "../../native/cpp/")
endif()

# Shared Comm protos
add_subdirectory(${CMAKE_CURRENT_SOURCE_DIR}/${proto-path}
  ${CMAKE_CURRENT_BINARY_DIR}/protos
  EXCLUDE_FROM_ALL
)

# Ideally, we should be able to re-use this project, but transitive
# linking with aws-sdk seems to be problematic
# add_subdirectory(${CMAKE_CURRENT_SOURCE_DIR}/../lib/src ${CMAKE_CURRENT_BINARY_DIR}/services-common)

set(BUILD_TESTING OFF CACHE BOOL "Turn off tests" FORCE)
set(WITH_GFLAGS OFF CACHE BOOL "Turn off gflags" FORCE)

find_package(AWSSDK REQUIRED COMPONENTS core dynamodb)
find_package(Boost 1.40 COMPONENTS program_options thread system REQUIRED)
find_package(OpenSSL REQUIRED)
find_package(Corrosion REQUIRED)

find_package(glog)

file(GLOB_RECURSE SOURCE_CODE "${CMAKE_CURRENT_SOURCE_DIR}/src/*.cpp")
file(GLOB COMMON_CODE "${CMAKE_CURRENT_SOURCE_DIR}/../lib/src/*.cpp")

set(INCLUDE_DIRS
  ${CMAKE_CURRENT_SOURCE_DIR}/src
  ${CMAKE_CURRENT_SOURCE_DIR}/src/Database
  ${CMAKE_CURRENT_SOURCE_DIR}/src/DeliveryBroker
  ${CMAKE_CURRENT_SOURCE_DIR}/src/Service
  ${CMAKE_CURRENT_SOURCE_DIR}/src/Tools
  ${CMAKE_CURRENT_SOURCE_DIR}/src/Amqp


  # Ideally, we would add comm-services-common as a
  # target link library, however, aws-sdk seems to not be able
  # to be linked transitively
  ${CMAKE_CURRENT_SOURCE_DIR}/../lib/src

  ${Boost_INCLUDE_DIR}
  ${CRYPTOPP_INCLUDE_DIRS}
  ${LIBUV_INCLUDE_DIRS}
)

set(
  SOURCE_CODE

  ${DOUBLE_CONVERSION_SOURCES}
  ${GENERATED_CODE}
  ${SOURCE_CODE}
  ${COMMON_CODE}
)

set(
  LIBS

  gRPC::grpc++_reflection
  gRPC::grpc++
  ${AWSSDK_LINK_LIBRARIES}
  ${CRYPTOPP_LIBRARIES}
  ${LIBUV_LIBRARIES}
  ${Boost_LIBRARIES}
  amqpcpp
  OpenSSL::SSL
  glog::glog
  double-conversion::double-conversion
  Folly::folly

  comm-tunnelbroker-grpc
  #comm-services-common
)

#SERVER
add_executable(
  tunnelbroker-service

  ${FOLLY_SOURCES}
  ${GENERATED_CODE}
  ${SOURCE_CODE}
)

target_link_libraries(
  tunnelbroker-service

  ${LIBS}
)

target_include_directories(
  tunnelbroker-service
  PUBLIC
  ${INCLUDE_DIRS}
)

install(
  TARGETS tunnelbroker-service
  RUNTIME DESTINATION bin/
)

# TEST
if ($ENV{COMM_TEST_SERVICES} MATCHES 1)
  file(GLOB TEST_CODE "./test/*.cpp")
  list(FILTER SOURCE_CODE EXCLUDE REGEX "./src/server.cpp")
  enable_testing()

  find_package(GTest REQUIRED)
  include_directories(${GTEST_INCLUDE_DIR})

  add_executable(
    runTests

    ${FOLLY_SOURCES}
    ${SOURCE_CODE}
    ${TEST_CODE}
  )
  target_link_libraries(
    runTests

    ${LIBS}
    gtest
    gtest_main
  )

  target_include_directories(
    runTests
    PUBLIC
    ${INCLUDE_DIRS}
  )

  add_test(
    NAME runTests
    COMMAND runTests
  )
endif()
