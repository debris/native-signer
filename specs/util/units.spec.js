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

import '@polkadot/types/injector';

import { GenericCall } from '@polkadot/types';
import Metadata from '@polkadot/metadata';
import Call from '@polkadot/types/primitive/Generic/Call';
import { formatBalance } from '@polkadot/util';

import kusamaData from '../../src/util/static-kusama';
import { fromWei } from '../../src/util/units';

describe('units', () => {
	describe('ethereum', () => {
		it('should properly convert units from wei', () => {
			let wei = '5208';
			let ether = fromWei(wei);
			expect(ether).toEqual('0.000000000000021');
		});

		it('should return BigNumber for undefined values', () => {
			expect(fromWei(null)).toEqual('0');
			expect(fromWei(undefined)).toEqual('0');
			expect(fromWei(0)).toEqual('0');
			expect(fromWei('0')).toEqual('0');
			expect(fromWei('')).toEqual('0');
		});
	});

	describe('kusama', () => {
		let method_1;
		let method_2;
		let method_3;

		beforeAll(() => {
			const metadata = new Metadata(kusamaData);

			GenericCall.injectMetadata(metadata);

			formatBalance.setDefaults({
				decimals: 12,
				unit: 'KSM'
			});

			method_1 = new Call(
				'0x0400ffd541fa133def7268cc0e5213aebf10ec04b822d59fb7556341f4e49911fc110a0b00b04e2bde6f'
			);
			method_2 = new Call(
				'0x0400ffd541fa133def7268cc0e5213aebf10ec04b822d59fb7556341f4e49911fc110ae2d45a1d'
			);
			method_3 = new Call(
				'0x0400ffd9d249ea49e9ae53fc0df3df40d3b070c88e387c265841fe2f3362970d864fdf1f0000606b82534ae05e4508'
			);
		});

		it('should format KSM', () => {
			const { args, meta } = method_1;

			let result = {};
			for (let i = 0; i < meta.args.length; i++) {
				let value;
				if (
					args[i].toRawType() === 'Balance' ||
					args[i].toRawType() === 'Compact<Balance>'
				) {
					value = formatBalance(args[i].toString());
				} else {
					value = args[i].toString();
				}
				result[meta.args[i].name.toString()] = value;
			}

			expect(result.dest).toBe(
				'5GtKezSWWfXCNdnC4kkb3nRF9tn3NiN6ZWSEf7UaFdfMUanc'
			);
			expect(result.value).toBe('123.000 KSM');
		});

		it('should format decimals for less than one KSM', () => {
			const { args, meta } = method_2;

			let result = {};
			for (let i = 0; i < meta.args.length; i++) {
				let value;
				if (
					args[i].toRawType() === 'Balance' ||
					args[i].toRawType() === 'Compact<Balance>'
				) {
					value = formatBalance(args[i].toString(), true, 12);
				} else {
					value = args[i].toString();
				}
				result[meta.args[i].name.toString()] = value;
			}

			expect(result.dest).toBe(
				'5GtKezSWWfXCNdnC4kkb3nRF9tn3NiN6ZWSEf7UaFdfMUanc'
			);
			expect(result.value).toBe('123.123µ KSM');
		});

		it('should format absurdly large KSM', () => {
			const { args, meta } = method_3;

			let result = {};
			for (let i = 0; i < meta.args.length; i++) {
				let value;
				if (
					args[i].toRawType() === 'Balance' ||
					args[i].toRawType() === 'Compact<Balance>'
				) {
					value = formatBalance(args[i].toString(), true, 12);
				} else {
					value = args[i].toString();
				}
				result[meta.args[i].name.toString()] = value;
			}

			expect(result.dest).toBe(
				'5GzJiY3oG9LcyDiJbEJ6UF8jDF1AGeE2MgeXgSwgGCPopWsb'
			);
			expect(result.value).toBe('9.999T KSM');
		});
	});
});
