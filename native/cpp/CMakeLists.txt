project(comm-cpp)

cmake_minimum_required(VERSION 3.10)

# cmake 3.13+ defaults this to new, for android
# build which uses 3.10, this needs to be set
# explicitly
# cmake_policy(SET CMP0079 NEW)

add_subdirectory(CommonCpp)
add_subdirectory(lib/sqlite_orm)

target_link_libraries(comm-databasemanagers
  comm-tools
  comm-sqlite-orm
  )

