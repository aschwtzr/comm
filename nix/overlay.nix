# An overlay allows for a package set to be extended with new or modified packages

# `final` refers to the package set with all overlays applied.
# This allows for added or modified packages to be referenced with
# all relevant changes
final:

# `prev` refers to the previous package set before this current overlay is applied.
# This is cheaper for nix to evaluate, thus should be prefered over final when possible.
prev:

{
  # add packages meant for just this repository
  amqp-cpp = prev.callPackage ./amqp-cpp.nix { };

  androidDevEnv = prev.callPackage ./android-dev-env.nix { };

  protobuf_3_15_cmake = prev.callPackage ./protobuf_3_15.nix { };

  # The original c-ares just uses a Makefile build
  # so it doesn't export any cmake information.
  # This is likely to be not be changed upstreamed because
  # it's used to bootstrap curl, which is required to make cmake.
  c-ares-cmake = (prev.c-ares.overrideAttrs(_: {
    nativeBuildInputs = [ prev.cmake ];
  }));

  comm-grpc = final.callPackage ./comm-grpc.nix { };

  devShell = final.callPackage ./dev-shell.nix { };

  mysql-down = prev.callPackage ./mysql-down-linux.nix { };

  mysql-up = prev.callPackage ./mysql-up-linux.nix { };

  arcanist = prev.arcanist.override(_: {
    # php8.1 will cause warnings to throw as exceptions
    # around calling strlen() with null
    php = prev.php80;
  });

  olm = prev.olm.overrideAttrs(oldAttrs: {
    # *.hh files aren't meant to be used externally
    # so we patch installation to add it
    postInstall = ''
      cp \
        $NIX_BUILD_TOP/${oldAttrs.src.name}/include/olm/*.h* \
        ''${!outputDev}/include/olm
    '';
  });

  fbjni = prev.callPackage ./fbjni.nix { };

  # Android ecosystem expects to be to available at `$out/lib`
  openjdk8 = prev.openjdk8.overrideAttrs(_: {
    preFixup = ''
      ln -s $out/lib/openjdk/lib/* $out/lib
    '';
  });
}
