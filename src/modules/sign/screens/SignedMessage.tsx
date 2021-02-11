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

import CompatibleCard from 'components/CompatibleCard';
import QrView from 'components/QrView';
import { SafeAreaScrollViewContainer } from 'components/SafeAreaContainer';
import Separator from 'components/Separator';
import testIDs from 'e2e/testIDs';
import MessageDetailsCard from 'modules/sign/components/MessageDetailsCard';
import PayloadDetailsCard from 'modules/sign/components/PayloadDetailsCard';
import strings from 'modules/sign/strings';
import styles from 'modules/sign/styles';
import React, { useContext, useEffect, useRef } from 'react';
import { Text, View } from 'react-native';
import { ScannerContext } from 'stores/ScannerContext';
import fontStyles from 'styles/fontStyles';
import { FoundAccount } from 'types/identityTypes';
import { isEthereumNetworkParams } from 'types/networkTypes';
import { NavigationProps, NavigationScannerProps } from 'types/props';

import { isU8a, u8aToHex } from '@polkadot/util';

import { AccountsContext, NetworksContext } from '../../../context';

interface Props extends NavigationScannerProps<'SignedMessage'> {
	sender: FoundAccount;
	message: string;
}

function SignedMessageView({ message, scannerStore, sender }: Props): React.ReactElement {
	const accountsStore = useContext(AccountsContext);
	const { dataToSign, isHash, signedData } = scannerStore.state;
	const { getNetwork } = useContext(NetworksContext);
	const senderNetworkParams = getNetwork(sender.networkKey);
	const isEthereum = isEthereumNetworkParams(senderNetworkParams);

	return (
		<SafeAreaScrollViewContainer>
			<Text style={styles.topTitle}>Signed Message</Text>
			<Separator
				shadow={true}
				style={{
					height: 0,
					marginVertical: 20
				}}
			/>
			<Text style={[fontStyles.h_subheading, { paddingHorizontal: 16 }]}>
				{'Scan to publish'}
			</Text>
			<View testID={testIDs.SignedMessage.qrView}>
				<QrView data={signedData} />
			</View>
			<CompatibleCard
				account={sender}
				accountsStore={accountsStore}
				titlePrefix={'from:'}
			/>
			{!isEthereum && dataToSign ? (
				<PayloadDetailsCard
					description={strings.INFO_MULTI_PART}
					networkKey={sender.networkKey}
					signature={signedData.toString()}
				/>
			) : null}
			<MessageDetailsCard
				data={isU8a(dataToSign) ? u8aToHex(dataToSign) : dataToSign.toString()}
				isHash={isHash ?? false}
				message={message}
				style={styles.bodyContent}
			/>
		</SafeAreaScrollViewContainer>
	);
}

export default function SignedMessage(props: NavigationProps<'SignedMessage'>): React.ReactElement {
	const scannerStore = useContext(ScannerContext);
	const { message, sender } = scannerStore.state;
	const cleanup = useRef(scannerStore.cleanup);

	useEffect(() => cleanup.current, [cleanup]);

	if (sender === null || message === null) return <View />;

	return (
		<SignedMessageView
			message={message}
			scannerStore={scannerStore}
			sender={sender}
			{...props}
		/>
	);
}
