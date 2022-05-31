FROM rust:1.57

ARG COMM_TEST_TARGET

ENV COMM_TEST_TARGET=${COMM_TEST_TARGET}

# Create a new user comm and use it to run subsequent commands
RUN useradd -m comm
USER comm

# The build.rs script depends on rustfmt
RUN rustup component add rustfmt

RUN mkdir -p /home/comm/app/commtest
WORKDIR /home/comm/app/commtest
RUN cargo init --bin

COPY services/commtest/Cargo.toml services/commtest/Cargo.lock ./

# Cache build dependencies in a new layer
RUN cargo build --release
RUN rm src/*.rs

COPY services/commtest .
COPY native/cpp/CommonCpp/grpc/protos/*.proto protos/

# Remove the previously-built binary so that only the application itself is
# rebuilt
RUN rm ./target/release/deps/commtest*

RUN cargo build --release

CMD target/release/commtest
