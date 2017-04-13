// Copyright 2015-2017 Parity Technologies (UK) Ltd.
// This file is part of Parity.

// Parity is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// Parity is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with Parity.  If not, see <http://www.gnu.org/licenses/>.

extern crate libc;
extern crate rustc_serialize;
extern crate tiny_keccak;
extern crate parity_wordlist as wordlist;
extern crate ethkey;
extern crate ethstore;
extern crate rlp;
extern crate blockies;

mod string;

use rustc_serialize::hex::{ToHex, FromHex};
use rustc_serialize::base64::{self, ToBase64};
use tiny_keccak::Keccak;
use ethkey::{KeyPair, Generator, Brain, Message, sign};
use ethstore::Crypto;
use rlp::UntrustedRlp;
use blockies::{Blockies, create_icon, ethereum};

use string::StringPtr;

fn blockies_icon_in_base64(seed: Vec<u8>) -> String {
  let mut result = Vec::new();
  let options = ethereum::Options {
    size: 8,
    scale: 16,
    seed: seed,
    color: None,
    background_color: None,
    spot_color: None,
  };

  create_icon(&mut result, Blockies::Ethereum(options)).unwrap();
  result.to_base64(base64::Config {
    char_set: base64::CharacterSet::Standard,
    newline: base64::Newline::LF,
    pad: true,
    line_length: None,
  })
}

// string ffi

#[no_mangle]
pub unsafe extern fn rust_string_ptr(s: *mut String) -> *mut StringPtr {
  Box::into_raw(Box::new(StringPtr::from(&**s)))
}

#[no_mangle]
pub unsafe extern fn rust_string_destroy(s: *mut String) {
  let _ = Box::from_raw(s);
}

#[no_mangle]
pub unsafe extern fn rust_string_ptr_destroy(s: *mut StringPtr) {
  let _ = Box::from_raw(s);
}

// ethkey ffi

#[no_mangle]
pub unsafe extern fn ethkey_keypair_destroy(keypair: *mut KeyPair) {
  let _ = Box::from_raw(keypair);
}

#[no_mangle]
pub unsafe extern fn ethkey_keypair_brainwallet(seed: *mut StringPtr) -> *mut KeyPair {
  let generator = Brain::new((*seed).as_str().to_owned());
  Box::into_raw(Box::new(generator.generate().unwrap()))
}

#[no_mangle]
pub unsafe extern fn ethkey_keypair_secret(keypair: *mut KeyPair) -> *mut String {
  let secret = format!("{:?}", (*keypair).secret());
  Box::into_raw(Box::new(secret))
}

#[no_mangle]
pub unsafe extern fn ethkey_keypair_address(keypair: *mut KeyPair) -> *mut String {
  let address = format!("{:?}", (*keypair).address());
  Box::into_raw(Box::new(address))
}

#[no_mangle]
pub unsafe extern fn ethkey_keypair_sign(keypair: *mut KeyPair, message: *mut StringPtr) -> *mut String {
  let secret = (*keypair).secret();
  let message: Message = (*message).as_str().parse().unwrap();
  let signature = format!("{}", sign(secret, &message).unwrap());
  Box::into_raw(Box::new(signature))
}

fn safe_rlp_item(rlp: &str, position: u32) -> Result<String, String> {
  let hex = rlp.from_hex().map_err(| e | e.to_string())?;
  let rlp = UntrustedRlp::new(&hex);
  let item = rlp.at(position as usize).map_err(| e | e.to_string())?;
  let data = item.data().map_err(| e | e.to_string())?;
  Ok(data.to_hex())
}

#[no_mangle]
pub unsafe extern fn rlp_item(rlp: *mut StringPtr, position: u32, error: *mut u32) -> *mut String {
  match safe_rlp_item((*rlp).as_str(), position) {
    Ok(result) => Box::into_raw(Box::new(result)),
    Err(_err) => {
      *error = 1;
      let s: String = "".into();
      Box::into_raw(Box::new(s))
    }
  }
}

