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
import { Keyboard, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

class KeyboardScrollView extends React.PureComponent {
	render() {
		const defaultProps = { enableAutomaticScroll: true };
		return Platform.select({
			android: (
				<KeyboardAwareScrollView
					keyboardDismissMode="on-drag"
					onScrollEndDrag={Keyboard.dismiss}
					keyboardShouldPersistTaps="handled"
					enableOnAndroid
					{...defaultProps}
					{...this.props}
				/>
			),
			ios: (
				<KeyboardAwareScrollView
					keyboardDismissMode="interactive"
					keyboardShouldPersistTaps="handled"
					{...defaultProps}
					{...this.props}
				/>
			)
		});
	}
}

export default KeyboardScrollView;
