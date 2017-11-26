import React, {Component} from 'react'
import {FormBuilderInput, PatchEvent, patches} from 'part:@sanity/form-builder'
import FormField from 'part:@sanity/components/formfields/default'
import ConfirmDialog from 'part:@sanity/components/dialogs/confirm'
import Fieldset from 'part:@sanity/components/fieldsets/default'
import Button from 'part:@sanity/components/buttons/default'
import ChessBoard from './ChessBoard'
import styles from './ChessBoard.css'

// The `part:@sanity/form-builder`-part exposes a set of patch helper methods which
// allows us to build fine-grained patches without too much work
const {insert, set, unset, setIfMissing} = patches

export default class ChessBoardInput extends Component {
  state = {}

  // When a user resets the board, emit a full set-patch targeting `board`.
  // This will replace the whole value for this field. When moving individual
  // pieces, we'll use more fine-grained patches
  handleInitializeBoard = () => {
    const {type, onChange} = this.props
    onChange(
      PatchEvent.from(
        // Make sure the field has the type name set, in case it has not been
        // initialized. We're setting these keys to the root of the object.
        setIfMissing({_type: type.name}),

        // Initialize a default board array. The second argument is the path
        // within the object, so `<fieldName>.board` in this case
        set(getDefaultLineup(), ['board'])
      )
    )
  }

  // While most input handling can (and probably should) be handled through
  // emitting patches to `props.onChange`, sometimes you need a little local state.
  // In this case, we want to keep track of the piece currently selected.
  handleSelectPiece = piece => {
    this.setState({selectedPiece: piece})
  }

  handleMovePiece = (piece, fromSquare, toSquare) => {
    const {type, onChange, value} = this.props
    const currentSelected = this.state.selectedPiece
    this.setState({selectedPiece: null})

    onChange(
      PatchEvent.from(
        // Always make sure to initialize - someone might have reset the board, or a script might
        // have nulled the field. Never assume the same exact state as you have locally.
        setIfMissing({_type: type.name, board: []}),

        // Unset "from"-position. This path declaration yields a JSONPath selector
        unset(['board', {position: fromSquare}]),
        // Unset any item at "to"-position (can't have multiple pieces at same square)
        unset(['board', {position: toSquare}]),
        // Insert the moved piece. We're inserting "after position -1", which means at
        // the end of the array. Make sure you're passing an array of elements.
        insert([{piece: piece.name, position: toSquare}], 'after', ['board', -1])
      )
    )
  }

  // We are using `FormBuilderInput` in the render method to layout the default controls
  // for the simple text fields `title` and `description`. The patches emitted do not
  // have a path set for them, as they are not aware of the surrounding context.
  // The patch event has a `prefixAll` method that can be used to set the field name
  handleTextFieldChange = (fieldName, patchEvent) => {
    const {onChange, type} = this.props

    // Prefix with field name, ergo `title` => `yourChessFieldName.title`
    const textPatch = patchEvent.prefixAll(fieldName)

    // Prepend an initializer patch, making sure the `_type` attribute is set
    onChange(textPatch.prepend(setIfMissing({_type: type.name})))
  }

  // When pressing the delete or backspace key and a square is selected, delete
  // the pieces at that position. Note how we're using the `unset` patch with a
  // selector. This will be transformed to a JSONPath selector.
  handleKeyUp = evt => {
    const {selectedPiece, pieces} = this.state
    const isDeleteEvent = evt.key === 'Delete' || evt.key === 'Backspace'
    if (!isDeleteEvent) {
      return
    }

    evt.preventDefault()
    if (!selectedPiece) {
      return
    }

    const {type, onChange} = this.props
    onChange(
      PatchEvent.from(
        // In this specific case, we don't need to initialize - if the `board` property
        // no longer exists, there is nothing to unset.
        unset(['board', {position: selectedPiece.position}])
      )
    )
  }

  componentDidMount() {
    document.addEventListener('keyup', this.handleKeyUp, false)
  }

  componentWillUnmount() {
    document.removeEventListener('keyup', this.handleKeyUp, false)
  }

  handleCancelReset = () => {
    this.setState({showConfirmReset: null})
  }

  handleConfirmReset = () => {
    this.setState({showConfirmReset: null})
    this.handleInitializeBoard()
  }

  handleShowResetPrompt = () => {
    this.setState({showConfirmReset: true})
  }

  render() {
    const {type, level, onChange} = this.props
    const value = this.props.value || {}
    const {board, title, description} = value
    const {showConfirmReset} = this.state
    const boardField = type.fields.find(field => field.name === 'board')
    const inputFields = type.fields.filter(field => field !== boardField)
    const handleReset = board ? this.handleShowResetPrompt : this.handleInitializeBoard

    return (
      // If you are rendering more than one field, you'll want to wrap them in a fieldset
      <Fieldset level={level} legend={type.title} description={type.description}>
        {showConfirmReset && (
          <ConfirmDialog onCancel={this.handleCancelReset} onConfirm={this.handleConfirmReset}>
            Are you sure you want to reset?
          </ConfirmDialog>
        )}

        {inputFields.map(field => (
          // If you just want default handling of a form field, pass on the responsibility
          // to a FormBuilderInput. This handles resolving of the right input type, etc.
          <FormBuilderInput
            key={field.name}
            type={field.type}
            value={value[field.name]}
            level={level + 1}
            onChange={patchEvent => this.handleTextFieldChange(field.name, patchEvent)}
          />
        ))}

        <Fieldset
          level={level + 1}
          legend={boardField.type.title}
          description={boardField.type.description}>
          {board && (
            <div className={styles.boardWrapper}>
              <ChessBoard
                allowMoves={true}
                onMovePiece={this.handleMovePiece}
                onSelectSquare={this.handleSelectPiece}
                board={board}
              />
            </div>
          )}

          <Button onClick={handleReset}>{board ? 'Reset board' : "Line 'em up!"}</Button>
        </Fieldset>
      </Fieldset>
    )
  }
}

function getDefaultLineup() {
  return [
    {position: 'a1', piece: 'R'},
    {position: 'a2', piece: 'P'},
    {position: 'a7', piece: 'p'},
    {position: 'a8', piece: 'r'},
    {position: 'b1', piece: 'N'},
    {position: 'b2', piece: 'P'},
    {position: 'b7', piece: 'p'},
    {position: 'b8', piece: 'n'},
    {position: 'c1', piece: 'B'},
    {position: 'c2', piece: 'P'},
    {position: 'c7', piece: 'p'},
    {position: 'c8', piece: 'b'},
    {position: 'd1', piece: 'Q'},
    {position: 'd2', piece: 'P'},
    {position: 'd7', piece: 'p'},
    {position: 'd8', piece: 'q'},
    {position: 'e1', piece: 'K'},
    {position: 'e2', piece: 'P'},
    {position: 'e7', piece: 'p'},
    {position: 'e8', piece: 'k'},
    {position: 'f1', piece: 'B'},
    {position: 'f2', piece: 'P'},
    {position: 'f7', piece: 'p'},
    {position: 'f8', piece: 'b'},
    {position: 'g1', piece: 'N'},
    {position: 'g2', piece: 'P'},
    {position: 'g7', piece: 'p'},
    {position: 'g8', piece: 'n'},
    {position: 'h1', piece: 'R'},
    {position: 'h2', piece: 'P'},
    {position: 'h7', piece: 'p'},
    {position: 'h8', piece: 'r'}
  ]
}
