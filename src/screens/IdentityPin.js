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

import React, { Component, useState } from 'react';
import { StyleSheet } from 'react-native';
import { withNavigation } from 'react-navigation';
import colors from '../colors';
import Background from '../components/Background';
import ButtonMainAction from '../components/ButtonMainAction';
import TextInput from '../components/TextInput';
import KeyboardScrollView from '../components/KeyboardScrollView';
import { withAccountStore } from '../util/HOC';
import testIDs from '../../e2e/testIDs';
import ScreenHeading from '../components/ScreenHeading';
import fontStyles from '../fontStyles';

export default withAccountStore(withNavigation(IdentityPin));

function IdentityPin({ navigation, accounts }) {
	const initialState = {
		confirmation: '',
		focusConfirmation: false,
		pin: '',
		pinMismatch: false,
		pinTooShort: false
	};
	const [state, setState] = useState(initialState);
	const updateState = delta => setState({ ...state, ...delta });

	const submit = async () => {
		const isIdentityCreation = navigation.getParam('isNew');
		const { pin, confirmation } = state;
		if (pin.length >= 6 && pin === confirmation) {
			if (isIdentityCreation) {
				const resolve = navigation.getParam('resolve');
				setState(initialState);
				resolve(pin);
			} else {
				// await accounts.save(accounts.getSelectedKey(), account, pin);
				// const resetAction = StackActions.reset({
				// 	actions: [
				// 		NavigationActions.navigate({ routeName: 'LegacyAccountList' }),
				// 		NavigationActions.navigate({ routeName: 'AccountDetails' })
				// 	],
				// 	index: 1, // FIXME workaround for now, use SwitchNavigator later: https://github.com/react-navigation/react-navigation/issues/1127#issuecomment-295841343
				// 	key: undefined
				// });
				// navigation.dispatch(resetAction);
			}
		} else {
			if (pin.length < 6) {
				updateState({ pinTooShort: true });
			} else if (pin !== confirmation) updateState({ pinMismatch: true });
		}
	};

	const testPin = async () => {
		const { pin } = state;
		if (pin.length >= 6) {
			try {
				const seed = await accounts.unlockIdentitySeed(pin);
				const resolve = navigation.getParam('resolve');
				setState(initialState);
				resolve(seed);
			} catch (e) {
				updateState({ pin: '', pinMismatch: true });
				//TODO record error times;
			}
		} else {
			updateState({ pinTooShort: true });
		}
	};

	const showHintOrError = () => {
		if (state.pinTooShort) {
			return ' Your pin must be at least 6 digits long!';
		} else if (state.pinMismatch) {
			return " Pin codes don't match!";
		}
		return ' Choose a PIN code with 6 or more digits';
	};

	const onPinInputChange = (stateName, pinInput) => {
		if (/^\d+$|^$/.test(pinInput)) {
			updateState({
				pinMismatch: false,
				pinTooShort: false,
				[stateName]: pinInput
			});
		}
	};

	const renderPinInput = () =>
		navigation.getParam('isUnlock', false) ? (
			<>
				<ScreenHeading
					title={'Unlock Identity'}
					error={state.pinMismatch || state.pinTooShort}
					subtitle={showHintOrError()}
				/>
				<PinInput
					label="PIN"
					autoFocus
					testID={testIDs.IdentityPin.unlockPinInput}
					returnKeyType="done"
					onChangeText={pin => onPinInputChange('pin', pin)}
					value={state.pin}
				/>
				<ButtonMainAction
					title={'Done'}
					bottom={false}
					onPress={testPin}
					testID={testIDs.IdentityPin.unlockPinButton}
				/>
			</>
		) : (
			<>
				<ScreenHeading
					title={'Set Identity PIN'}
					subtitle={showHintOrError()}
					error={state.pinMismatch || state.pinTooShort}
				/>

				<PinInput
					label="PIN"
					autoFocus
					testID={testIDs.IdentityPin.setPin}
					returnKeyType="next"
					onFocus={() => updateState({ focusConfirmation: false })}
					onSubmitEditing={() => {
						updateState({ focusConfirmation: true });
					}}
					onChangeText={pin => onPinInputChange('pin', pin)}
					value={state.pin}
				/>
				<PinInput
					label="Confirm PIN"
					returnKeyType="done"
					testID={testIDs.IdentityPin.confirmPin}
					focus={state.focusConfirmation}
					onChangeText={confirmation =>
						onPinInputChange('confirmation', confirmation)
					}
					value={state.confirmation}
				/>
				<ButtonMainAction
					title={'Done'}
					bottom={false}
					onPress={submit}
					testID={testIDs.IdentityPin.submitButton}
				/>
			</>
		);

	return (
		<KeyboardScrollView style={styles.body} extraHeight={120}>
			<Background />
			{renderPinInput()}
		</KeyboardScrollView>
	);
}

class PinInput extends Component {
	render() {
		return (
			<TextInput
				keyboardAppearance="dark"
				clearTextOnFocus
				editable
				fontSize={24}
				keyboardType="numeric"
				multiline={false}
				autoCorrect={false}
				numberOfLines={1}
				returnKeyType="next"
				secureTextEntry
				style={[fontStyles.t_seed, styles.pinInput]}
				{...this.props}
			/>
		);
	}
}

const styles = StyleSheet.create({
	body: {
		backgroundColor: colors.bg,
		flex: 1,
		overflow: 'hidden'
	},
	pinInput: {
		borderBottomColor: colors.bg_button,
		borderColor: colors.bg_button,
		minHeight: 48,
		paddingLeft: 10,
		paddingRight: 10
	}
});
