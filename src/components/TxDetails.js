'use strict'

import React, { Component, PropTypes } from 'react'
import { ScrollView, View, Text, Button } from 'react-native'
import AppStyles from '../styles'

export default class Send extends Component {
  static propTypes = {
    nextButtonTitle: PropTypes.string.isRequired,
    nextButtonDescription: PropTypes.string.isRequired,
    nextButtonAction: PropTypes.func.isRequired,
    txRecipientAddress: PropTypes.string.isRequired,
    txValue: PropTypes.string.isRequired,
    txNonce: PropTypes.string.isRequired,
    txGas: PropTypes.string.isRequired,
    txGasPrice: PropTypes.string.isRequired,
    txData: PropTypes.string.isRequired
  }

  render () {
    return (
      <ScrollView style={AppStyles.view}>
        <Text style={AppStyles.hintText}>recipient address</Text>
        <Text style={AppStyles.valueText}>{this.props.txRecipientAddress}</Text>
        <Text style={AppStyles.hintText}>amount to transfer (in ETH)</Text>
        <Text style={AppStyles.valueText}>{this.props.txValue}</Text>
        <Text style={AppStyles.hintText}>nonce</Text>
        <Text style={AppStyles.valueText}>{this.props.txNonce}</Text>
        <Text style={AppStyles.hintText}>gas</Text>
        <Text style={AppStyles.valueText}>{this.props.txGas}</Text>
        <Text style={AppStyles.hintText}>gasPrice</Text>
        <Text style={AppStyles.valueText}>{this.props.txGasPrice}</Text>
        <Text style={AppStyles.hintText}>data</Text>
        <Text style={AppStyles.valueText}>{this.props.txData}</Text>
        <View style={AppStyles.buttonContainer}>
          <Button
            onPress={() => this.props.nextButtonAction()}
            title={this.props.nextButtonTitle}
            color='green'
            accessibilityLabel={this.props.nextButtonDescription}
        />
        </View>
      </ScrollView>
    )
  }
}
