import { useContext } from 'react'
import { Context } from '../context'
import { createQuestion } from '../controller'
import { Question } from './question'

export const ContentEditor = () => {
  const { model: {questions, editableQuestionMeta, isClosed}, dispatch } = useContext(Context)

  const appendQuestion = () => {
    questions.push(createQuestion())
    dispatch({ questions })
  }

  return (
    <div>
      {questions.map((_, idx) => (
        <Question key={idx} idx={idx} />
      ))}
      {!isClosed && questions.length < 3 && editableQuestionMeta && <button style={contentStyles.appendButton} onClick={appendQuestion}>질문 추가</button>}
    </div>
  )
}

const contentStyles = {
  appendButton: {
    width: 500,
    height: 44,
    top: 584,
    borderRadius: 8,
    borderWidth: 0,
    backgroundColor: '#f3f3f3',
    fontFamily: 'Pretendard Variable',
    fontWeight: 400,
    fontSize: '15px',
    lineHeight: '23px',
    letterSpacing: '-0.2px',
    verticalAlign: 'middle',
    color: '#616161'
  }
}