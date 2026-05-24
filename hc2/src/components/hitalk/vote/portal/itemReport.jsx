import { useContext } from 'react'
import { Context } from '../context'
import { ContentWrapper } from './contentWrapper'
import Style from './report.module.css'
import { Profile } from '@/components/hiclass/components/profile'

export const ItemReport = () => {
  const { model } = useContext(Context)
  const { itemReport } = model
  const isAnonymous = item => !model.isOwnerOrManager && item.isAnonymous

  return (
    <>
      {itemReport?.map(item => 
        <ContentWrapper
          key={item.questionId}
          className={`${Style['item-report']} ${Style['report']} ${isAnonymous(item) ? Style['anonymous-item'] : ''}`}
          header={<div className={Style['question-title']}>{item.questionTitle}</div>}
        >
          {isAnonymous(item) && <div className={`${Style['item']}`}>
              <div className={Style['item-content']}>
                익명 투표입니다.
              </div>
            </div>}
          {!isAnonymous(item) && item.items.map(({ itemId, formattedContent, answers }, index) => (
            <div key={itemId} className={`${Style['item']} ${index === item.items.length - 1 ? Style['last-item'] : ''}`}>
              <div className={Style['item-content']}>
                {formattedContent} :&nbsp;
                <span className={Style['item-count']}>{answers?.length || 0}명</span>
              </div>
              <div className={Style['item-answers']}>
                {answers?.map(answer => (
                  <Profile user={answer} key={answer.userId} showMeMarker={true}/>
                ))}
              </div>
            </div>
          ))}
        </ContentWrapper>
      )}
    </>
  )
}