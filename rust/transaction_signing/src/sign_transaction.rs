use hex;
use sp_core::{Pair, ed25519, sr25519, ecdsa, crypto::Ss58Codec};
use ethsign::{keyfile::Crypto, Protected};
use serde_json;
use sled::{Db, Tree};
use db_handling::{settings::SignDb, constants::{SETTREE, SIGNTRANS, IDTREE}};
use parity_scale_codec::{Decode, Encode};


/// Function to create signatures using RN output action line, and user entered pin and password.
/// Also needs database name to fetch saved transaction and key.

pub fn create_signature (pin: &str, pwd_entry: &str, database: Db) -> Result<String, Box<dyn std::error::Error>> {

    let settings: Tree = database.open_tree(SETTREE)?;
    let action = match settings.get(SIGNTRANS)? {
        Some(x) => {<SignDb>::decode(&mut &x[..])?},
        None => {return Err(Box::from("No approved transaction found."))}
    };
    
    let seeds: Tree = database.open_tree(IDTREE)?;
    let encrypted_seed = match seeds.get(action.name_for_seed.encode())? {
        Some(x) => <String>::decode(&mut &x[..])?,
        None => {return Err(Box::from("No encrypted seed."))}
    };

// get words from encoded seed
    let password = Protected::new(pin.as_bytes());
    let pwd = {
        if action.has_pwd {Some(pwd_entry)}
        else {None}
    };
    let seed_to_use: String = serde_json::from_str(&encrypted_seed)?;
    let crypto: Crypto = serde_json::from_str(&seed_to_use)?;
    let decrypted = match crypto.decrypt(&password) {
        Ok(x) => x,
        Err(ethsign::Error::InvalidPassword) => return Err(Box::from("Wrong pin.")),
        Err(e) => return Err(Box::from(e)),
    };
    let words = String::from_utf8(decrypted)?;
    
// get full line with derivation path, used for signature preparation
    let full_line = format!("{}{}", words, action.path);
    
    match &action.crypto[..] {
        "ed25519" => {
            let ed25519_pair = match ed25519::Pair::from_string(&full_line, pwd) {
                Ok(x) => x,
                Err(_) => return Err(Box::from("Error generating keys for ed25519 crypto."))
            };
            let x: ed25519::Public = match Ss58Codec::from_ss58check(&action.author_base58) {
                Ok(t) => t,
                Err(_) => {return Err(Box::from("Could not interpret provided base58 string as valid public key."))},
            };
            if x != ed25519_pair.public() {return Err(Box::from("Wrong password."))}
            let signature = ed25519_pair.sign(&action.transaction[..]);
            settings.remove(SIGNTRANS)?;
            database.flush()?;
            Ok(format!("00{}", hex::encode(signature)))
        },
        "sr25519" => {
            let sr25519_pair = match sr25519::Pair::from_string(&full_line, pwd) {
                Ok(x) => x,
                Err(_) => return Err(Box::from("Error generating keys for sr25519 crypto."))
            };
            let x: sr25519::Public = match Ss58Codec::from_ss58check(&action.author_base58) {
                Ok(t) => t,
                Err(_) => {return Err(Box::from("Could not interpret provided base58 string as valid public key."))},
            };
            if x != sr25519_pair.public() {return Err(Box::from("Wrong password."))}
            let signature = sr25519_pair.sign(&action.transaction[..]);
            settings.remove(SIGNTRANS)?;
            database.flush()?;
            Ok(format!("01{}", hex::encode(signature)))
        },
        "ecdsa" => {
            let ecdsa_pair = match ecdsa::Pair::from_string(&full_line, pwd) {
                Ok(x) => x,
                Err(_) => return Err(Box::from("Error generating keys for ecdsa crypto."))
            };
            let x: ecdsa::Public = match Ss58Codec::from_ss58check(&action.author_base58) {
                Ok(t) => t,
                Err(_) => {return Err(Box::from("Could not interpret provided base58 string as valid public key."))},
            };
            if x != ecdsa_pair.public() {return Err(Box::from("Wrong password."))}
            let signature = ecdsa_pair.sign(&action.transaction[..]);
            settings.remove(SIGNTRANS)?;
            database.flush()?;
            Ok(format!("02{}", hex::encode(signature)))
        },
        _ => return Err(Box::from("Encryption type not supported."))
    }
}
