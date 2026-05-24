import { useContext } from 'react'
import { Context } from '../context'
import { ContentWrapper } from './contentWrapper'
import Style from './report.module.css'
import { Profile } from '@/components/hiclass/components/profile'
import { WithNoData } from './withNoData'

export const Absentees = () => {
  const { model } = useContext(Context)
  const { absentees } = model

  return (
    <ContentWrapper className={`${Style['absentees']} ${Style['report']}`}>
      <div className={Style['absentee-wrapper']}>
        <WithNoData hasData={absentees?.length > 0} messageNoData='미참여 구성원이 없습니다.'>
          {absentees?.length > 0 && absentees?.map(absentee => (
            <div key={absentee.userId} className={Style['absentee']}>
              <Profile user={absentee} showMeMarker={true}/>
            </div>
          ))}
        </WithNoData>
      </div>
    </ContentWrapper>
  )
}