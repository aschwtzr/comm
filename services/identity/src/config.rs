use curve25519_dalek::ristretto::RistrettoPoint;
use opaque_ke::{errors::PakeError, keypair::KeyPair};
use std::{env, fs, io, path::Path};

#[derive(Debug, Clone)]
pub struct Config {
  pub server_keypair: KeyPair<RistrettoPoint>,
}

impl Config {
  pub fn load() -> Result<Self, Error> {
    let mut path = env::current_dir()?;
    path.push("secrets");
    path.push("secret_key");
    path.set_extension("txt");
    let keypair = get_keypair_from_file(path)?;
    Ok(Self {
      server_keypair: keypair,
    })
  }
}

#[derive(
  Debug, derive_more::Display, derive_more::From, derive_more::Error,
)]
pub enum Error {
  #[display(...)]
  Pake(PakeError),
  #[display(...)]
  IO(io::Error),
}

fn get_keypair_from_file<P: AsRef<Path>>(
  path: P,
) -> Result<KeyPair<RistrettoPoint>, Error> {
  let bytes = fs::read(path)?;
  KeyPair::from_private_key_slice(&bytes)
    .map_err(|e| Error::Pake(PakeError::CryptoError(e)))
}
