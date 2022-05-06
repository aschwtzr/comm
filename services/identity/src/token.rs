use chrono::{DateTime, Utc};

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
