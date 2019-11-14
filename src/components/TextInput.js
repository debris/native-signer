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

import PropTypes from 'prop-types';
import React from 'react';
import {
	StyleSheet,
	TextInput as TextInputOrigin,
	View,
	Text
} from 'react-native';
import fontStyles from '../fontStyles';
import colors from '../colors';

export default class TextInput extends React.PureComponent {
	static defaultProps = {
		focus: false
	};
	static propTypes = {
		fixedPrefix: PropTypes.string,
		style: PropTypes.object
	};

	// Methods:
	focus() {
		this.input.focus();
	}

	componentDidUpdate() {
		const { focus } = this.props;
		focus && this.focus();
	}

	render() {
		const { fixedPrefix, style, label, error } = this.props;
		const finalInputStyles = [styles.input];
		if (error) {
			finalInputStyles.push(styles.input_error);
		}
		const renderLabel = () => {
			if (!label) return;
			return (
				<Text style={[fontStyles.t_regular, { marginBottom: 3 }]}>{label}</Text>
			);
		};
		return (
			<View style={styles.body}>
				{renderLabel()}
				<View style={styles.viewStyle}>
					{fixedPrefix && (
						<Text style={[fontStyles.h2, finalInputStyles, styles.inputFixed]}>
							{fixedPrefix}
						</Text>
					)}
					<TextInputOrigin
						ref={input => {
							this.input = input;
						}}
						keyboardAppearance="dark"
						underlineColorAndroid="transparent"
						{...this.props}
						style={[fontStyles.h2, finalInputStyles, style]}
						placeholderTextColor={colors.card_bg_text_sec}
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
		borderBottomColor: colors.card_bg_text_sec,
		borderBottomWidth: 1,
		flex: 1,
		height: 40,
		padding: 0,
		paddingTop: 8
	},
	inputFixed: {
		color: colors.card_bg_text_sec,
		flex: 0,
		paddingTop: 11.5
	},
	input_error: {
		borderBottomColor: colors.bg_alert
	},
	viewStyle: {
		flexDirection: 'row'
	}
});
