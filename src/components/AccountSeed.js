'use strict'

import React, { Component, PropTypes } from 'react'
import { TextInput, StyleSheet } from 'react-native'

export default class AccountSeed extends Component {
  static propTypes = {
    seed: PropTypes.string.isRequired,
    onChangeText: PropTypes.func.isRequired
  }

  constructor (props) {
    super(props)
    this.state = {
      text: this.props.seed
    }
  }

  render () {
    return (
      <TextInput
        style={styles.input}
        placeholder='the brain wallet seed'
        editable
        multiline
        returnKeyType='default'
        numberOfLines={6}
        fontSize={12}
        onChangeText={(text) => {
          this.setState({
            text: text
          })
          this.props.onChangeText(text)
        }}
        value={this.state.text}
        maxLength={240}
      />
    )
  }
}

const styles = StyleSheet.create({
  input: {
    height: 120,
    fontWeight: 'bold'
  }
})
