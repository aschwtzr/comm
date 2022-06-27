#!/usr/bin/env bash

set -e

if [ "$#" -lt 1 ] || [ "$#" -gt 2 ]; then
  echo "Illegal number of parameters, expected:"
  echo "- one argument with a name of the service, currently available services:"
  ./scripts/list_services.sh
  echo "- one optional argument with port"
  echo "- example: ./services/scripts/run_server_image.sh tunnelbroker 12345"
  exit 1;
fi

SERVICE=$1
if [ "$SERVICE" == "tunnelbroker" ]; then
  if [ ! -z "$2" ]; then
    export COMM_SERVICES_PORT_TUNNELBROKER=$2
  fi
elif [ "$SERVICE" == "backup" ]; then
  if [ ! -z "$2" ]; then
    export COMM_SERVICES_PORT_BACKUP=$2
  fi
elif [ "$SERVICE" == "blob" ]; then
  if [ ! -z "$2" ]; then
    export COMM_SERVICES_PORT_BLOB=$2
  fi
else
  echo "No such service ${SERVICE}, aborting"
  exit 1
fi

DOCKERFILE="commapp/services-base:1.1"
if [[ $(uname -m) == 'arm64' ]]; then
  DOCKERFILE="commapp/services-base:1.1.m1"
fi

export COMM_BASE_IMAGE=$DOCKERFILE

docker-compose build $SERVICE-server
docker-compose up $SERVICE-server
