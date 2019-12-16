// Copyright 2015-2019 Parity Technologies (UK) Ltd.
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

// @flow

import { Container } from 'unstated';

import { emptyAccount, generateAccountId } from '../util/account';
import {
	loadAccounts,
	saveAccount,
	deleteAccount as deleteDbAccount,
	saveIdentities,
	loadIdentities
} from '../util/db';
import { constructSURI, parseSURI } from '../util/suri';
import {
	brainWalletAddress,
	decryptData,
	encryptData,
	secureGet,
	securePut,
	secureContains,
	secureDelete,
	substrateAddress
} from '../util/native';
import { NETWORK_LIST, NetworkProtocols } from '../constants';
import type { AccountsStoreState } from './types';
import {
	deepCopyIdentities,
	deepCopyIdentity,
	emptyIdentity,
	extractAddressFromAccountId,
	getAddressKeyByPath,
	getNetworkKeyByPath,
	isEthereumAccountId
} from '../util/identitiesUtils';
import { v4 } from 'react-native-uuid';

export default class AccountsStore extends Container<AccountsStoreState> {
	state = {
		accounts: new Map(),
		currentIdentity: null,
		identities: [],
		loaded: false,
		newAccount: emptyAccount(),
		newIdentity: emptyIdentity(),
		selectedKey: ''
	};

	constructor(props) {
		super(props);
		this.refreshList();
	}

	async select(accountKey) {
		await this.setState({ selectedKey: accountKey });
	}

	updateNew(accountUpdate) {
		this.setState({
			newAccount: { ...this.state.newAccount, ...accountUpdate }
		});
	}

	getNew() {
		return this.state.newAccount;
	}

	async submitNew(pin) {
		const account = this.state.newAccount;
		if (!account.seed) return;

		const accountKey = generateAccountId(account);
		await this.save(accountKey, account, pin);

		this.setState({
			accounts: this.state.accounts.set(accountKey, account),
			newAccount: emptyAccount()
		});
	}

	async deriveEthereumAccount(seedPhrase, networkKey) {
		const networkParams = NETWORK_LIST[networkKey];
		const ethereumAddress = await brainWalletAddress(seedPhrase);
		if (ethereumAddress === '') return false;
		const { ethereumChainId } = networkParams;
		const accountId = generateAccountId({
			address: ethereumAddress.address,
			networkKey
		});
		const updatedCurrentIdentity = deepCopyIdentity(this.state.currentIdentity);
		if (updatedCurrentIdentity.meta.has(ethereumChainId)) return false;
		updatedCurrentIdentity.meta.set(ethereumChainId, {
			address: ethereumAddress.address,
			createdAt: new Date().getTime(),
			name: '',
			updatedAt: new Date().getTime()
		});
		updatedCurrentIdentity.addresses.set(accountId, ethereumChainId);
		return await this.updateCurrentIdentity(updatedCurrentIdentity);
	}

	async updateAccount(accountKey, updatedAccount) {
		const accounts = this.state.accounts;
		const account = accounts.get(accountKey);

		if (account && updatedAccount) {
			await this.setState({
				accounts: accounts.set(accountKey, { ...account, ...updatedAccount })
			});
		}
	}

	async updateSelectedAccount(updatedAccount) {
		await this.updateAccount(this.state.selectedKey, updatedAccount);
	}

	async refreshList() {
		const accounts = await loadAccounts();
		const identities = await loadIdentities();
		let { currentIdentity } = this.state;
		if (identities.length > 0) currentIdentity = identities[0];
		this.setState({ accounts, currentIdentity, identities, loaded: true });
	}

	async save(accountKey, account, pin = null) {
		account = account ? account : this.state.accounts.get(accountKey);
		try {
			if (pin) {
				if (account.biometricEnabled) {
					await this.updateBiometric(accountKey, account, pin);
				}

				// for account creation
				if (account.seed) {
					account.encryptedSeed = await encryptData(account.seed, pin);
				}
			}

			const accountToSave = this.deleteSensitiveData(account);

			await saveAccount(accountKey, accountToSave);
		} catch (e) {
			console.error(e);
		}
	}

