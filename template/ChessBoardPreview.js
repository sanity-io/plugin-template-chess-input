import React from 'react'
import DefaultPreview from 'part:@sanity/components/previews/default'
import ChessBoard from './ChessBoard'
import styles from './ChessBoardPreview.css'

const ChessBoardBlockPreview = props => {
  const value = props.value || {}
  const title = value.title || '<Untitled>'
  return (
    <div className={styles.container}>
      <div className={styles.board}>
        <ChessBoard allowMoves={false} drawLabels={false} board={value.board || []} />
      </div>
      <h2 className={styles.title}>{title}</h2>
      <p>{value.description || ''}</p>
    </div>
  )
}

class ChessBoardPreview extends React.Component {
  render() {
    // No room to show a big chess board in lists, so just defer to the default in those cases
    if (this.props.layout !== 'block') {
      return <DefaultPreview item={this.props.value} {...this.props} />
    }

    // Inside of the block content editor, we'll allow ourselves a richer preview
    return <ChessBoardBlockPreview {...this.props} />
  }
}

export default ChessBoardPreview
