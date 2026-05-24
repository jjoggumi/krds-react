import { useContext } from 'react'
import { Context } from '../../context'
import Style from './question.module.css'
import { Icon, MorePopup, Thumbnail, CheckGroup } from '@/components/uiux/hitalk'
import { Profile } from '@/components/hiclass/components/profile'

const hasOption = ( { isMultipleChoice, isAnonymous }) => isMultipleChoice || isAnonymous

const formatOption = ({ isMultipleChoice, isAnonymous }) => '* ' + [
  ...(isMultipleChoice ? ['복수선택'] : []),
  ...(isAnonymous ? ['익명투표'] : []),
].join(', ')

export const Question = ({ question, answers = [], onChange, resultMode }) => {
  const { model } = useContext(Context);
  const resultOf = item => model.itemReport?.find(r => r.questionId === question.questionId)?.items.find(i => i.itemId === item.itemId);
  const direction = question.questionType === 'IMAGE' ? 'row' : 'column';
  return (
    <div className={`${Style['question']}`}>
      <div className={Style['question-title']}> {question.questionTitle} </div>
      {question.questionDescription && <pre className={Style['question-description']}>{question.questionDescription}</pre>}
      { hasOption(question) && <div className={Style['question-option']}> {formatOption(question)} </div> }
      <div className={Style['question-items']}>
        { resultMode
            ? question.items.map(item => <ResultItem question={question} item={item} key={item.itemId} resultItem={resultOf(item)} /> )
            : <CheckGroup className={Style['check-group-' + question.questionType]} multiple={question.isMultipleChoice} onChange={onChange} selectedItems={answers} direction={direction}>
                {question.items.map((item) => (
                <div key={item.itemId} className={Style['item']}>
                  <Item item={item} question={question} />
                </div>
                ))}
              </CheckGroup>
        }
      </div>
    </div>
  );
}

const Item = ({ item, question: {questionType} }) => {
  const renderer = {
    TEXT: () => item.itemContent,
    IMAGE: () => <>
      <img src={item.fileConvertPath}/>
      <span className={Style['image-caption']}>{item.itemContent}</span>
      <Icon icon="picture-original" className={Style['picture-original']} onClick={e => {
        e.stopPropagation()
        window.dispatchEvent(new CustomEvent('vote-show-image-layout', { detail: item }))
      }}/>
    </>,
    DATE: () => item.formattedContent,
  }[questionType]

  return (
    <div className={Style['item-content']}>
      {renderer()}
    </div>
  );
}

const ResultItem = ({ item, resultItem, question: {isAnonymous, questionType} }) => {
  const { model } = useContext(Context);
  const answeredByMe = resultItem?.answers?.some(a => a.userId === model.userId) || model.answer?.answers.some(a => a.itemId === item.itemId)
  const noAnswer = !resultItem || resultItem.itemAnswerCount === 0
  const rate = noAnswer || model.memberReport?.length === 0 ? 0 : (resultItem.itemAnswerCount / model.memberReport.length) * 100
  const disabledPopup = noAnswer || (!model.isOwnerOrManager && (model.vote?.resultStatus === 'COUNT_ONLY' || isAnonymous))
  return (
    <div key={item.itemId} className={`${Style['item']} ${Style['result-item']} ${noAnswer ? Style['no-answer'] : ''}`}>
      { item.fileCategory === 'IMAGE' &&
        <Thumbnail src={item.fileConvertPath}>
          <Icon icon="picture-original" className={Style['picture-original']} onClick={e => {
            e.stopPropagation()
            window.dispatchEvent(new CustomEvent('vote-show-image-layout', { detail: item }))
          }}/>
        </Thumbnail>
      }
      <div className={Style['item-wrapper']}>
        <div>
          {answeredByMe && <Icon icon="check"/> }
          <span className={Style['item-content']}>{item.formattedContent}</span>
          {(model.isOwnerOrManager || model.vote?.resultStatus !== 'PRIVATE') &&
            <div className={Style['item-count-wrapper']}>
            { resultItem && (
              rate > 0 ? (
                <MorePopup
                  entry={<span className={`${Style['item-count']} ${disabledPopup ? Style['disabled'] : ''}`}>{resultItem.itemAnswerCount}표</span>}
                  disabled={disabledPopup}
                  position={{ bottom: 8, left: -20}}
                >
                  <div className={Style['item-count-detail']}>
                    <div className={Style['header']}>
                      {resultItem.itemAnswerCount}명 응답
                    </div>
                    <div className={Style['list']}>
                      {resultItem.answers?.map((answer, index) => (
                        <div className={Style['list-item']} key={index}>
                          <Profile className={Style['user-name']} noImg={true} user={answer} showMeMarker={true}/>
                        </div>
                      ))}
                    </div>
                  </div>
                </MorePopup>
              )
              : <div><span className={Style['item-count']}>0표</span></div>
            ) }
          </div>}
        </div>
        {(model.isOwnerOrManager || model.vote?.resultStatus !== 'PRIVATE') && <div className={Style['chart-bg']}>
          <div className={Style['chart-bar']} style={{ width: `${rate}%` }}></div>
        </div>}
      </div>
    </div>
  )
}