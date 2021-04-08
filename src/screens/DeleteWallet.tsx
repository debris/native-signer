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

import React, { useContext } from 'react';
import { View, Text } from 'react-native';
import { showMessage } from 'react-native-flash-message';

import { components } from 'styles';
import { AccountsContext } from 'stores/AccountsContext';
import Button from 'components/Button';
import { NavigationAccountIdentityProps } from 'types/props';
import { resetNavigationTo } from 'utils/navigationHelpers';

type Props = NavigationAccountIdentityProps<'DeleteWallet'>;

function DeleteWallet({ navigation, route }: Props): React.ReactElement {
	const accountsStore = useContext(AccountsContext);
	const { identity } = route.params;

	const deleteWallet = async (): Promise<void> => {
		try {
			resetNavigationTo(navigation, 'Settings');
			accountsStore.deleteWallet(identity);
			showMessage('Wallet deleted.');
		} catch (err) {
			console.error(err);
			showMessage('Failed to delete wallet.');
		}
	};

	return (
		<View style={components.page}>
			<Text style={components.textBlock}>Delete this wallet?</Text>
			<Text style={components.textBlock}>
				You will not be able to recover it unless you have its recovery key.
			</Text>
			<Button
				title="Delete"
				onPress={deleteWallet}
				fluid={true}
				negative={true}
			/>
		</View>
	);
}

export default DeleteWallet;
