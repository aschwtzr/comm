{ mkShell
, stdenv
, lib
, arcanist
, cargo
, cmake
, darwin
, grpc
, nodejs-16_x
, protobuf_3_15_cmake
, python2
, python3
, watchman
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
    cargo # includes rustc
    cmake
    protobuf_3_15_cmake
    grpc

  ];

  # include any libraries buildInputs
  buildInputs = [
    protobuf_3_15_cmake # exposes both a library and a command, thus should appear in both inputs
  ] ++ lib.optionals stdenv.isDarwin (with darwin.apple_sdk.frameworks; [
    CoreFoundation
    CoreServices
    Security
  ]);

  # shell commands to be ran upon entering shell
  shellHook = ''
    echo "Welcome to Comm dev environment! :)"
  '';
}
