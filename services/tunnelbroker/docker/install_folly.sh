#!/usr/bin/env bash
set -e

cd /tmp

git clone --recurse-submodules -b v2022.07.11.00 \
  --single-branch https://github.com/facebook/folly.git
pushd folly
mkdir _build
cd _build
cmake ..
make
make install

popd # folly
rm -rf folly
