# The cmake version of this build is meant to enable both cmake and .pc being exported
# this is important because grpc exports a .cmake file which also expects for protobuf
# to have been exported through cmake as well.
{ lib, stdenv
, buildPackages
, cmake
, fetchFromGitHub
, fetchpatch
, gtest
, zlib
}:

let
  mkProtobufDerivation = buildProtobuf: stdenv: stdenv.mkDerivation rec {
    pname = "protobuf";
    version = "3.20.0";

    src = fetchFromGitHub {
      owner = "protocolbuffers";
      repo = "protobuf";
      rev = "v${version}";
      sha256 = "sha256-dTUJ2wSyK3AHirfYzNbugRU92Ayay8cUdFowBm5D2WI=";
    };

    # re-create git submodules
    postPatch = ''
      rm -rf gmock
      cp -r ${gtest.src}/googlemock third_party/gmock
      cp -r ${gtest.src}/googletest third_party/

      chmod -R a+w third_party/
      ln -s ../googletest third_party/gmock/gtest
      ln -s ../gmock third_party/googletest/googlemock
      ln -s $(pwd)/third_party/googletest third_party/googletest/googletest
    '' + lib.optionalString stdenv.isDarwin ''
      substituteInPlace src/google/protobuf/testing/googletest.cc \
      --replace 'tmpnam(b)' '"'$TMPDIR'/foo"'
    '';

    patches = [
      # This is an adjusted patch for https://github.com/protocolbuffers/protobuf/pull/9822
      ./cmake-install-path.patch
    ];

    nativeBuildInputs = [
      cmake
      # buildPackages ensure that the package is compatible by the machine building it
      buildPackages.which
      buildPackages.stdenv.cc
      buildProtobuf
    ];

    buildInputs = [
      zlib
    ];

    # after 3.20, CMakeLists.txt can now be found at the top-level, however
    # a stub cmake/CMakeLists.txt still exists for compatibility with previous build assumptions
    cmakeDir = "../cmake";
    cmakeFlags = lib.optionals (!stdenv.targetPlatform.isStatic) [
      "-Dprotobuf_BUILD_SHARED_LIBS=ON"
    ];

    enableParallelBuilding = true;

    # unfortunately the shared libraries have yet to been patched by nix, thus tests will fail
    doCheck = false;

    meta = {
      description = "Google's data interchange format";
      longDescription = ''
        Protocol Buffers are a way of encoding structured data in an efficient
        yet extensible format. Google uses Protocol Buffers for almost all of
        its internal RPC protocols and file formats.
      '';
      license = lib.licenses.bsd3;
      platforms = lib.platforms.unix;
      homepage = "https://developers.google.com/protocol-buffers/";
    };
  };
in
  # this is meant to handle cross compilation logic
  mkProtobufDerivation(if (stdenv.buildPlatform != stdenv.hostPlatform)
    then (mkProtobufDerivation null buildPackages.stdenv)
    else null) stdenv
