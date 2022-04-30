{ mkShell
, stdenv
, lib
, arcanist
, cargo
, cmake
, darwin
, flow
, grpc
, nodejs-16_x
, protobuf_3_15_cmake
, python2
, python3
, sqlite
, watchman
, yarn
}:

mkShell rec {

  # programs which are meant to be executed should go here
  nativeBuildInputs = [
    # generic development
    arcanist

    # node development
    flow
    nodejs-16_x
    sqlite
    yarn
    watchman # react native
    python2
    python3

    # native dependencies
    # C/CXX toolchains are already brought in with mkShell
    cargo # includes rustc
    cmake
    protobuf_3_15_cmake
    grpc

  ];

  # include any libraries buildInputs
  buildInputs = [
    protobuf_3_15_cmake # exposes both a library and a command, thus should appear in both inputs
    sqlite
  ] ++ lib.optionals stdenv.isDarwin (with darwin.apple_sdk.frameworks; [
    CoreFoundation
    CoreServices
    Security
  ]);

  # shell commands to be ran upon entering shell
  shellHook = ''
    if [[ "$OSTYPE" == 'linux'* ]]; then
      export MYSQL_UNIX_PORT=''${XDG_RUNTIME_DIR:-/run/user/$UID}/mysql-socket/mysql.sock
    fi

    echo "Welcome to Comm dev environment! :)"
  '';
}
