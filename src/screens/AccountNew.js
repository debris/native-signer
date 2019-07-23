// Copyright 2015-2017 Parity Technologies (UK) Ltd.
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
import { StyleSheet, ScrollView, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { Subscribe } from 'unstated';

import colors from '../colors';
import AccountIconChooser from '../components/AccountIconChooser';
import Background from '../components/Background';
import Button from '../components/Button';
import TextInput from '../components/TextInput';
import TouchableItem from '../components/TouchableItem';
import { DEFAULT_NETWORK_COLOR, NETWORK_COLOR, NETWORK_TITLES } from '../constants';
import AccountsStore from '../stores/AccountsStore';

export default class AccountNew extends React.Component {
  static navigationOptions = {
    title: 'New Account',
    headerBackTitle: 'Back'
  };
  render() {
    return (
      <Subscribe to={[AccountsStore]}>
        {accounts => <AccountNewView {...this.props} accounts={accounts} />}
      </Subscribe>
    );
  }
}

class AccountNewView extends React.Component {
  constructor(props) {
    super(props);

    this.state = { ...this.props.accounts.getNew() };
  }

  render() {
    const { accounts, navigation } = this.props;
    const selected = this.state
    const chainId = selected.chainId;

    if (!selected) {
      return null;
    }

    return (
      <View style={styles.body}>
        <KeyboardAwareScrollView>
          <Background />
          <ScrollView
            style={{ padding: 20 }}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="always"
            containerStyle={styles.bodyContainer}
          >
            <View style={styles.top}>
              <Text style={styles.titleTop}>CREATE ACCOUNT</Text>
              <Text style={styles.title}>CHOOSE NETWORK</Text>
              <TouchableItem
                style={[
                  styles.card,
                  {
                    backgroundColor:
                      NETWORK_COLOR[chainId] || DEFAULT_NETWORK_COLOR
                  }
                ]}
                onPress={() =>
                  navigation.navigate(
                    'AccountNetworkChooser',
                    { onChange: (chainId) => this.setState({chainId}) }
                  )
                }
              >
                <Text
                  style={[
                    styles.cardText,
                    {
                      color: NETWORK_COLOR[chainId]
                        ? colors.card_bg
                        : colors.card_text
                    }
                  ]}
                >
                  {NETWORK_TITLES[chainId]}
                </Text>
              </TouchableItem>
              <Text style={[styles.title, { marginTop: 20 }]}>
                CHOOSE AN IDENTICON
              </Text>
              <AccountIconChooser
                value={selected && selected.seed && selected.address}
                onChange={({ address, seed }) => this.setState({ address, seed})}
              />
              <Text style={styles.title}>ACCOUNT NAME</Text>
              <TextInput
                onChangeText={name => this.setState({name})}
                value={selected && selected.name}
                placeholder="Enter a new account name"
              />
            </View>
            <View style={styles.bottom}>
              <Text style={styles.hintText}>
                On the next step you will be asked to backup your account, get pen
                and paper ready
              </Text>
              <Button
                buttonStyles={styles.nextStep}
                title="Next Step"
                disabled={ !selected.seed || !selected.name }
                onPress={() => {
                  accounts.updateNew({...selected});
                  navigation.navigate('AccountBackup', {
                    isNew: true,
                    isWelcome: navigation.getParam('isWelcome')
                  });
                }}
              />
            </View>
          </ScrollView>
        </KeyboardAwareScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  body: {
    backgroundColor: colors.bg,
    paddingBottom: 20,
    flex: 1,
    overflow: 'hidden'
  },
  bodyContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  top: {
    flex: 1
  },
  bottom: {
    flexBasis: 50,
    paddingBottom: 15
  },
  title: {
    fontFamily: 'Manifold CF',
    color: colors.bg_text_sec,
    fontSize: 18,
    fontWeight: 'bold',
    paddingBottom: 20
  },
  titleTop: {
    color: colors.bg_text_sec,
    fontSize: 24,
    fontWeight: 'bold',
    paddingBottom: 20,
    textAlign: 'center'
  },
  hintText: {
    fontFamily: 'Manifold CF',
    textAlign: 'center',
    paddingTop: 20,
    color: colors.bg_text_sec,
    fontWeight: '800',
    fontSize: 12
  },
  nextStep: {
    marginTop: 15
  },
  card: {
    backgroundColor: colors.card_bg,
    padding: 20
  },
  cardText: {
    color: colors.card_text,
    fontFamily: 'Manifold CF',
    fontSize: 20,
    fontWeight: 'bold'
  }
});
