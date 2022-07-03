{ lib
, stdenv
, fetchFromGitHub
, amqp-cpp
, aws-sdk-cpp
, cmake
, folly
, fmt
, pkg-config
, libuv
, cryptopp
, protobuf_3_15_cmake
, grpc
, glog
, boost17x
}:

stdenv.mkDerivation rec {
  pname = "tunnelbroker";
  version = "0.0.1";

  # needs access to native/cpp/CommonCpp/grpc
  # so we have to capture the top-level directory
  src = ../.;

  prePatch = ''
    cd services/tunnelbroker
  '';

  nativeBuildInputs = [
    cmake
    pkg-config
  ];

  buildInputs = [
    amqp-cpp
    aws-sdk-cpp
    boost17x
    libuv
    cryptopp
    protobuf_3_15_cmake
    folly
    fmt
    grpc
    glog
  ];

  # TODO: fix aws sdk installation assumptions, make assumption that include shares same prefix as lib
  cmakeFlags = [
    "-DAWSSDK_DEFAULT_ROOT_DIR="
    "-DAWSSDK_INSTALL_INCLUDEDIR=${lib.getDev aws-sdk-cpp}/include"
    "-DAWSSDK_CORE_HEADER_FILE=${lib.getDev aws-sdk-cpp}/include/aws/core/Aws.h"
  ];
}
