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
import { Image, StyleSheet, Text, View, ViewStyle } from 'react-native';
import iconLogo from 'res/img/icon.png';
import colors from 'styles/colors';
import fonts from 'styles/fonts';

export default class HeaderLeftHome extends React.PureComponent<{
	style?: ViewStyle;
}> {
	render(): React.ReactElement {
		return (
			<View
				style={{
					alignItems: 'center',
					flexDirection: 'row',
					height: 48,
					paddingLeft: 15
				}}
			>
				<Image source={iconLogo}
					style={styles.logo} />
				<Text style={[styles.headerTextLeft, styles.t_bold]}>parity</Text>
				<Text style={styles.headerTextLeft}>signer</Text>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	headerTextLeft: {
		color: colors.text.main,
		fontFamily: fonts.light,
		fontSize: 14,
		marginRight: 2,
		marginTop: 15
	},
	logo: {
		height: 24,
		marginLeft: -8,
		marginTop: -5,
		width: 24
	},
	t_bold: { fontFamily: fonts.semiBold }
});
