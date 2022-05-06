use chrono::{DateTime, Utc};
use rand::{
  distributions::{DistString, Standard},
  rngs::OsRng,
};

pub enum AuthType {
  Password,
  Wallet,
}

pub struct Token {
  pub token: String,
  pub created: Option<DateTime<Utc>>,
  pub auth_type: Option<AuthType>,
  pub valid: Option<bool>,
}

impl Token {
  fn new(auth_type: AuthType) -> Self {
    let mut rng = OsRng;
    Token {
      token: Standard.sample_string(&mut rng, 512),
      created: Some(Utc::now()),
      auth_type: Some(auth_type),
      valid: Some(true),
    }
  }
}
