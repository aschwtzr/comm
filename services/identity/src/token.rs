use chrono::{DateTime, Utc};
use rand::{
  distributions::{Alphanumeric, DistString},
  CryptoRng, Rng,
};

pub enum AuthType {
  Password,
  Wallet,
}

pub struct AccessToken {
  pub token: Option<String>,
  pub created: Option<DateTime<Utc>>,
  pub auth_type: Option<AuthType>,
  pub valid: Option<bool>,
}

impl AccessToken {
  pub fn new(auth_type: AuthType, rng: &mut (impl Rng + CryptoRng)) -> Self {
    AccessToken {
      token: Some(Alphanumeric.sample_string(rng, 512)),
      created: Some(Utc::now()),
      auth_type: Some(auth_type),
      valid: Some(true),
    }
  }
}
