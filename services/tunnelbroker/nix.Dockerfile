FROM commapp/nix-dev

ADD native/cpp ./native/cpp
ADD services ./services

RUN nix develop --extra-experimental-features 'nix-command flakes'
RUN cd services/tunnelbroker && \
  mkdir -p build && \
  cd build && \
  cmake .. && \
  make install
