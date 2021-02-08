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

import NetInfo from '@react-native-community/netinfo';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import IdentitiesSwitch from 'components/IdentitiesSwitch';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import colors from 'styles/colors';
import { RootStackParamList } from 'types/routes';

import ButtonIcon from './ButtonIcon';

function SecurityHeader(): React.ReactElement {
	const [isConnected, setIsConnected] = useState(false);
	const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

	useEffect(() =>
		NetInfo.addEventListener(state => {
			setIsConnected(state.isConnected);
		}),
	[]);

	return (
		<View style={styles.body}>
			{isConnected && (
				<ButtonIcon
					iconColor={colors.signal.error}
					iconName="shield-off"
					iconSize={26}
					iconType="feather"
					onPress={(): void => navigation.navigate('Security')}
				/>
			)}
			<IdentitiesSwitch />
		</View>
	);
}

const styles = StyleSheet.create({
	body: {
		flexDirection: 'row',
		justifyContent: 'center'
	}
});

export default SecurityHeader;
