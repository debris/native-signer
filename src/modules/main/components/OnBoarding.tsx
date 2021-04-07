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

import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { Text, View } from 'react-native';

import { fontStyles } from 'styles/index';
import { SafeAreaScrollViewContainer } from 'components/SafeAreaContainer';
import testIDs from 'e2e/testIDs';
import styles from 'modules/main/styles';
import { RootStackParamList } from 'types/routes';

export default function OnBoardingView({}: {}): React.ReactElement {
	const navigation: StackNavigationProp<RootStackParamList> = useNavigation();

	function TextButton({
		text,
		isRecover
	}: {
		text: string;
		isRecover: boolean;
	}): React.ReactElement {
		return (
			<Text
				style={[fontStyles.quote, { textDecorationLine: 'underline' }]}
				testID={
					isRecover ? testIDs.Wallet.recoverButton : testIDs.Wallet.createButton
				}
				onPress={(): void => navigation.navigate('CreateWallet', { isRecover })}
			>
				{text}
			</Text>
		);
	}

	return (
		<SafeAreaScrollViewContainer
			testID={testIDs.Wallet.noAccountScreen}
			contentContainerStyle={styles.scrollContent}
		>
			<View style={styles.onboardingWrapper}>
				<TextButton text="Create" isRecover={false} />
				<Text style={fontStyles.quote}> or </Text>
				<TextButton text="import" isRecover={true} />
				<Text style={fontStyles.quote}>a wallet to get started.</Text>
			</View>
		</SafeAreaScrollViewContainer>
	);
}
