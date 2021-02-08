// Copyright 2015-2021 Parity Technologies (UK) Ltd.
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

import AccountCard from 'components/AccountCard';
import { SafeAreaScrollViewContainer } from 'components/SafeAreaContainer';
import TextInput from 'components/TextInput';
import React, { useContext } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { AccountsContext, AccountsContextState } from 'stores/AccountsContext';

const onNameInput = async (accountsStore: AccountsContextState,
	name: string): Promise<void> => {
	await accountsStore.updateSelectedAccount({ name });
	const { selectedKey } = accountsStore.state;
	const selectedAccount = accountsStore.getSelected()!;

	await accountsStore.save(selectedKey, selectedAccount);
};

export default function AccountEdit(): React.ReactElement {
	const accountsStore = useContext(AccountsContext);
	const selectedAccount = accountsStore.getSelected()!;

	if (!selectedAccount) {
		return <ScrollView bounces={false}
			style={styles.body} />;
	}

	return (
		<SafeAreaScrollViewContainer style={styles.body}>
			<AccountCard
				address={selectedAccount.address}
				networkKey={selectedAccount.networkKey}
				title={selectedAccount.name}
			/>
			<TextInput
				label="Account Name"
				onChangeText={(name: string): Promise<any> =>
					onNameInput(accountsStore, name)
				}
				placeholder="New name"
				style={{ marginBottom: 40 }}
				value={selectedAccount.name}
			/>
		</SafeAreaScrollViewContainer>
	);
}

const styles = StyleSheet.create({
	body: {
		alignContent: 'flex-start',
		paddingBottom: 40
	}
});
