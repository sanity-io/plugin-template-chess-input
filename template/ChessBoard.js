import React from 'react'
import Chess from 'react-chess'

/**
 * Never compromise on data structure...
 * If a data structure allows for easier querying and more structured data,
 * it's usually better to make sure it's stored as such and converted to a
 * different format if the input component requires it.
 *
 * Here, we're just wrapping an existing React component, transforming the
 * chess board data from a format that allows querying on specific pieces OR
 * position, to the format wanted by the renderer/input component, where the
 * two are combined into an algebraic notation
 **/
const ChessBoard = props => {
  const pieces = props.board.map(item => `${item.piece}@${item.position}`)
  return <Chess pieces={pieces} {...props} />
}

export default ChessBoard