#[no_mangle]
pub unsafe extern fn keccak256(data: *mut StringPtr) -> *mut String {
  let data = (*data).as_str();
  let hex = data.from_hex().unwrap();
  let mut res: [u8; 32] = [0; 32];
  let mut keccak = Keccak::new_keccak256();
  keccak.update(&hex);
  keccak.finalize(&mut res);
  Box::into_raw(Box::new(res.to_hex()))
}

// blockies ffi

#[no_mangle]
pub unsafe extern fn blockies_icon(blockies_seed: *mut StringPtr) -> *mut String {
  let blockies_seed = (*blockies_seed).as_str();
  let icon = blockies_icon_in_base64(blockies_seed.into());
  Box::into_raw(Box::new(icon))
}

// random phrase ffi
#[no_mangle]
pub unsafe extern fn random_phrase(words: u32) -> *mut String {
  let words = wordlist::random_phrase(words as usize);
  Box::into_raw(Box::new(words))
}

// data encryption ffi

#[no_mangle]
pub unsafe extern fn encrypt_data(data: *mut StringPtr, password: *mut StringPtr) -> *mut String {
  let data = (*data).as_str();
  let password = (*password).as_str();
  let crypto = Crypto::with_plain(data.as_bytes(), password, 10240);
  Box::into_raw(Box::new(crypto.into()))
}

#[no_mangle]
pub unsafe extern fn decrypt_data(encrypted_data: *mut StringPtr, password: *mut StringPtr, error: *mut u32) -> *mut String {
  let data = (*encrypted_data).as_str();
  let password = (*password).as_str();
  let crypto: Crypto = match data.parse() {
    Ok(crypto) => crypto,
    Err(_) => {
      *error = 1;
      return Box::into_raw(Box::new(String::new()))
    }
  };
  match crypto.decrypt(password) {
    Ok(decrypted) => {
      Box::into_raw(Box::new(String::from_utf8_unchecked(decrypted)))
    },
    Err(_) => {
      *error = 2;
      Box::into_raw(Box::new(String::new()))
    },
  }
}

#[cfg(target_os = "android")]
#[allow(non_snake_case)]
pub mod android {
  extern crate jni;

  use wordlist;
  use super::*;
  use self::jni::JNIEnv;
  use self::jni::objects::{JClass, JString};
  use self::jni::sys::{jint, jstring};

  #[no_mangle]
  pub unsafe extern fn Java_com_nativesigner_EthkeyBridge_ethkeyBrainwalletAddress(env: JNIEnv, _: JClass, seed: JString) -> jstring {
    let seed: String = env.get_string(seed).expect("Invalid seed").into();
    let keypair = Brain::new(seed).generate().unwrap();
    let java_address = env.new_string(format!("{:?}", keypair.address())).expect("Could not create java string");
    java_address.into_inner()
  }

  #[no_mangle]
  pub unsafe extern fn Java_com_nativesigner_EthkeyBridge_ethkeyBrainwalletSecret(env: JNIEnv, _: JClass, seed: JString) -> jstring {
    let seed: String = env.get_string(seed).expect("Invalid seed").into();
    let keypair = Brain::new(seed).generate().unwrap();
    let java_secret = env.new_string(format!("{:?}", keypair.secret())).expect("Could not create java string");
    java_secret.into_inner()
  }

  #[no_mangle]
  pub unsafe extern fn Java_com_nativesigner_EthkeyBridge_ethkeyBrainwalletSign(env: JNIEnv, _: JClass, seed: JString, message: JString) -> jstring {
    let seed: String = env.get_string(seed).expect("Invalid seed").into();
    let message: String = env.get_string(message).expect("Invalid message").into();
    let keypair = Brain::new(seed).generate().unwrap();
    let message: Message = message.parse().unwrap();
    let signature = sign(keypair.secret(), &message).unwrap();
    let java_signature = env.new_string(format!("{}", signature)).expect("Could not create java string");
    java_signature.into_inner()
  }

