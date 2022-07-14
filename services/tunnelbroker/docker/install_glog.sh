#!/usr/bin/env bash
set -e

cd /tmp

git clone --recurse-submodules -b v0.6.0 \
  --single-branch https://github.com/google/glog.git
pushd glog
mkdir build
cd build
cmake .. -DBUILD_TESTING=OFF
make
make install

popd # double-conversion
rm -rf double-conversion
