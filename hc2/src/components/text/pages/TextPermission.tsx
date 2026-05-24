// 사용 권한 관리
import { useState, ChangeEvent, KeyboardEvent } from 'react';
import PermissionBody from '@/components/text/components/permission/PermissionBody';
import { HiInput, TitleArea } from '@/components/uiux';

export const TextPermission = () => {
  const [keyword, setKeyword] = useState('');
  const [inputValue, setInputValue] = useState('');

  const handleChangeKeywordInput = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setInputValue(v);
  };

  const handleSearch = (value?: string) => {
    const currentInput = (inputValue ?? '').trim();
    setKeyword(currentInput);
  };

  return (
    <>
      <div className="flex justify-between items-end">
        <TitleArea
          variant="col"
          level={1}
          summaryLevel={2}
          title="사용 권한 관리"
          summary="교직원에게 문자 서비스 사용 권한을 설정하실 수 있습니다."
        />
        {/* 검색바 */}
        <HiInput
          value={inputValue}
          onChange={handleChangeKeywordInput}
          placeholder="이름 검색"
          showSearch
          wrapStyle={{ width: '320px' }}
          onSearch={() => handleSearch()}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') handleSearch();
          }}
        />
      </div>
      <PermissionBody searchKeyword={keyword} />
    </>
  );
};
