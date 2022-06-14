use std::fs;

fn main() -> Result<(), std::io::Error> {
  const PROTO_FILES_PATH: &str = "../../native/cpp/CommonCpp/grpc/protos/";
  let proto_files = fs::read_dir(PROTO_FILES_PATH).unwrap();
  for path in proto_files {
    let path_str = path
      .unwrap()
      .path()
      .file_name()
      .unwrap()
      .to_string_lossy()
      .into_owned();
    assert!(path_str.contains(".proto"));
    tonic_build::compile_protos(format!("{}{}", PROTO_FILES_PATH, path_str))?;
  }
  Ok(())
}
