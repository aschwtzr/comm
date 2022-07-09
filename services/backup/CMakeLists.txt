PROJECT(backup C CXX)

cmake_minimum_required(VERSION 3.16)

set(CMAKE_RUNTIME_OUTPUT_DIRECTORY bin)

if(COMMAND cmake_policy)
  cmake_policy(SET CMP0003 NEW)
endif(COMMAND cmake_policy)

set(CMAKE_CXX_STANDARD 17)

set(BUILD_TESTING OFF CACHE BOOL "Turn off tests" FORCE)
set(WITH_GTEST "Use Google Test" OFF)

# FIND LIBS
find_package(glog REQUIRED)
find_package(gRPC REQUIRED)
find_package(Folly REQUIRED)
find_package(AWSSDK REQUIRED COMPONENTS core dynamodb)
find_package(Boost 1.40 COMPONENTS program_options REQUIRED)

# blob will bring in everything else
add_subdirectory(${CMAKE_CURRENT_SOURCE_DIR}/../blob
  ${CMAKE_CURRENT_BINARY_DIR}/blob
  EXCLUDE_FROM_ALL
)

# FIND FILES
file(GLOB_RECURSE SOURCE_CODE "./src/*.cpp")
file(GLOB COMMON_CODE "${CMAKE_CURRENT_SOURCE_DIR}/../lib/src/*.cpp")

include_directories(
  ${CMAKE_CURRENT_SOURCE_DIR}/src
  ${CMAKE_CURRENT_SOURCE_DIR}/src/client-base-reactors
  ${CMAKE_CURRENT_SOURCE_DIR}/src/server-base-reactors
  ${CMAKE_CURRENT_SOURCE_DIR}/src/grpc-client
  ${CMAKE_CURRENT_SOURCE_DIR}/src/DatabaseEntities
  ${CMAKE_CURRENT_SOURCE_DIR}/src/Reactors
  ${CMAKE_CURRENT_SOURCE_DIR}/src/Reactors/server
  ${CMAKE_CURRENT_SOURCE_DIR}/src/Reactors/server/base-reactors
  ${CMAKE_CURRENT_SOURCE_DIR}/src/Reactors/client
  ${CMAKE_CURRENT_SOURCE_DIR}/src/Reactors/client/blob
  ${CMAKE_CURRENT_SOURCE_DIR}/src/Reactors/client/base-reactors

  # Ideally, we would add comm-services-common as a
  # target link library, however, aws-sdk seems to not be able
  # to be linked transitively
  ${CMAKE_CURRENT_SOURCE_DIR}/../lib/src

  ${Boost_INCLUDE_DIR}
)

# SERVER
add_executable(
  backup

  ${GENERATED_CODE}
  ${DOUBLE_CONVERSION_SOURCES}
  ${FOLLY_SOURCES}

  ${SOURCE_CODE}
  ${COMMON_CODE}
)

set(
  LIBS

  ${GRPC_LIBS}
  ${AWSSDK_LINK_LIBRARIES}
  ${Boost_LIBRARIES}
  glog::glog
  Folly::folly
  gRPC::grpc++

  comm-blob-grpc
  comm-backup-grpc
  comm-client-base-reactors
  comm-server-base-reactors
)

target_link_libraries(
  backup

  ${LIBS}
)

install(
  TARGETS backup
  RUNTIME DESTINATION bin/
)

# TEST
if ($ENV{COMM_TEST_SERVICES} MATCHES 1)
  file(GLOB TEST_CODE "./test/*.cpp")
  list(FILTER SOURCE_CODE EXCLUDE REGEX "./src/server.cpp")
  enable_testing()

  find_package(GTest REQUIRED)
  include_directories(
    ${GTEST_INCLUDE_DIR}
    ./test
  )

  add_executable(
    runTests

    ${GENERATED_CODE}
    ${DOUBLE_CONVERSION_SOURCES}
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

  add_test(
    NAME runTests
    COMMAND runTests
  )
endif()
