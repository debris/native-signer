//! All db handling related to seeds and addresses
//! seed phrases should be stored in hw encrypted by
//! best available tool and here they are only processed in plaintext.
//! Zeroization is mostly delegated to os

use sled::{Db, Tree, open};
use sp_core::{Pair, ed25519, sr25519, ecdsa};
use parity_scale_codec::{Decode, Encode};
use parity_scale_codec_derive;
use super::chainspecs::ChainSpecs;
use super::constants::{ADDRTREE, SPECSTREE};
use super::db_utils::{generate_seed_key, generate_address_key, generate_network_key, AddressKey, SeedKey, NetworkKey};
use bip39::{Language, Mnemonic, MnemonicType};
use zeroize::Zeroize;

#[cfg(test)]
use std::fs;

#[cfg(test)]
use super::chainspecs::load_chainspecs;

///Type of encryption; only allow supported types here - compile-time check for that is happening
///here.
//TODO: check if it is redundant
//Could not be replaced by sp_core::...::CRYPTO_ID as that doesn't do anything at compile time
#[derive(Clone, Copy, PartialEq, Debug, parity_scale_codec_derive::Decode, parity_scale_codec_derive::Encode)]
pub enum Encryption {
    Sr25519,
    Ed25519,
    Ecdsa,
}

///Struct associated with public address that has secret key available
#[derive(parity_scale_codec_derive::Decode, parity_scale_codec_derive::Encode, Debug)]
pub struct AddressDetails {
    pub name_for_seed: SeedKey,
    pub path: String,
    pub has_pwd: bool,
    pub name: String,
    pub network_id: Vec<NetworkKey>,
    pub encryption: Encryption,
}

///Struct to move seed around
//TODO: zeroize somehow
#[derive(PartialEq, Debug)]
pub struct SeedObject<'a> {
    pub seed_name: &'a str,
    pub seed_phrase: &'a str,
    pub encryption: Encryption,
}

///get all identities within given seed and network
pub fn get_relevant_identities (seed_name: &str, network_id_string: &str, database_name: &str) -> Result<Vec<(AddressKey, AddressDetails)>, Box<dyn std::error::Error>> {
    let network_id = generate_network_key(hex::decode(network_id_string)?); //TODO: add whatever is needed for parachains?
    let database: Db = open(database_name)?;
    let identities: Tree = database.open_tree(ADDRTREE)?;
    let name_for_seed = generate_seed_key(seed_name);
    let mut identities_out: Vec<(AddressKey, AddressDetails)> = Vec::new();
    for (key, value) in identities
        .iter()
        .collect::<Result<Vec<_>,_>>()?
        .into_iter() {
        let address = key.to_vec();
        let details = <AddressDetails>::decode(&mut &value[..])?;
        if details.network_id.contains(&network_id) && details.name_for_seed == name_for_seed {
            identities_out.push((address, details));
        }
    }
    Ok(identities_out)
}

fn generate_random_phrase (words_number: u32) -> Result<String, Box<dyn std::error::Error>> {
    let mnemonic_type = MnemonicType::for_word_count(words_number as usize)?;
	let mnemonic = Mnemonic::new(mnemonic_type, Language::English);
	Ok(mnemonic.into_phrase())
}

