import { useContext } from 'react'
import { Context } from '../context'
import { ShowConfirm } from '@/components/uiux/hitalk'

const Type = ({text, selected, onClick, disabled}) => {
  return (
    <div
      style={{...thisStyles.type,
        ...(selected ? thisStyles.selected : {}),
        ...(disabled ? thisStyles.disabled : {}),
        ...(selected && disabled ? thisStyles.disabledSelected : {})
      }}
      onClick={disabled ? undefined : onClick}
    >
      {text}
    </div>
  );
}

const types = [
  { text: '텍스트', value: 'TEXT', minItems: 3 },
  { text: '날짜', value: 'DATE', minItems: 3 },
  { text: '이미지', value: 'IMAGE', minItems: 0 },
]

const confirmMessage = `응답 유형을 변경할 경우 입력된 내용이 초기화 됩니다.
변경하시겠습니까?`

export const AnswerTypePicker = ( { question }) => {
  const { model: {questions, editableQuestionMeta, isClosed}, dispatch } = useContext(Context)

  return (
    <div style={ thisStyles.wrap }>
      {types.map((type) => (
        <Type 
          key={type.value} 
          text={type.text} 
          selected={question.questionType === type.value}
          onClick={async () => {
            const hasData = question.items.some(item => item.itemContent.trim() !== '')
              || (question.questionType === 'IMAGE' && question.items.length > 0);
            if (hasData && !await ShowConfirm(confirmMessage, {reverse: true})) return;
            question.questionType = type.value
            question.items = Array.from({ length: type.minItems }, () => ({ itemContent: '' }))
            dispatch({ questions });
          }}
          disabled={!editableQuestionMeta || isClosed}
        />
      ))}
    </div>
  );
}

const thisStyles = {
  wrap: {
    display: 'flex',
    flexDirection: 'row'
  },
  type: {
    width: '72px',
    height: '32px',
    borderRadius: '20px',
    borderWidth: '1px',
    borderColor: '#d6d6d6',
    padding: '10px',
    color: '#9e9e9e',
    backgroundColor: '#ffffff',
    marginRight: '4px',
    userSelect: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',    
    cursor: 'pointer',
    border: '1px solid #D6D6D6'
  },
  selected: {
    borderColor: '#222222',
    backgroundColor: '#222222',
    color: '#ffffff',
    border: '1px solid #222222'
  },
  disabled: {
    color: '#d6d6d6',
    cursor: 'not-allowed',
    border: '1px solid #d6d6d6',
  },
  disabledSelected: {
    backgroundColor: '#d6d6d6',
    border: '1px solid #d6d6d6',
    color: '#ffffff'
  }
}
