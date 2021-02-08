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

import React from 'react';
import { Modal, StyleSheet, TouchableWithoutFeedback, View, ViewStyle } from 'react-native';

interface Props {
	animationType: 'none' | 'slide' | 'fade';
	setVisible: (isVisible: boolean) => void;
	style?: ViewStyle;
	testID?: string;
	visible: boolean;
	children: any;
}

export default function TransparentBackground({ animationType, children, setVisible, style, testID, visible }: Props): React.ReactElement {
	return (
		<Modal
			animationType={animationType}
			onRequestClose={(): void => setVisible(false)}
			transparent={true}
			visible={visible}
		>
			<TouchableWithoutFeedback
				onPressIn={(): void => setVisible(false)}
				style={{ flex: 1 }}
			>
				<View
					style={StyleSheet.flatten([styles.container, style])}
					testID={testID}
				>
					{children}
				</View>
			</TouchableWithoutFeedback>
		</Modal>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: 'rgba(0,0,0,0.8)',
		flex: 1
	}
});
