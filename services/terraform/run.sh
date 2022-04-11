#!/bin/bash

set -e

terraform init

terraform apply -auto-approve -var="HOST=http://localhost:4566"