///Create address from seed and path
fn create_address (
    database: &Db, 
    path: &str, 
    network_id: NetworkKey,
    name: &str,
    seed_object: &SeedObject,
    path_password: Option<&str>
) -> Result<(), Box<dyn std::error::Error>> {
    //TOTO: check zeroize
    let mut full_address = seed_object.seed_phrase.to_owned() + path;
    let address_key = match seed_object.encryption {
        Encryption::Sr25519 => {
            match sr25519::Pair::from_string(&full_address, path_password) {
                Ok(a) => generate_address_key(a.public().to_vec()),
                Err(_) => return Err(Box::from("Error generating sr25519 address")),
            }
        },
        Encryption::Ed25519 => {
            match ed25519::Pair::from_string(&full_address, path_password) {
                Ok(a) => generate_address_key(a.public().to_vec()),
                Err(_) => return Err(Box::from("Error generating ed25519 address")),
            }
        },
        Encryption::Ecdsa => {
            match ecdsa::Pair::from_string(&full_address, path_password) {
                Ok(a) => generate_address_key(a.public().0.to_vec()),
                Err(_) => return Err(Box::from("Error generating ecdsa address")),
            }
        },
    };
    full_address.zeroize();
    let identities: Tree = database.open_tree(ADDRTREE)?;
    match identities.get(&address_key)? {
        Some(address_record) => {
            let mut address = <AddressDetails>::decode(&mut &address_record[..])?;
            if !address.network_id.contains(&network_id) {
                address.network_id.push(network_id);
                identities.insert(address_key, address.encode())?;
            };
        }
        None => {
            let address = AddressDetails {
                name_for_seed: generate_seed_key(&seed_object.seed_name),
                path: path.to_string(),
                has_pwd: path_password != None,
                name: name.to_string(),
                network_id: vec!(network_id),
                encryption: seed_object.encryption,
            };
            identities.insert(address_key, address.encode())?;
        }
    }


    Ok(())
}


///Create addresses for all default paths in all default networks
fn populate_addresses (database: &Db, seed_object: &SeedObject) -> Result<(), Box<dyn std::error::Error>> {
    //TODO: check zeroize
    //TODO: compatibility with atomic operations
    let networks: Tree = database.open_tree(SPECSTREE)?;
    for result in networks.iter() {
        match result {
            Ok ((key, value)) => {
                let network = <ChainSpecs>::decode(&mut &value[..])?;
                create_address (
                    database, 
                    "", 
                    key.to_vec(),
                    "root address", 
                    seed_object,
                    None)?;
                create_address (
                    database, 
                    &network.path_id, 
                    key.to_vec(),
                    &format!("{} root address", network.name),
                    seed_object,
                    None)?;
            }
            Err (e) => return Err(Box::from(e)),
        }
    }
    Ok(())
}

///Generate new seed and populate all known networks with default accounts
pub fn try_create_seed (seed_name: &str, encryption_name: &str, seed_phrase_proposal: &str, seed_length: u32, database_name: &str) -> Result<String, Box<dyn std::error::Error>> {
    //TODO: atomize writes
    let database: Db = open(database_name)?;
    let seed_phrase = match seed_phrase_proposal {
        "" => generate_random_phrase(seed_length)?,
        string => {
            Mnemonic::validate(string, Language::English)?;
            string.to_owned()
        }
    };

    //TODO: zeroize seed

    let encryption = match encryption_name {
        "sr25519" => Encryption::Sr25519,
        "ed25519" => Encryption::Ed25519,
        "ecdsa" => Encryption::Ecdsa,
        _ => return Err(Box::from("System error: unknown encryption algorithm")),
    };
    
    let seed_object = SeedObject {
        seed_name: seed_name,
        seed_phrase: &seed_phrase,
        encryption: encryption,
    };

    populate_addresses(&database, &seed_object)?;
    database.flush()?;
    Ok(seed_phrase)
}

#[cfg(test)]
mod tests {
    use super::*;
    use super::super::constants::get_default_chainspecs;
    static PASSWORD: &str = "very long and unguessable phrase";
    static SEED: &str = "bottom drive obey lake curtain smoke basket hold race lonely fit walk";
    static ENCRYPTION_NAME: &str = "sr25519";

    #[test]
    fn test_generate_random_seed_phrase() {
        let random_phrase = generate_random_phrase(24).unwrap();
        assert!(Mnemonic::validate(&random_phrase, Language::English).is_ok());
        assert!(generate_random_phrase(1).is_err());
        let random_phrase2 = generate_random_phrase(24).unwrap();
        assert!(Mnemonic::validate(&random_phrase2, Language::English).is_ok());
        assert!(random_phrase2 != random_phrase);
    }

