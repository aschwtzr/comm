#!/usr/bin/env bash

set -e

# folly hack - https://github.com/facebook/folly/pull/1231
sed -i 's/#if __has_include(<demangle.h>)/#if __has_include(<Demangle.h>)/g' /usr/lib/folly/folly/detail/Demangle.h

rm -rf cmake/build
mkdir -p cmake/build

scripts/build_sources.sh
