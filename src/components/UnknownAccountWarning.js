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

'use strict';

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import colors from '../colors';
import fonts from '../fonts';

export default function UnknownAccountWarning({ isPath }) {
	return (
		<View style={styles.warningView}>
			<Text style={styles.warningTitle}>Warning</Text>
			{isPath ? (
				<Text style={styles.warningText}>
					The account is now using Polkadot Canary Address Format.
					{'\n'}
					In the future user may specify different address formats like Polkadot
					Live, which will lead to a different address.
				</Text>
			) : (
				<Text style={styles.warningText}>
					This account wasn't retrieved successfully. This could be because its
					network isn't supported, or you upgraded Parity Signer without wiping
					your device and this account couldn't be migrated.
					{'\n'}
					{'\n'}
					To be able to use this account you need to:
					{'\n'}- write down its recovery phrase
					{'\n'}- delete it
					{'\n'}- recover/derive it
					{'\n'}
				</Text>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	warningText: {
		color: colors.bg_text,
		fontFamily: fonts.regular
	},
	warningTitle: {
		color: colors.bg_alert,
		fontFamily: fonts.bold,
		fontSize: 20,
		marginBottom: 10
	},
	warningView: {
		padding: 20
	}
});
