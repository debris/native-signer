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

export default {
	ethClassic:
		'data:image/png;base64,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',
	ethereum:
		'data:image/png;base64,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',
	kusama:
		'data:image/png;base64,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',
	substrateDev:
		'data:image/png;base64,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'
};
