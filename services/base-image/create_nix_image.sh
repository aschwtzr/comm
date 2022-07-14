#!/usr/bin/env bash

# Ugly, but should work on bsd and gnu
SCRIPT_DIR=$(cd "$(dirname "$0")"; pwd -P)
BUILD_DIR="$SCRIPT_DIR"/build

# create docker context
mkdir -p "$BUILD_DIR"

cp "$SCRIPT_DIR"/../../flake.* "$BUILD_DIR"
cp -r "$SCRIPT_DIR"/../../nix "$BUILD_DIR"

cp "$SCRIPT_DIR"/nix.Dockerfile "$BUILD_DIR"/Dockerfile

pushd "$BUILD_DIR"

docker build . -t commapp/nix-dev

popd

