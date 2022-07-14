#!/usr/bin/env bash

set -e

pushd /usr/lib
git clone https://github.com/google/glog.git --branch v0.4.0 --single-branch

pushd glog
cmake .
make install
pushd

popd # /usr/lib
