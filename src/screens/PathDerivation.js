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

import React, { useState } from 'react';
import { withNavigation } from 'react-navigation';
import { withAccountStore } from '../util/HOC';
import { Text, View } from 'react-native';
import TextInput from '../components/TextInput';
import Button from '../components/Button';
import { validateDerivedPath } from '../util/identitiesUtils';
import { unlockSeed } from '../util/navigationHelpers';
import AccountCard from '../components/AccountCard';
import { NETWORK_LIST, UnknownNetworkKeys } from '../constants';

function PathDerivation({ accounts, navigation }) {
	const networkKey = navigation.getParam(
		'networkKey',
		UnknownNetworkKeys.UNKNOWN
	);

	const [derivationPath, setDerivationPath] = useState('');
	const [keyPairsName, setKeyPairsName] = useState('');
	const [isPathValid, setIsPathValid] = useState(true);
	const completePath = `//${NETWORK_LIST[networkKey].pathId}${derivationPath}`;

	return (
		<View>
			<Text>Derivation</Text>
			{!isPathValid && <Text>Invalid Path</Text>}
			<Text>Display Name</Text>
			<TextInput
				value={keyPairsName}
				onChangeText={keyParisName => setKeyPairsName(keyParisName.trim())}
			/>
			<Text>Path</Text>
			<TextInput value={derivationPath} onChangeText={setDerivationPath} />
			{networkKey !== '' && (
				<AccountCard
					address={''}
					networkKey={networkKey}
					title={NETWORK_LIST[networkKey].title}
				/>
			)}

			<Button
				title="Derive Address"
				onPress={async () => {
					if (!validateDerivedPath(derivationPath)) {
						return setIsPathValid(false);
					}
					const seed = await unlockSeed(navigation);
					const derivationSucceed = await accounts.deriveNewPath(
						completePath,
						seed,
						NETWORK_LIST[networkKey].prefix
					);
					if (derivationSucceed) {
						navigation.navigate('PathsList', { networkKey });
					} else {
						setIsPathValid(false);
					}
				}}
			/>
		</View>
	);
}

export default withAccountStore(withNavigation(PathDerivation));