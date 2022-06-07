pub fn generate_nbytes(n: usize, c: Option<u8>) -> Vec<u8> {
  let c : u8 = match c {
    Some(c) => c,
    None => b'A',
  };
  return vec![c; n];
}
