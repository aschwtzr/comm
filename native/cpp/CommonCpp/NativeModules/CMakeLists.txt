project(comm-modules)
cmake_minimum_required(VERSION 3.4)

include(GNUInstallDirs)

# TODO: Remove once we can link between CommonCpp projects
find_package(gRPC REQUIRED)
find_package(Olm REQUIRED)
find_package(Folly REQUIRED)

set(INTERNAL_HDRS
  "InternalModules/GlobalNetworkSingleton.h"
  "InternalModules/GlobalNetworkSingletonJNIHelper.h"
  "InternalModules/NetworkModule.h"
  "InternalModules/SocketStatus.h"
)

set(INTERNAL_SRCS
  "InternalModules/GlobalNetworkSingleton.cpp"
  "InternalModules/NetworkModule.cpp"
)

add_library(comm-modules-internal
  ${INTERNAL_HDRS}
  ${INTERNAL_SRCS}
)

target_include_directories(comm-modules-internal
  PUBLIC
  $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}>
  $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/../Tools>
  $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/../DatabaseManagers>
  $<INSTALL_INTERFACE:${CMAKE_INSTALL_INCLUDEDIR}>
)

target_link_libraries(comm-modules-internal
  Folly::folly
  gRPC::grpc++
)

set(NATIVE_HDRS
  "CommCoreModule.h"
  "MessageStoreOperations.h"
  "ThreadStoreOperations.h"
)

set(NATIVE_SRCS
  "CommCoreModule.cpp"
)

add_library(comm-modules-native
  ${NATIVE_HDRS}
  ${NATIVE_SRCS}
)

set_target_properties(comm-modules-native PROPERTIES LINKER_LANGUAGE CXX)

# reference local directory when building, use installation path when installing
target_include_directories(comm-modules-native
  PUBLIC
  $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}>
  $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/../Tools>
  $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/../grpc>
  $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/../DatabaseManagers>
  $<INSTALL_INTERFACE:${CMAKE_INSTALL_INCLUDEDIR}>
  # HACK
  PRIVATE
  "../../../../node_modules/react-native/ReactCommon/jsi"
  "../../../../node_modules/react-native/ReactCommon/react/nativemodule/core"
  "../../../../node_modules/react-native/ReactCommon/callinvoker"
)

target_link_libraries(comm-modules-native
  Olm::Olm
  Folly::folly
  gRPC::grpc++
)

set(_message_path ./PersistentStorageUtilities/MessageOperationsUtilities)
set(MESSAGE_HDRS
  ${_message_path}/MessageOperationsUtilities.h
  ${_message_path}/MessageSpecs.h
)

set(MESSAGE_SRCS
  ${_message_path}/MessageOperationsUtilities.cpp
)

file(GLOB MESSAGE_SPEC_HDRS
  ${_message_path}/MessageSpecs/*.h
)

file(GLOB THREAD_OP_HDRS
  ./PersistentStorageUtilities/ThreadOperationsUtilities/*.h
)
set(THREAD_OP_SRCS
  ./PersistentStorageUtilities/ThreadOperationsUtilities/ThreadOperations.cpp
)

add_library(comm-modules-persistentstorage
  ${MESSAGE_HDRS}
  ${MESSAGE_SRCS}
  ${MESSAGE_SPEC_HDRS}
  ${THREAD_OP_HDRS}
  ${THREAD_OP_SRCS}
)

# reference local directory when building, use installation path when installing
target_include_directories(comm-modules-persistentstorage
  PUBLIC
  $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}>
  $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/../Tools>
  $<INSTALL_INTERFACE:${CMAKE_INSTALL_INCLUDEDIR}>
  PRIVATE
  # HACK
  "../../../node_modules/react-native/ReactCommon/jsi"
)

target_link_libraries(comm-modules-persistentstorage
  Olm::Olm
  Folly::folly
)

set(_components internal native persistentstorage)
foreach(component ${_components})

  install(TARGETS comm-modules-${component} EXPORT comm-modules-export
    RUNTIME DESTINATION ${CMAKE_INSTALL_BINDIR} COMPONENT comm-modules
    LIBRARY DESTINATION ${CMAKE_INSTALL_LIBDIR} COMPONENT comm-modules
    ARCHIVE DESTINATION ${CMAKE_INSTALL_LIBDIR} COMPONENT comm-modules
  )

endforeach()

install(FILES ${INTERNAL_HDRS} DESTINATION include/InternalModules)
install(FILES ${NATIVE_HDRS} DESTINATION include/NativeModules)
install(FILES ${MESSAGE_HDRS} DESTINATION include/PersistentStorageUtilities)
install(FILES ${MESSAGE_SPEC_HDRS}
  DESTINATION include/PersistentStorageUtilities/MessageSpecs
)
install(FILES ${THREAD_OP_HDRS} DESTINATION include/ThreadOperationsUtilities)

export(TARGETS comm-modules-internal comm-modules-native
  NAMESPACE comm-modules::
  FILE ${CMAKE_CURRENT_BINARY_DIR}/cmake/comm-modules/comm-modules-targets.cmake
)

# For installation
install(EXPORT comm-modules-export
  FILE comm-modules-targets.cmake
  DESTINATION ${CMAKE_INSTALL_LIBDIR}/cmake/comm-modules
  NAMESPACE comm-modules::
)
