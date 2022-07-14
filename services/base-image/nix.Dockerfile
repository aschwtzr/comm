FROM nixos/nix

WORKDIR /comm

COPY flake.nix .
COPY flake.lock .
ADD nix/ ./nix

# Flakes require the repo to be tracked in git
RUN nix-shell -p git && \
  git init && \
  git add . && \
  nix build .#devShell --extra-experimental-features 'nix-command flakes' --show-trace
