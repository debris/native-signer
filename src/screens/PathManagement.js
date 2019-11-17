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
import { withAccountStore } from '../util/HOC';
import { withNavigation } from 'react-navigation';
import { ScrollView } from 'react-native';
import TextInput from '../components/TextInput';
import PathCard from '../components/PathCard';
import colors from '../colors';

function PathManagement({ accounts, navigation }) {
	const path = navigation.getParam('path', '');
	const { currentIdentity } = accounts.state;
	const pathName = currentIdentity.meta.get(path).name;

	return (
		<ScrollView style={{ backgroundColor: colors.bg }}>
			<PathCard identity={currentIdentity} path={path} />
			<TextInput
				label="Display Name"
				onChangeText={name => accounts.updatePathName(path, name)}
				value={pathName}
				placeholder="Enter a new identity name"
				focus={true}
			/>
		</ScrollView>
	);
}

export default withAccountStore(withNavigation(PathManagement));
