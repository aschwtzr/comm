#!/usr/bin/env bash

set -e

if [[ "$#" -gt 1 ]]; then
  echo "usage: $0 [TAG]"
  exit 1
fi

TAG="1.1"
if [[ $(uname -m) == 'arm64' ]]; then
  TAG="$TAG.m1"
fi

tag=${1:-"$TAG"}
docker build -t commapp/services-base:"${tag}" base-image
