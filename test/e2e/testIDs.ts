// Copyright 2015-2020 Parity Technologies (UK) Ltd.
// Copyright 2021 Commonwealth Labs, Inc.
// This file is part of Layer Wallet.

// Layer Wallet is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// Layer Wallet is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with Layer Wallet. If not, see <http://www.gnu.org/licenses/>.

const testIDs = {
	AccountListScreen: {
		accountList: 'accountList'
	},
	Alert: {
		backupDoneButton: 'alert_identity_backup_done',
		deleteAccount: 'alert_delete_account',
		deleteConfirmation: 'alert_delete_confirmation',
		deleteIdentity: 'alert_delete_identity'
	},
	Header: {
		headerBackButton: 'header_back_button'
	},
	IdentitiesSwitch: {
		addIdentityButton: 'identities_switch_add_identity',
		manageIdentityButton: 'identities_switch_manager_button',
		modal: 'identity_switch_modal',
		toggleButton: 'identities_switch_toggle_button'
	},
	ShowRecoveryPhrase: {
		nextButton: 'identity_backup_next',
		passwordInput: 'identity_backup_password_input',
		seedText: 'identity_backup_seed'
	},
	RenameWallet: {
		deleteButton: 'identity_management_delete_button',
		popupMenuButton: 'identity_management_popup_menu'
	},
	CreateWallet: {
		createButton: 'identity_new_create_button',
		nameInput: 'identity_new_name_input',
		passwordInput: 'identity_new_password_input',
		recoverButton: 'identity_new_recover_button',
		scrollScreen: 'identity_new_scroll_screen',
		seedInput: 'identity_new_seed_input'
	},
	Main: {
		addCustomNetworkButton: 'anc_add_custom_button',
		addNewNetworkButton: 'anc_add_new_button',
		backButton: 'anc_back_button',
		chooserScreen: 'anc_chooser_screen',
		createButton: 'anc_create_button',
		networkButton: 'anc_network_button',
		noAccountScreen: 'anc_no_account_screen',
		recoverButton: 'anc_recover_button',
		showExistedButton: 'anc_show_existed'
	},
	NavigationTab: {
		settings: 'navigation_tab_settings',
		wallet: 'navigation_tab_wallet'
	},
	PathDetail: {
		deleteButton: 'path_detail_delete_button',
		deriveButton: 'path_detail_derive_button',
		exportButton: 'path_detail_export_button',
		popupMenuButton: 'path_detail_popup_menu_button',
		screen: 'path_detail_screen'
	},
	SignTx: {
		networkAddSuccessButton: 'qr_scanner_add_network_button'
	},
	SignedMessage: {
		qrView: 'signed_message_qr_view'
	},
	SignedTx: {
		qrView: 'signed_tx_qr_view'
	},
	TacScreen: {
		agreePrivacyButton: 'tac_privacy',
		agreeTacButton: 'tac_agree',
		nextButton: 'tac_next',
		tacView: 'tac_view'
	}
};

export default testIDs;