    #[test]
    fn test_check_for_seed_validity() {
        assert!(Mnemonic::validate(SEED, Language::English).is_ok());
        assert!(Mnemonic::validate("the fox is triangular", Language::English).is_err());
        assert!(Mnemonic::validate("", Language::English).is_err());
        assert!(Mnemonic::validate("низ ехать подчиняться озеро занавеска дым корзина держать гонка одинокий подходящий прогулка", Language::English).is_err());
    }

    #[test]
    fn test_generate_random_account() {
        let dbname = "tests/test_generate_random_account";
        let _ = fs::remove_dir_all(&dbname);
        load_chainspecs(dbname);
        try_create_seed("Randy", ENCRYPTION_NAME, "", 24, dbname).unwrap();
        let chainspecs = get_default_chainspecs();
        let random_addresses = get_relevant_identities("Randy", &hex::encode(chainspecs[0].genesis_hash), dbname).unwrap();
        assert!(random_addresses.len()>0);
    }

    #[test]
    fn test_generate_default_addresses_for_alice() {
        let dbname = "tests/test_generate_default_addresses_for_Alice";
        let _ = fs::remove_dir_all(&dbname);
        load_chainspecs(dbname);
        try_create_seed("Alice", ENCRYPTION_NAME, SEED, 0, dbname).unwrap();
        let chainspecs = get_default_chainspecs();
        let default_addresses = get_relevant_identities("Alice", &hex::encode(chainspecs[0].genesis_hash), dbname).unwrap();
        assert!(default_addresses.len()>0);
        assert_eq!(r#"[([70, 235, 221, 239, 140, 217, 187, 22, 125, 195, 8, 120, 215, 17, 59, 126, 22, 142, 111, 6, 70, 190, 255, 215, 125, 105, 211, 155, 173, 118, 180, 122], AddressDetails { name_for_seed: [20, 65, 108, 105, 99, 101], path: "", has_pwd: false, name: "root address", network_id: [[145, 177, 113, 187, 21, 142, 45, 56, 72, 250, 35, 169, 241, 194, 81, 130, 251, 142, 32, 49, 59, 44, 30, 180, 146, 25, 218, 122, 112, 206, 144, 195], [176, 168, 212, 147, 40, 92, 45, 247, 50, 144, 223, 183, 230, 31, 135, 15, 23, 180, 24, 1, 25, 122, 20, 156, 169, 54, 84, 73, 158, 163, 218, 254], [225, 67, 242, 56, 3, 172, 80, 232, 246, 248, 230, 38, 149, 209, 206, 158, 78, 29, 104, 170, 54, 193, 205, 44, 253, 21, 52, 2, 19, 243, 66, 62], [231, 195, 213, 237, 222, 125, 185, 100, 49, 124, 217, 181, 26, 58, 5, 157, 124, 217, 159, 129, 189, 188, 225, 73, 144, 4, 115, 84, 51, 76, 151, 121]], encryption: Sr25519 }), ([100, 163, 18, 53, 212, 191, 155, 55, 207, 237, 58, 250, 138, 166, 7, 84, 103, 95, 156, 73, 21, 67, 4, 84, 211, 101, 192, 81, 18, 120, 77, 5], AddressDetails { name_for_seed: [20, 65, 108, 105, 99, 101], path: "//kusama", has_pwd: false, name: "kusama root address", network_id: [[176, 168, 212, 147, 40, 92, 45, 247, 50, 144, 223, 183, 230, 31, 135, 15, 23, 180, 24, 1, 25, 122, 20, 156, 169, 54, 84, 73, 158, 163, 218, 254]], encryption: Sr25519 })]"#, format!("{:?}", default_addresses)); //because JSON export is what we care about
        let database: Db = open(dbname).unwrap();
        let identities: Tree = database.open_tree(ADDRTREE).unwrap();
        let test_key = generate_address_key(hex::decode("46ebddef8cd9bb167dc30878d7113b7e168e6f0646beffd77d69d39bad76b47a").unwrap());
        println!("{:?}", test_key);
        assert!(identities.contains_key(test_key).unwrap());
    }

}

