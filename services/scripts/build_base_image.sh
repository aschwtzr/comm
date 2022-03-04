#!/bin/bash

set -e

if [ "$#" -gt 1 ]; then
		echo "usage: $0 [TAG]"
		exit 1
fi

tag=${1:-"1.0"}
docker build -t commapp/services-base:${tag} base-image
