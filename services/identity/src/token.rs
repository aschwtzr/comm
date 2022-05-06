use chrono::{DateTime, Utc};

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
