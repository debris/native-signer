/// Default database values for initialization and factory reset

use std::convert::TryInto;
use super::chainspecs::ChainSpecs;

pub fn get_default_chainspecs() -> Vec<ChainSpecs> {
    vec![
        ChainSpecs {
            base58prefix: 2,
			color: String::from("#000"),
	    	decimals: 12,
            genesis_hash: hex::decode("b0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe").unwrap().try_into().unwrap(),
    		logo: String::from("kusama"),
            name: String::from("kusama"),
	    	order: 2,
		    path_id: String::from("kusama"),
            secondary_color: String::from("#262626"),
	    	title: String::from("Kusama"),
		    unit: String::from("KSM"),
    	},
	    ChainSpecs {
            base58prefix: 0,
            color: String::from("#E6027A"),
    		decimals: 10,
	    	genesis_hash: hex::decode("91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3").unwrap().try_into().unwrap(),
		    logo: String::from("polkadot"),
            name: String::from("polkadot"),
		    order: 1,
    		path_id: String::from("polkadot"),
            secondary_color: String::from("#262626"),
	    	title: String::from("Polkadot"),
		    unit: String::from("DOT"),
    	},
	    ChainSpecs {
            base58prefix: 0,
    		color: String::from("#6f36dc"),
    		decimals: 12,
	    	genesis_hash: hex::decode("78ae7dc7e64637e01fa6a6b6e4fa252c486f62af7aa71c471ad17f015bd375ce").unwrap().try_into().unwrap(),
		    logo: String::from("rococo"),
            name: String::from("rococo"),
			order: 4,
    		path_id: String::from("rococo"),
            secondary_color: String::from("#262626"),
		    title: String::from("Rococo"),
	    	unit: String::from("ROC"),
    	},
        ChainSpecs {
            base58prefix: 42,
	    	color: String::from("#660D35"),
    		decimals: 12,
		    genesis_hash: hex::decode("e143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e").unwrap().try_into().unwrap(),
    		logo: String::from("westend"),
            name: String::from("westend"),
			order: 3,
    		path_id: String::from("westend"),
            secondary_color: String::from("#262626"),
	    	title: String::from("Westend"),
		    unit: String::from("WND"),
        },
    ]
}

