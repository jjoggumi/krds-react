export const buildBoardUserObjectForSecretBoard = (userId, isWritable = false) => ({
  userId, isWritable, isCommentable: false
})