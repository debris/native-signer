use bitvec::prelude::{BitVec, Lsb0};
use sled::IVec;

use super::AuthorPublicKey;
use super::cards::{Card, Warning};
use super::error::{Error, BadInputData, UnableToDecode, DatabaseError, SystemError};


/// Function to pring all types of cards.
/// Should be used to check how the cards are printed in the app.

pub fn make_all_cards() -> String {

    let mut all_cards: Vec<Card> = Vec::new();
    
    all_cards.push(Card::Call{pallet: "test_Pallet", method: "test_Method"});
    all_cards.push(Card::Varname("test_Varname"));
    all_cards.push(Card::Default("12345"));
    all_cards.push(Card::Id("5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty"));
    all_cards.push(Card::None);
    all_cards.push(Card::IdentityField("Twitter"));
    
    let bv: BitVec<Lsb0, u8> = BitVec::from_vec(vec![32, 4, 155]);
    all_cards.push(Card::BitVec(bv));
    
    all_cards.push(Card::Balance{number: "300.000000", units: "KULU"});
    all_cards.push(Card::FieldName("test_FieldName"));
    all_cards.push(Card::FieldNumber(1));
    all_cards.push(Card::EnumVariantName("test_EnumVariantName"));
    all_cards.push(Card::EraImmortalNonce(4980));
    all_cards.push(Card::EraMortalNonce{phase: 55, period: 64, nonce: 89});
    all_cards.push(Card::Tip{number: "0", units: "pWND"});
    all_cards.push(Card::TipPlain(8800));
    all_cards.push(Card::BlockHash("a8dfb73a4b44e6bf84affe258954c12db1fe8e8cf00b965df2af2f49c1ec11cd"));
    all_cards.push(Card::TxSpec{network: "westend", version: 50, tx_version: 5});
    all_cards.push(Card::TxSpecPlain{gen_hash: "a8dfb73a4b44e6bf84affe258954c12db1fe8e8cf00b965df2af2f49c1ec11cd", version: 50, tx_version: 5});
    all_cards.push(Card::Author{base58_author: "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty", path: "//Alice", has_pwd: false, name: ""});
    all_cards.push(Card::AuthorPlain("5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty"));
    all_cards.push(Card::AuthorPublicKey(AuthorPublicKey::Sr25519([142, 175, 4, 21, 22, 135, 115, 99, 38, 201, 254, 161, 126, 37, 252, 82, 135, 97, 54, 147, 201, 18, 144, 156, 178, 38, 170, 71, 148, 242, 106, 72])));
    all_cards.push(Card::Warning(Warning::AuthorNotFound));
    all_cards.push(Card::Warning(Warning::NewerVersion{used_version: 50, latest_version: 9010}));
    all_cards.push(Card::Error(Error::BadInputData(BadInputData::TooShort)));
    all_cards.push(Card::Error(Error::BadInputData(BadInputData::NotSubstrate)));
    all_cards.push(Card::Error(Error::BadInputData(BadInputData::NotHex)));
    all_cards.push(Card::Error(Error::BadInputData(BadInputData::CryptoNotSupported)));
    all_cards.push(Card::Error(Error::BadInputData(BadInputData::UnexpectedImmortality)));
    all_cards.push(Card::Error(Error::BadInputData(BadInputData::UnexpectedMortality)));
    all_cards.push(Card::Error(Error::BadInputData(BadInputData::WrongPayloadType)));
    all_cards.push(Card::Error(Error::BadInputData(BadInputData::GenesisHashMismatch)));
    all_cards.push(Card::Error(Error::BadInputData(BadInputData::ImmortalHashMismatch)));
    all_cards.push(Card::Error(Error::BadInputData(BadInputData::SomeDataNotUsed)));
    all_cards.push(Card::Error(Error::UnableToDecode(UnableToDecode::MethodAndExtrinsicsFailure)));
    all_cards.push(Card::Error(Error::UnableToDecode(UnableToDecode::NeedPalletAndMethod)));
    all_cards.push(Card::Error(Error::UnableToDecode(UnableToDecode::MethodNotFound{method_index: 2, pallet_name: "test_Pallet".to_string()})));
    all_cards.push(Card::Error(Error::UnableToDecode(UnableToDecode::PalletNotFound(3))));
    all_cards.push(Card::Error(Error::UnableToDecode(UnableToDecode::MethodIndexTooHigh{method_index: 5, pallet_index: 3, total: 4})));
    all_cards.push(Card::Error(Error::UnableToDecode(UnableToDecode::ArgumentTypeError)));
    all_cards.push(Card::Error(Error::UnableToDecode(UnableToDecode::ArgumentNameError)));
    all_cards.push(Card::Error(Error::UnableToDecode(UnableToDecode::NotPrimitive(String::from("Option<u8>")))));
    all_cards.push(Card::Error(Error::UnableToDecode(UnableToDecode::NoCompact)));
    all_cards.push(Card::Error(Error::UnableToDecode(UnableToDecode::DataTooShort)));
    all_cards.push(Card::Error(Error::UnableToDecode(UnableToDecode::PrimitiveFailure(String::from("u32")))));
    all_cards.push(Card::Error(Error::UnableToDecode(UnableToDecode::UnexpectedOptionVariant)));
    all_cards.push(Card::Error(Error::UnableToDecode(UnableToDecode::IdFields)));
    all_cards.push(Card::Error(Error::UnableToDecode(UnableToDecode::Array)));
    all_cards.push(Card::Error(Error::UnableToDecode(UnableToDecode::BalanceNotDescribed(String::from("MyNewBalanceType")))));
    all_cards.push(Card::Error(Error::UnableToDecode(UnableToDecode::UnexpectedEnumVariant)));
    all_cards.push(Card::Error(Error::UnableToDecode(UnableToDecode::UnexpectedCompactInsides)));
    all_cards.push(Card::Error(Error::UnableToDecode(UnableToDecode::CompactNotPrimitive)));
    all_cards.push(Card::Error(Error::UnableToDecode(UnableToDecode::UnknownType(String::from("T::SomeUnknownType")))));
    all_cards.push(Card::Error(Error::DatabaseError(DatabaseError::Internal(sled::Error::CollectionNotFound(IVec::from(vec![1]))))));
    all_cards.push(Card::Error(Error::DatabaseError(DatabaseError::Internal(sled::Error::Unsupported(String::from("Something Unsupported."))))));
    all_cards.push(Card::Error(Error::DatabaseError(DatabaseError::Internal(sled::Error::ReportableBug(String::from("Please report me"))))));
    all_cards.push(Card::Error(Error::DatabaseError(DatabaseError::Internal(sled::Error::Io(std::io::Error::new(std::io::ErrorKind::Other, "oh no!"))))));
    all_cards.push(Card::Error(Error::DatabaseError(DatabaseError::Internal(sled::Error::Corruption{at: None, bt: ()}))));
    all_cards.push(Card::Error(Error::DatabaseError(DatabaseError::DamagedChainSpecs)));
    all_cards.push(Card::Error(Error::DatabaseError(DatabaseError::NoNetwork)));
    all_cards.push(Card::Error(Error::DatabaseError(DatabaseError::DamagedAddressDetails)));
    all_cards.push(Card::Error(Error::DatabaseError(DatabaseError::DamagedTypesDatabase)));
    all_cards.push(Card::Error(Error::DatabaseError(DatabaseError::NoTypes)));
    all_cards.push(Card::Error(Error::DatabaseError(DatabaseError::DamagedVersName)));
    all_cards.push(Card::Error(Error::DatabaseError(DatabaseError::NoMetaThisVersion)));
    all_cards.push(Card::Error(Error::DatabaseError(DatabaseError::NoMetaAtAll)));
    all_cards.push(Card::Error(Error::SystemError(SystemError::BalanceFail)));
    all_cards.push(Card::Error(Error::SystemError(SystemError::MetaVersionBelow12)));
    all_cards.push(Card::Error(Error::SystemError(SystemError::MetaMismatch)));
    all_cards.push(Card::Error(Error::SystemError(SystemError::NoVersion)));
    all_cards.push(Card::Error(Error::SystemError(SystemError::UnableToDecodeMeta)));
    all_cards.push(Card::Error(Error::SystemError(SystemError::RegexError)));
    
    let mut output_cards = String::from(r#"{"method":["#);
    
    for (i,x) in all_cards.iter().enumerate() {
        if i > 0 {output_cards.push_str(",")}
        output_cards.push_str(&x.card(i as u32,0));
    }
    
    output_cards.push_str(r#"]}"#);
    output_cards
}
