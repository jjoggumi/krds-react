import { useContext } from 'react'
import { Context } from '../context'
import { ContentWrapper } from './contentWrapper'
import Style from './report.module.css'
import { Profile } from '@/components/hiclass/components/profile'
import { WithNoData } from './withNoData'

export const MemberReport = () => {
  const { model } = useContext(Context)
  const { memberReport } = model

  return (
    <ContentWrapper className={`${Style['member-report']}`}>
      <WithNoData hasData={memberReport?.length > 0} messageNoData='참여한 구성원이 없습니다.'>
        {memberReport?.map(member => 
          <div
            key={member.userId}
             className={`${Style['report']}`}
          >
            <div className={Style['member-title']}>
              <Profile user={member} showMeMarker={true}/>
            </div>
            <div className={Style['questions-wrapper']}>
              {member.questions.map((question) => (
                <div key={question.questionId} className={Style['question']}>
                  <div className={Style['question-title']}>
                    {question.questionTitle}
                  </div>
                  <div className={Style['items-wrapper']}>
                    <div className={Style['item-content']}>
                      {(!model.isOwnerOrManager && question.isAnonymous) ? '익명 투표입니다.' : question.items?.map(item => item.formattedContent).join(', ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </WithNoData>
    </ContentWrapper>
  )
}