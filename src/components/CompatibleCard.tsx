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

import PropTypes from 'prop-types';
import React from 'react';

import AccountCard from './AccountCard';
import PathCard from './PathCard';

import { AccountsContextState } from 'stores/AccountsContext';
import { FoundAccount } from 'types/identityTypes';
import { isLegacyFoundAccount } from 'utils/identitiesUtils';

const CompatibleCard = ({
	account,
	accountsStore,
	titlePrefix
}: {
	account: FoundAccount;
	accountsStore: AccountsContextState;
	titlePrefix?: string;
}): React.ReactElement =>
	isLegacyFoundAccount(account) || account.isLegacy === undefined ? (
		<AccountCard
			title={account.name}
			address={account.address}
			networkKey={account.networkKey || ''}
		/>
	) : (
		//Substrate tx do not need to render recipient
		<PathCard
			identity={accountsStore.getIdentityByAccountId(account.accountId)!}
			path={account.path}
			titlePrefix={titlePrefix}
		/>
	);

CompatibleCard.propTypes = {
	account: PropTypes.object.isRequired,
	accountsStore: PropTypes.object.isRequired,
	titlePrefix: PropTypes.string
};

export default CompatibleCard;
