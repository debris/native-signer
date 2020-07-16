// Copyright 2015-2020 Parity Technologies (UK) Ltd.
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

import React, { useContext, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, Animated, Text, Easing } from 'react-native';

import Button from 'components/Button';
import { Action, AlertStateContext } from 'stores/alertContext';
import colors from 'styles/colors';
import fontStyles from 'styles/fontStyles';

export default function CustomAlert(): React.ReactElement {
	const { title, index, message, actions } = useContext(AlertStateContext);
	/* eslint-disable-next-line react-hooks/exhaustive-deps */
	const animatedValue = useMemo(() => new Animated.Value(1), [index]);
	const [alertDisplay, setAlertDisplay] = useState<boolean>(false);

	useEffect(() => {
		setAlertDisplay(true);
		if (actions.length === 0) {
			Animated.timing(animatedValue, {
				duration: 1000,
				easing: Easing.poly(8),
				toValue: 0,
				useNativeDriver: false
			}).start(() => {
				setAlertDisplay(false);
			});
		}
		/* eslint-disable-next-line react-hooks/exhaustive-deps */
	}, [index]);

	const renderActions = (action: Action): React.ReactElement => (
		<Button
			onlyText={true}
			small={true}
			title={action.text}
			onPress={(): any => {
				action.onClick();
				setAlertDisplay(false);
			}}
			style={styles.button}
		/>
	);

	if (alertDisplay) {
		return (
			<Animated.View style={{ ...styles.background, opacity: animatedValue }}>
				<View style={styles.body}>
					{title !== '' && <Text style={styles.textTitle}>{title}</Text>}
					<Text style={styles.textMessage}>{message}</Text>
					{actions !== [] && <View style={styles.actionsContainer}>
						{actions.map(renderActions)}
					</View>}
				</View>
			</Animated.View>
		);
	} else {
		return null;
	}
}

const styles = StyleSheet.create({
	actionsContainer: {
		marginTop: 20
	},
	background: {
		alignItems: 'center',
		justifyContent: 'center',
		position: 'absolute',
		top: 80,
		width: '100%',
		zIndex: 100
	},
	body: {
		backgroundColor: colors.background.alert,
		paddingHorizontal: 20,
		paddingVertical: 20,
		width: '90%'
	},
	button: {
		marginVertical: 0
	},
	textMessage: {
		...fontStyles.h2
	},
	textTitle: {
		paddingVertical: 10,
		...fontStyles.h1
	}
});
