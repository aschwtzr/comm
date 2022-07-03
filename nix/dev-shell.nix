{ mkShell
, stdenv
, lib
, androidDevEnv
, amqp-cpp
, arcanist
, boost
, cargo
, cmake
, cryptopp
, darwin
, fbjni
, folly
, fmt
, glog
, grpc
, libiconv
, libuv
, nodejs-16_x
, olm
, openjdk8
, openssl
, pkg-config
, protobuf_3_15_cmake
, python2
, python3
, sqlite
, watchman
, rustfmt
, yarn
, zlib
}:

mkShell {

  # programs which are meant to be executed should go here
  nativeBuildInputs = [
    # generic development
    arcanist

    # node development
    nodejs-16_x
    yarn
    watchman # react native
    python2
    python3

    # native dependencies
    # C/CXX toolchains are already brought in with mkShell
    # Identity Service
    cargo # includes rustc
    rustfmt

    # Tunnelbroker + CMake
    amqp-cpp
    cryptopp
    cmake
    libuv
    pkg-config
    protobuf_3_15_cmake
    grpc

  ];

  # include any libraries buildInputs
  buildInputs = [
    fbjni # android builds
    protobuf_3_15_cmake # exposes both a library and a command, thus should appear in both inputs
    folly # cpp tools
    fmt # needed for folly
    boost # needed for folly
    olm # needed for CryptoTools
    sqlite # needed for sqlite_orm
    openssl # needed for grpc
  ] ++ lib.optionals stdenv.isx86_64 [
    # aarch64-darwin tarballs are not available
    androidDevEnv.androidsdk
    glog # android
  ] ++ lib.optionals stdenv.isDarwin (with darwin.apple_sdk.frameworks; [
    CoreFoundation
    CoreServices
    Security
    libiconv  # identity service
  ]);

  # Used by gradle
  JAVA_HOME = openjdk8.passthru.home;

  # shell commands to be ran upon entering shell
  shellHook = ''
    if [[ "$OSTYPE" == 'linux'* ]]; then
      export MYSQL_UNIX_PORT=''${XDG_RUNTIME_DIR:-/run/user/$UID}/mysql-socket/mysql.sock
      export ANDROID_SDK_ROOT=''${ANDROID_SDK_ROOT:-$HOME/Android/Sdk}
    fi

    if [ -f /etc/NIXOS ]; then
      # allow for impurely downloaded android ndk tools to be used on NixOS
      export LD_LIBRARY_PATH=${lib.makeLibraryPath [ stdenv.cc.cc.lib zlib ]}
    fi

    echo "Welcome to Comm dev environment! :)"
  '';
}