  #[no_mangle]
  pub unsafe extern fn Java_com_nativesigner_EthkeyBridge_ethkeyRlpItem(env: JNIEnv, _: JClass, data: JString, position: jint) -> jstring {
    let data: String = env.get_string(data).expect("Invalid seed").into();
    match safe_rlp_item(&data, position as u32) {
      Ok(result) => env.new_string(result).expect("Could not create java string").into_inner(),
      Err(_) => {
        let res = env.new_string("").expect("").into_inner();
        env.throw(res.into());
        res
      },
    }
  }

  #[no_mangle]
  pub unsafe extern fn Java_com_nativesigner_EthkeyBridge_ethkeyKeccak(env: JNIEnv, _: JClass, data: JString) -> jstring {
    let data: String = env.get_string(data).expect("Invalid seed").into();
    let hex = data.from_hex().unwrap();
    let mut res: [u8; 32] = [0; 32];
    let mut keccak = Keccak::new_keccak256();
    keccak.update(&hex);
    keccak.finalize(&mut res);
    env.new_string(res.to_hex()).expect("Could not create java string").into_inner()
  }

  #[no_mangle]
  pub unsafe extern fn Java_com_nativesigner_EthkeyBridge_ethkeyBlockiesIcon(env: JNIEnv, _: JClass, seed: JString) -> jstring {
    let seed: String = env.get_string(seed).expect("Invalid seed").into();
    let icon = blockies_icon_in_base64(seed.into());
    env.new_string(icon).expect("Could not create java string").into_inner()
  }

  #[no_mangle]
  pub unsafe extern fn Java_com_nativesigner_EthkeyBridge_ethkeyRandomPhrase(env: JNIEnv, _: JClass, words: jint) -> jstring {
    let words = wordlist::random_phrase(words as usize);
    env.new_string(words).expect("Could not create java string").into_inner()
  }

  #[no_mangle]
  pub unsafe extern fn Java_com_nativesigner_EthkeyBridge_ethkeyEncryptData(env: JNIEnv, _: JClass, data: JString, password: JString) -> jstring {
    let data: String = env.get_string(data).expect("Invalid data").into();
    let password: String = env.get_string(password).expect("Invalid password").into();
    let crypto = Crypto::with_plain(data.as_bytes(), &password, 10240);
    env.new_string(String::from(crypto)).expect("Could not create java string").into_inner()
  }

  #[no_mangle]
  pub unsafe extern fn Java_com_nativesigner_EthkeyBridge_ethkeyDecryptData(env: JNIEnv, _: JClass, data: JString, password: JString) -> jstring {
    let data: String = env.get_string(data).expect("Invalid data").into();
    let password: String = env.get_string(password).expect("Invalid password").into();
    let crypto: Crypto = match data.parse() {
      Ok(crypto) => crypto,
      Err(_) => {
        let res = env.new_string("").expect("").into_inner();
        env.throw(res.into());
        return res
      },
    };

    match crypto.decrypt(&password) {
      Ok(decrypted) => {
        env.new_string(String::from_utf8_unchecked(decrypted)).expect("Could not create java string").into_inner()
      },
      Err(_) => {
        let res = env.new_string("").expect("").into_inner();
        env.throw(res.into());
        res
      },
    }
  }
}

#[cfg(test)]
mod tests {
  use super::safe_rlp_item;

  #[test]
  fn test_rlp_item() {
    let rlp = "f85f800182520894095e7baea6a6c7c4c2dfeb977efac326af552d870a801ba048b55bfa915ac795c431978d8a6a992b628d557da5ff759b307d495a36649353a0efffd310ac743f371de3b9f7f9cb56c0b28ad43601b4ab949f53faa07bd2c804";
    assert_eq!(safe_rlp_item(rlp, 0), Ok("".into()));
    assert_eq!(safe_rlp_item(rlp, 1), Ok("01".into()));
    assert_eq!(safe_rlp_item(rlp, 2), Ok("5208".into()));
    assert_eq!(safe_rlp_item(rlp, 3), Ok("095e7baea6a6c7c4c2dfeb977efac326af552d87".into()));
    assert_eq!(safe_rlp_item(rlp, 4), Ok("0a".into()));
    assert_eq!(safe_rlp_item(rlp, 5), Ok("".into()));
  }
}

