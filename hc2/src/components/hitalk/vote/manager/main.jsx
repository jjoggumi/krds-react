import Style from './main.module.css'

import { VotePicker } from './picker'
import { useState, useRef } from 'react'
import { Icon } from '@/components/uiux/hitalk'
import { HitalkVotePortal } from '../portal/main'

export const HitalkVoteManager = ({$emit = () => {}}) => {
  const [ selectedVote, setSelectedVote ] = useState(null);
  const votePickerRef = useRef(null);

  const reloadVotePicker = () => votePickerRef.current?.reload()

  const onEmit = (e, detail) => {
    reloadVotePicker()
    if (e === 'close') setSelectedVote(null)
    $emit(e, detail)
  }

  return (
    <div className={Style['hitalk-vote-manager']}>
      <div className={Style.left}>
        <VotePicker ref={votePickerRef} onSelect={vote => setSelectedVote(vote)} $emit={$emit}/>
      </div>
      <div className={Style.right}>
        { selectedVote ? (
          <HitalkVotePortal vote={selectedVote}
            $emit={onEmit}
            showCloseButton={false} />
        ) : (
          <div className={Style['no-vote-selected']}>
            <div className={Style['no-vote-content']}>
              <Icon icon="nodata" />
              <span>투표를 선택해주세요.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}