{ lib
, stdenv
, fetchFromGitHub
, cmake
, openjdk
, gtest
}:

stdenv.mkDerivation rec {
  pname = "fbjni";
  version = "0.3.0";

  src = fetchFromGitHub {
    owner = "facebookincubator";
    repo = pname;
    rev = "v${version}";
    sha256 = "132s9c8vlx1r4zcjjsgii9n3f2fx5qxgj3yvg6hw0dzg61x07bpg";
  };

  nativeBuildInputs = [
    cmake
    openjdk
  ];

  buildInputs = [
    gtest
  ];

  cmakeFlags = [
    "-DJAVA_HOME=${openjdk.passthru.home}"
  ];

  # They install the target export in the wrong directory
  postInstall = ''
    mv $out/share/cmake $out/lib/cmake
  '';

  meta = with lib; {
    description = "A library designed to simplify the usage of the Java Native Interface";
    homepage = "https://github.com/facebookincubator/fbjni";
    license = licenses.asl20;
  };
}