	async deleteAccount(accountKey) {
		const { accounts } = this.state;
		const account = accounts.get(accountKey);

		accounts.delete(accountKey);
		this.setState({ accounts, selectedKey: '' });
		await deleteDbAccount(accountKey);
		if (await secureContains(account.pinKey)) {
			await secureDelete(account.pinKey);
		}
	}

	async _unlockEncryptedSeed(accountKey, account, pin) {
		account.seed = await decryptData(account.encryptedSeed, pin);
		const { phrase, derivePath, password } = parseSURI(account.seed);
		account.seedPhrase = phrase || '';
		account.derivationPath = derivePath || '';
		account.derivationPassword = password || '';
		this.setState({
			accounts: this.state.accounts.set(accountKey, account)
		});
	}

	async unlockAccountWithBiometric(accountKey) {
		const { accounts } = this.state;
		const account = accounts.get(accountKey);

		if (!account || !account.encryptedSeed || !account.biometricEnabled) {
			return false;
		}

		try {
			const keyExists = await secureContains(account.pinKey);
			if (!keyExists) {
				throw {
					message:
						'Invalid state: biometry is enabled but no corresponding key found in storage.'
				};
			} else {
				const pin = await secureGet(account.pinKey);
				await this._unlockEncryptedSeed(accountKey, account, pin);
			}
		} catch (e) {
			throw e;
		}
		return true;
	}

	async unlockAccount(accountKey, pin) {
		const { accounts } = this.state;
		const account = accounts.get(accountKey);

		if (!accountKey || !account || !account.encryptedSeed) {
			return false;
		}

		try {
			await this._unlockEncryptedSeed(accountKey, account, pin);
		} catch (e) {
			return false;
		}
		return true;
	}

	deleteSensitiveData(account) {
		delete account.seed;
		delete account.seedPhrase;
		delete account.derivationPassword;
		delete account.derivationPath;

		return account;
	}

	lockAccount(accountKey) {
		const { accounts } = this.state;
		const account = accounts.get(accountKey);

		if (account) {
			const lockedAccount = this.deleteSensitiveData(account);
			this.setState({
				accounts: this.state.accounts.set(accountKey, lockedAccount)
			});
		}
	}

	getAccountWithoutCaseSensitive(accountId) {
		let findLegacyAccount = null;
		for (const [key, value] of this.state.accounts) {
			if (isEthereumAccountId(accountId)) {
				if (key.toLowerCase() === accountId.toLowerCase()) {
					findLegacyAccount = value;
					break;
				}
			} else if (key === accountId) {
				findLegacyAccount = value;
				break;
			} else if (
				//backward compatible with hard spoon substrate key pairs
				extractAddressFromAccountId(key) ===
				extractAddressFromAccountId(accountId)
			) {
				findLegacyAccount = value;
				break;
			}
		}
		return findLegacyAccount;
	}

	async getById({ address, networkKey }) {
		const accountId = generateAccountId({ address, networkKey });
		const legacyAccount = this.getAccountWithoutCaseSensitive(accountId);
		if (legacyAccount) return { ...legacyAccount, isLegacy: true };
		const derivedAccount = await this.getAccountFromIdentity(accountId);
		if (derivedAccount) return { ...derivedAccount, isLegacy: false };
		return null;
	}

