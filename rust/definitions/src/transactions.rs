use parity_scale_codec_derive::{Decode, Encode};

use super::network_specs::{ChainSpecsToSend, Verifier};

/// Struct to store sign_transaction action information
#[derive(Decode, Encode)]
pub struct SignDb {
    pub crypto: String,
    pub path: String,
    pub name_for_seed: String,
    pub transaction: Vec<u8>,
    pub has_pwd: bool,
    pub author_base58: String,
}

/// Struct to store load_metadata action information
#[derive(Decode, Encode)]
pub struct LoadMetaDb {
    pub versioned_name: Vec<u8>, // encoded versioned name
    pub meta: Vec<u8>, // encoded metadata
    pub upd_network: Option<Vec<u8>>, // network genesis hash if the network verifier should be updated
    pub verifier: Verifier, // transaction verifier, whether this goes anywhere after approval is determined by the action card type
}

/// Struct to store transferred information for cases when only
/// verifier is to be updated, without loading new metadata.
/// Also is used in updating both network verifier and general verifier,
/// the exact type of action is determined by the action card type
#[derive(Decode, Encode)]
pub struct UpdSpecs {
    pub gen_hash: Vec<u8>, // 
    pub verifier: Verifier,
}

/// Struct to store load_types action information
#[derive(Decode, Encode)]
pub struct LoadTypesDb {
    pub types_info_encoded: Vec<u8>,
    pub upd_verifier: Option<Verifier>,
}

/// Struct to store add_network action information
#[derive(Decode, Encode)]
pub struct AddNetworkDb {
    pub versioned_name: Vec<u8>,
    pub meta: Vec<u8>,
    pub chainspecs: ChainSpecsToSend,
    pub verifier: Verifier,
}

