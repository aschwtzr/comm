{ mkShell
, stdenv
, lib
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
, grpc
, libiconv
, libuv
, nodejs-16_x
, olm
, openssl
, pkg-config
, protobuf_3_15_cmake
, python2
, python3
, sqlite
, watchman
, rustfmt
, yarn
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
  ] ++ lib.optionals stdenv.isDarwin (with darwin.apple_sdk.frameworks; [
    CoreFoundation
    CoreServices
    Security
    libiconv  # identity service
  ]);

  # shell commands to be ran upon entering shell
  shellHook = ''
    if [[ "$OSTYPE" == 'linux'* ]]; then
      export MYSQL_UNIX_PORT=''${XDG_RUNTIME_DIR:-/run/user/$UID}/mysql-socket/mysql.sock
    fi

    echo "Welcome to Comm dev environment! :)"
  '';
}
