import ChessBoardInput from './ChessBoardInput'
import ChessBoardPreview from './ChessBoardPreview'

export default {
  name: 'chessBoard',
  title: 'Chess board',
  type: 'object',
  // This sets the *default* input component. Individual fields can still
  // use the same data type but specify a specific input component.
  inputComponent: ChessBoardInput,
  preview: {
    // Select specific fields to be included when querying
    select: {title: 'title', board: 'board', description: 'description'},

    // Note; this is *optional*. The default should work, although not
    // necessarily the most helpful in the case of a complex data structure
    component: ChessBoardPreview
  },
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string'
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text'
    },
    {
      name: 'board',
      title: 'Board',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'position',
              title: 'Position',
              type: 'string'
            },
            {
              name: 'piece',
              title: 'Piece',
              type: 'string'
            }
          ]
        }
      ]
    }
  ]
}
