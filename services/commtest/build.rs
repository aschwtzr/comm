use std::env;

fn main() -> Result<(), Box<dyn std::error::Error>> {
  let target_service = env::var("COMM_TEST_TARGET")
    .map_err(|err| -> String { format!("invalid test target: {}", err) })?;
  // use this when using docker
  // tonic_build::compile_protos(format!("protos/{}.proto", target_service))?;
  tonic_build::compile_protos(format!(
    "../../native/cpp/CommonCpp/grpc/protos/{}.proto",
    target_service
  ))?;
  Ok(())
}
