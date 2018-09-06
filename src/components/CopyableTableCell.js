// @flow

import React from 'react'
import clipboard from "clipboard-polyfill"

import FontAwesomeIcon from '../vendor/@fortawesome/react-fontawesome'
import { truncateString } from '../utils/helpers'
import { isZenAsset } from '../utils/zenUtils'

type Props = {
  string: string,
  istx?: boolean
};

type State = {
  copyText: string
};
class CopyableTableCell extends React.Component<Props, State> {
  copyTimeout: TimeoutID
  state = {
    copyText: 'Copy',
  }
  componentWillUnmount() {
    clearTimeout(this.copyTimeout)
  }
  copyToClipboard = (string: string) => {
    clipboard.writeText(string)
    this.setState({ copyText: 'Copied to Clipboard' })
    this.copyTimeout = setTimeout(() => {
      this.setState({ copyText: 'Copy' })
    }, 1250)
  }

  get formattedString() {
    const { string } = this.props
    return !isZenAsset(string) ? truncateString(string) : string
  }
  renderString() {
    const { string, istx } = this.props
    return istx ? (
      <a target='_blank' rel='noreferrer noopener'
        href={`https://zp.io/tx/${string}`}>
        {this.formattedString}
      </a>
    ) : this.formattedString
  }

  render() {
    const { string } = this.props
    const { copyText } = this.state
    return (
      <td className="align-left copyable" title={string}>
        <span title={string}>
          { this.renderString() }{' '}
        </span>
        <span
          onClick={() => { this.copyToClipboard(string) }}
          data-balloon={copyText}
          data-balloon-pos="up"
        >
          <FontAwesomeIcon icon={['far', 'copy']} className="" />
        </span>
      </td>
    )
  }
}

export default CopyableTableCell
