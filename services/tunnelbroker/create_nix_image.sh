#!/usr/bin/env bash

set -euo pipefail

# Ugly, but should work on bsd and gnu
SCRIPT_DIR=$(cd "$(dirname "$0")"; pwd -P)
BUILD_DIR="$SCRIPT_DIR"/build

pushd "$SCRIPT_DIR"/../../

docker build . -f "$SCRIPT_DIR"/nix.Dockerfile -t commapp/nix-tunnelbroker

popd