	async getAccountFromIdentity(accountIdOrAddress) {
		const isAccountId = accountIdOrAddress.split(':').length > 1;
		let targetPath = null;
		let targetIdentity = null;
		let targetAccountId = null;
		for (const identity of this.state.identities) {
			const searchList = Array.from(identity.addresses.entries());
			for (const [addressKey, path] of searchList) {
				const networkKey = getNetworkKeyByPath(path);
				let accountId, address;
				if (isEthereumAccountId(addressKey)) {
					accountId = addressKey;
					address = extractAddressFromAccountId(addressKey);
				} else {
					accountId = generateAccountId({ address: addressKey, networkKey });
					address = addressKey;
				}
				const searchAccountIdOrAddress = isAccountId ? accountId : address;
				const found = isEthereumAccountId(accountId)
					? searchAccountIdOrAddress.toLowerCase() ===
					  accountIdOrAddress.toLowerCase()
					: searchAccountIdOrAddress === accountIdOrAddress;
				if (found) {
					targetPath = path;
					targetIdentity = identity;
					targetAccountId = accountId;
					break;
				}
			}
		}

		if (!targetPath || !targetIdentity) return false;
		await this.setState({ currentIdentity: targetIdentity });

		const metaData = targetIdentity.meta.get(targetPath);
		const networkKey = getNetworkKeyByPath(targetPath);
		return {
			...metaData,
			...targetIdentity,
			accountId: targetAccountId,
			identity: targetIdentity,
			isBip39: true,
			isLegacy: false,
			networkKey,
			path: targetPath
		};
	}

	async getAccountByAddress(address) {
		if (!address) {
			return false;
		}

		for (let v of this.state.accounts.values()) {
			if (v.address.toLowerCase() === address.toLowerCase()) {
				return { ...v, isLegacy: true };
			}
		}
		return await this.getAccountFromIdentity(address);
	}

	getSelected() {
		return this.state.accounts.get(this.state.selectedKey);
	}

	getSelectedKey() {
		return this.state.selectedKey;
	}

	getAccounts() {
		return this.state.accounts;
	}

	async enableBiometric(accountKey, pin) {
		const account = this.state.accounts.get(accountKey);
		await securePut(account.pinKey, pin);
		await this.updateAccount(accountKey, { biometricEnabled: true });
		return this.save(accountKey);
	}

	async disableBiometric(accountKey) {
		const account = this.state.accounts.get(accountKey);
		await secureDelete(account.pinKey);
		await this.updateAccount(accountKey, {
			biometricEnabled: false,
			pinKey: v4()
		});
		return this.save(accountKey);
	}

	async updateBiometric(accountKey, account, pin) {
		return secureDelete(account.pinKey)
			.catch(() => {
				account.pinKey = v4();
			})
			.finally(() => securePut(account.pinKey, pin));
	}

	async identityEnableBiometric(pin) {
		await securePut(this.state.currentIdentity.pinKey, pin);
		const updatedCurrentIdentity = deepCopyIdentity(this.state.currentIdentity);
		updatedCurrentIdentity.biometricEnabled = true;
		await this.setState({ currentIdentity: updatedCurrentIdentity });
		await this._updateIdentitiesWithCurrentIdentity();
	}

	async identityDisableBiometric() {
		const identity = deepCopyIdentity(this.state.currentIdentity);
		await secureDelete(identity.pinKey);
		identity.biometricEnabled = false;
		identity.pinKey = v4();
		await this.setState({ currentIdentity: identity });
		await this._updateIdentitiesWithCurrentIdentity();
	}

	getIdentityByAccountId(accountId) {
		const networkProtocol = accountId.split(':')[0];
		const searchAddress =
			networkProtocol === NetworkProtocols.SUBSTRATE
				? extractAddressFromAccountId(accountId)
				: accountId;
		return this.state.identities.find(identity =>
			identity.addresses.has(searchAddress)
		);
	}

	getNewIdentity() {
		return this.state.newIdentity;
	}

	async resetCurrentIdentity() {
		await this.setState({ currentIdentity: null });
	}

	async saveNewIdentity(seedPhrase, pin) {
		const updatedIdentity = deepCopyIdentity(this.state.newIdentity);
		//TODO encrypt seedPhrase with password in the future version,
		// current encryption with only seedPhrase is compatible.
		updatedIdentity.encryptedSeed = await encryptData(seedPhrase, pin);
		const newIdentities = this.state.identities.concat(updatedIdentity);
		this.setState({
			currentIdentity: updatedIdentity,
			identities: newIdentities,
			newIdentity: emptyIdentity()
		});
		await saveIdentities(newIdentities);
	}

