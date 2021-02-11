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

import Button from 'components/Button';
import CustomScrollView from 'components/CustomScrollView';
import Markdown from 'components/Markdown';
import TouchableItem from 'components/TouchableItem';
import testIDs from 'e2e/testIDs';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from 'styles/colors';
import containerStyles from 'styles/containerStyles';
import fontStyles from 'styles/fontStyles';
import { NavigationProps } from 'types/props';
import { saveToCAndPPConfirmation } from 'utils/db';

import tac from '../../docs/terms-and-conditions.md';
import { useTac } from '../hooks/useTac';

export default function TermsAndConditions(props: NavigationProps<'TermsAndConditions'>): React.ReactElement {
	const [ppAgreement, setPpAgreement] = useState<boolean>(false);
	const [tacAgreement, setTacAgreement] = useState<boolean>(false);

	const { policyConfirmed, setPolicyConfirmed } = useTac();
	const { navigation } = props;

	const onConfirm = async (): Promise<void> => {
		await saveToCAndPPConfirmation();
		setPolicyConfirmed(true);
	};

	return (
		<View style={containerStyles.background}
			testID={testIDs.TacScreen.tacView}>
			<CustomScrollView contentContainerStyle={{ paddingHorizontal: 16 }}>
				<Markdown>{tac}</Markdown>
			</CustomScrollView>

			{!policyConfirmed && (
				<View>
					<TouchableItem
						onPress={(): void => setTacAgreement(!tacAgreement)}
						style={{
							alignItems: 'center',
							flexDirection: 'row',
							paddingHorizontal: 16,
							paddingVertical: 10
						}}
						testID={testIDs.TacScreen.agreeTacButton}
					>
						<Icon
							name={tacAgreement ? 'checkbox-marked' : 'checkbox-blank-outline'}
							style={styles.icon}
						/>

						<Text style={fontStyles.t_big}>
							{'  I agree to the terms and conditions'}
						</Text>
					</TouchableItem>
					<TouchableItem
						onPress={(): void => setPpAgreement(!ppAgreement)}
						style={{
							alignItems: 'center',
							flexDirection: 'row',
							paddingHorizontal: 16
						}}
					>
						<Icon
							name={ppAgreement ? 'checkbox-marked' : 'checkbox-blank-outline'}
							style={styles.icon}
							testID={testIDs.TacScreen.agreePrivacyButton}
						/>

						<Text style={fontStyles.t_big}>
							<Text>{'  I agree to the '}</Text>
							<Text
								onPress={(): void => {
									navigation.navigate('PrivacyPolicy');
								}}
								style={{ textDecorationLine: 'underline' }}
							>
								privacy policy
							</Text>
						</Text>
					</TouchableItem>

					<Button
						disabled={!ppAgreement || !tacAgreement}
						onPress={onConfirm}
						style={{ marginBottom: 24, marginTop: 16 }}
						testID={testIDs.TacScreen.nextButton}
						title="Next"
					/>
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	icon: {
		color: colors.text.faded,
		fontSize: 30
	}
});
