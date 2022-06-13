#!/usr/bin/env bash

set -e

source $HOME/.cargo/env 

PATHS="services/commtest services/identity"

cargo > /dev/null

for PATH in $PATHS; do
  echo "formatting $PATH..."
  pushd $PATH > /dev/null
  cargo fmt
  popd > /dev/null
done

echo "done formatting"
