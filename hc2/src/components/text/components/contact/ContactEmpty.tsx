import React from 'react';

import { Card, HiButton, HiIcon, TitleArea } from '@/components/uiux';

import styles from './ContactEmpty.module.scss';

interface ContactEmptyProps {
  onOpenModal: () => void;
}
export const ContactEmpty = ({ onOpenModal }: ContactEmptyProps) => {
  return (
    <>
      <Card variant="lightgray" size="md" className="mb-4">
        <TitleArea level={3} variant="col" summaryLevel={5} title="주소록 안내" className="mb-3" />
        <ul className="flex flex-col gap-[5px]">
          <li className='text-leading-b3'>• 주소록 등록 및 수정은 생성 권한을 가진 교직원만 가능합니다.</li>
          <li className='text-leading-b3'>• 주소록에서 수정된 정보는 학교알리미 학급명단에 반영되지 않습니다.</li>
          {/*<li>*/}
          {/*  • 다국어 설정을 하시면 메시지 수신 시 설정된 언어로 자동 번역되어 발송됩니다. (*휴대폰 번호 마우스 오버 &gt; 언어 아이콘 클릭 &gt;*/}
          {/*  언어설정)*/}
          {/*</li>*/}
        </ul>
      </Card>
      <Card variant="border" size="md">
        <TitleArea
          variant="col"
          level={3}
          title="주소록 등록방법"
          summary="좌측 [그룹 추가하기]로 학년/반을 직접 만들거나, [주소록 일괄 등록]을 통해 학교알리미 명단을 한 번에 업로드할 수 있습니다."
          className={`${styles.title5} pr-55 !gap-2`}
        >
          <TitleArea.Etc>
            <HiButton variant="link" onClick={onOpenModal} className="w-full justify-center control-md px-6 mb-5 text-graphic-forest border border-graphic-forest hover:bg-graphic-forest/8 active:bg-graphic-forest/12 leading-none">
              <HiIcon icon="file-excel" size={18} /> 주소록 일괄 등록하기
            </HiButton>
          </TitleArea.Etc>
        </TitleArea>
      </Card>
    </>
  );
};