	async selectIdentity(identity) {
		await this.setState({ currentIdentity: identity });
	}

	updateNewIdentity(identityUpdate) {
		this.setState({
			newIdentity: { ...this.state.newIdentity, ...identityUpdate }
		});
	}

	async updateCurrentIdentity(updatedIdentity) {
		try {
			await this.setState({
				currentIdentity: updatedIdentity
			});
			await this._updateIdentitiesWithCurrentIdentity();
		} catch (e) {
			console.warn('derive new Path error', e);
			return false;
		}
		return true;
	}

	async _updateIdentitiesWithCurrentIdentity() {
		const newIdentities = deepCopyIdentities(this.state.identities);
		const identityIndex = newIdentities.findIndex(
			identity =>
				identity.encryptedSeed === this.state.currentIdentity.encryptedSeed
		);
		newIdentities.splice(identityIndex, 1, this.state.currentIdentity);
		this.setState({ identities: newIdentities });
		await saveIdentities(newIdentities);
	}

	async updateIdentityName(name) {
		const updatedCurrentIdentity = deepCopyIdentity(this.state.currentIdentity);
		updatedCurrentIdentity.name = name;
		try {
			await this.setState({ currentIdentity: updatedCurrentIdentity });
			await this._updateIdentitiesWithCurrentIdentity();
		} catch (e) {
			console.warn('update identity name error', e);
		}
	}

	async updatePathName(path, name) {
		const updatedCurrentIdentity = deepCopyIdentity(this.state.currentIdentity);
		const updatedPathMeta = Object.assign(
			{},
			updatedCurrentIdentity.meta.get(path),
			{ name }
		);
		updatedCurrentIdentity.meta.set(path, updatedPathMeta);
		try {
			await this.setState({ currentIdentity: updatedCurrentIdentity });
			await this._updateIdentitiesWithCurrentIdentity();
		} catch (e) {
			console.warn('update path name error', e);
		}
	}

	async deriveNewPath(newPath, seedPhrase, networkKey, name) {
		const prefix = NETWORK_LIST[networkKey].prefix;
		const updatedCurrentIdentity = deepCopyIdentity(this.state.currentIdentity);
		const suri = constructSURI({
			derivePath: newPath,
			password: '',
			phrase: seedPhrase
		});
		let address = '';
		try {
			address = await substrateAddress(suri, prefix);
		} catch (e) {
			return false;
		}
		if (address === '') return false;
		if (updatedCurrentIdentity.meta.has(newPath)) return false;
		updatedCurrentIdentity.meta.set(newPath, {
			address,
			createdAt: new Date().getTime(),
			name,
			updatedAt: new Date().getTime()
		});
		updatedCurrentIdentity.addresses.set(address, newPath);
		return await this.updateCurrentIdentity(updatedCurrentIdentity);
	}

	async deletePath(path) {
		const updatedCurrentIdentity = deepCopyIdentity(this.state.currentIdentity);
		const { address } = updatedCurrentIdentity.meta.get(path);
		updatedCurrentIdentity.meta.delete(path);
		updatedCurrentIdentity.addresses.delete(getAddressKeyByPath(address, path));

		try {
			await this.setState({
				currentIdentity: updatedCurrentIdentity
			});
			await this._updateIdentitiesWithCurrentIdentity();
		} catch (e) {
			console.warn('derive new Path error', e);
			return false;
		}
		return true;
	}

	async deleteCurrentIdentity() {
		try {
			const newIdentities = deepCopyIdentities(this.state.identities);
			const identityIndex = newIdentities.findIndex(
				identity =>
					identity.encryptedSeed === this.state.currentIdentity.encryptedSeed
			);
			newIdentities.splice(identityIndex, 1);
			this.setState({
				currentIdentity: newIdentities.length >= 1 ? newIdentities[0] : null,
				identities: newIdentities
			});
			await saveIdentities(newIdentities);
			return true;
		} catch (e) {
			return false;
		}
	}
}
