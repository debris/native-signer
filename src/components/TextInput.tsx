// Copyright 2015-2020 Parity Technologies (UK) Ltd.
// Modifications Copyright (c) 2021 Thibaut Sardan

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import React from 'react';
import { StyleSheet, Text, TextInput as TextInputOrigin, TextInputProps, TextStyle, View } from 'react-native';
import colors from 'styles/colors';
import fontStyles from 'styles/fontStyles';

interface Props extends TextInputProps {
	fixedPrefix?: string;
	focus?: boolean;
	label?: string;
	error?: boolean;
}

export default class TextInput extends React.PureComponent<Props> {
	static defaultProps = { focus: false };
	input: TextInputOrigin | null = null;

	// Methods:
	focus(): void {
		this.input?.focus();
	}

	componentDidUpdate(): void {
		const { focus } = this.props;

		focus && this.focus();
	}

	renderLabel(): React.ReactNode {
		const { label } = this.props;

		if (!label) return;

		return <Text style={styles.label}>{label}</Text>;
	}

	render(): React.ReactElement {
		const { error, fixedPrefix, style } = this.props;
		const finalInputStyles: TextStyle[] = [styles.input];

		if (error) {
			finalInputStyles.push(styles.input_error);
		}

		return (
			<View style={styles.body}>
				{this.renderLabel()}
				<View style={styles.viewStyle}>
					{fixedPrefix && (
						<Text style={[fontStyles.h2, finalInputStyles, styles.inputFixed]}>
							{fixedPrefix}
						</Text>
					)}
					<TextInputOrigin
						autoCapitalize="none"
						keyboardAppearance="dark"
						ref={(input: TextInputOrigin): any => (this.input = input)}
						underlineColorAndroid="transparent"
						{...this.props}
						placeholderTextColor={colors.text.faded}
						selectionColor={colors.border.light}
						style={[fontStyles.h2, finalInputStyles, style]}
					/>
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	body: {
		marginVertical: 8,
		paddingHorizontal: 16
	},
	input: {
		borderBottomColor: colors.border.light,
		borderBottomWidth: 0.8,
		flex: 1,
		height: 40,
		padding: 0,
		paddingTop: 8
	},
	inputFixed: {
		color: '#888',
		flex: 0,
		paddingTop: 11.5
	},
	input_error: { borderBottomColor: colors.signal.error },
	label: {
		marginBottom: 3,
		...fontStyles.t_regular
	},
	viewStyle: { flexDirection: 'row' }
});
