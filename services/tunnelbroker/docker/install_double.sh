#!/usr/bin/env bash
set -e

cd /tmp

git clone --recurse-submodules -b v3.2.0 \
  --single-branch https://github.com/google/double-conversion.git
pushd double-conversion
mkdir build
cd build
cmake .. -DBUILD_TESTING=OFF
make
make install

popd # double-conversion
rm -rf double-conversion
