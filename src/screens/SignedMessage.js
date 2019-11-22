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

import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import colors from '../colors';
import QrView from '../components/QrView';
import { withScannerStore } from '../util/HOC';
import fontStyles from '../fontStyles';
import MessageDetailsCard from '../components/MessageDetailsCard';

export function SignedMessage({ scanner }) {
	const data = scanner.getSignedTxData();
	const isHash = scanner.getIsHash();
	const message = scanner.getMessage();

	useEffect(
		() =>
			function() {
				scanner.cleanup();
			},
		[scanner]
	);

	return (
		<ScrollView style={styles.body}>
			<Text style={styles.topTitle}>Signed Message</Text>
			<QrView data={data} />
			<MessageDetailsCard
				isHash={isHash}
				message={message}
				data={data}
				style={styles.messageDetail}
			/>
		</ScrollView>
	);
}

export default withScannerStore(SignedMessage);

const styles = StyleSheet.create({
	body: {
		backgroundColor: colors.bg,
		flex: 1,
		flexDirection: 'column',
		overflow: 'hidden'
	},
	messageDetail: {
		paddingHorizontal: 20
	},
	topTitle: {
		...fontStyles.h1,
		textAlign: 'center'
	}
});
