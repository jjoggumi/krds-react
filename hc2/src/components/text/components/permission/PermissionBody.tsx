// 사용 권한 관리 화면
import { useState, useMemo, useEffect } from 'react';
import { ShowConfirm, CONFIRM_OPTIONS, HiButton, Card, CheckBox, Icon, Loading } from '@/components/uiux';
import { Plus } from 'lucide-react';
import { showToast } from '@/unimplementeds/toast';
import NoData from '@/components/uiux/noData';
import HiModal from '@/components/uiux/hiModal';
import { RadioBoxGroup } from '@/components/uiux/radiobox';
import { 
  useTextManagersEletter, 
  useTextManagersMutation, 
  useTextManagersSearch,
  useTextManagersSearchInvalidate,
} from '../../queries/usePermission';
import { useTextContext } from '../../context/TextContext';
import { PermissionRole, PermissionSort, PermissionSortDirection, PermissionSortType, SortDirection } from '../../types';
import { SimplePermission } from '../../constants';
import { getPermission } from '../../utils/permission';
import { ApiError } from '../../api/error';
import { useApiErrorHandler } from '@/components/text/hooks/apiErrorHandler';
import { motion } from 'framer-motion';
import {
  STAGGER_CONTAINER_VARIANTS,
  FADE_IN_UP_ORDERED_VARIANTS,
} from '@/components/text/constants/animations';
interface Staff {
  id: string;
  userName: string;
  role?: PermissionRole;
  permission: SimplePermission;
}

interface EltterStaff {
  id: string;
  userName: string;
  classInfo?: string;
}

interface PermissionBodyProps {
  searchKeyword?: string;
}

const PermissionBody = ({ searchKeyword = '' }: PermissionBodyProps) => {
  const { currentSchool } = useTextContext();
  const [sort, setSort] = useState<PermissionSort>({
    sort: PermissionSortType.NAME,
    direction: PermissionSortDirection.ASC
  });
  const { data: managers, isLoading } = useTextManagersSearch(currentSchool.schoolId, sort);
  const invalidate = useTextManagersSearchInvalidate();
  const { 
    addManagersMutateAsync,
    updatePermissionMutateAsync,
    removeManagersMutateAsync,
  } = useTextManagersMutation();
  const { data: eletters, refetch } = useTextManagersEletter(currentSchool.schoolId);  

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [addSelectedIds, setAddSelectedIds] = useState<string[]>([]);
  const [newIds, setNewIds] = useState<string[]>([]);
  const [addableStaff, setAddableStaff] = useState<EltterStaff[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const { handleError } = useApiErrorHandler();

  const rows = useMemo(() => {
    if (!managers) return [];
    return managers.lists.map((r) => {
      return {
        id: r.userId,
        userName: r.userName,
        role: r.role,
        permission: getPermission(r.permissions),
      }
    });
  }, [managers, sort])

  useEffect(() => {
    if (showAddModal) {
      refetch();
    }
  }, [showAddModal, refetch]);

  const eltterRows = useMemo(() => {
    if (!eletters) return [];
    return eletters.lists.map((r) => {
      return {
        id: r.userId,
        userName: r.userName,
        classInfo: r.etc,
      }
    });
  }, [eletters])

  // 신규 추가 행 하이라이트 제거 타이머
  useEffect(() => {
    const hasNewItem = newIds.length > 0
    if (hasNewItem) {
      const timer = setTimeout(() => {
        setNewIds([])
      }, 3000); // 3초 후 별색 표기 제거
      return () => clearTimeout(timer);
    }
  }, [newIds]);


  // 검색 필터링 (메인 테이블)
  const filteredStaff = useMemo(() => {
    if (!searchKeyword.trim()) return rows;
    return rows.filter((s) => s.userName.toLowerCase().includes(searchKeyword.toLowerCase()));
  }, [rows, searchKeyword]);

  // 검색어가 바뀌면 체크박스 선택 해제
  useEffect(() => {
    setSelectedIds([]);
  }, [searchKeyword]);

  const isDeletable = (s: Staff) => s.role !== PermissionRole.OWNER;

  const modalAllCheck = addableStaff.length > 0 && addSelectedIds.length === addableStaff.length
  const allCheck = filteredStaff.length > 0 && selectedIds.length > 0 && selectedIds.length === filteredStaff.filter(isDeletable).length;

  const noDataMessage = rows.length === 0 ? '리스트가 없습니다' : '검색 결과가 없습니다.';

  // 팝업 열기: 메인에 없는 사람들만 추출하여 셋팅
  const handleOpenAddModal = () => {
    const currentIds = rows.map((s) => s.id);
    const remainings = eltterRows.filter((s) => !currentIds.includes(s.id));
    setAddableStaff(remainings);
    setShowAddModal(true);
  };

  const isDisableAllCheckbox = filteredStaff.filter(isDeletable).length === 0

  const handleSort = () => {    
    const newDirection = sort.direction === PermissionSortDirection.ASC ? PermissionSortDirection.DESC : PermissionSortDirection.ASC;
    setSort({
      direction: newDirection,
      sort: sort.sort
    })
  };

  const handleChangePermission = async (userId: string, permission: SimplePermission) => {
    try {
      await updatePermissionMutateAsync({
        schoolId: currentSchool.schoolId, 
        userId: userId,
        permission: permission}
      );
      showToast('권한 정보가 변경되었습니다.');
    } catch(e) {
      await handleErrorUpdatePermission(e);
    }
  }

  const handleErrorUpdatePermission = async (error) => {
    if(error instanceof ApiError) {
      handleError(error, async (errorCode: string) => {
        switch(errorCode) {
          case 'notExistEletterManager':
            await ShowConfirm('학교알리미에 등록된 교직원이 아닙니다.\n교직원 명단에서 삭제됩니다.', {
              ...CONFIRM_OPTIONS.TEXT,
              confirmLabel: '확인',
              hideCancel: true,
            });
            invalidate(currentSchool.schoolId, sort);
            break;
          default:
            await ShowConfirm('데이터 요청중 에러가 발생했습니다.\n잠시 후 다시 시도해 주세요.', {
              ...CONFIRM_OPTIONS.TEXT,
              confirmLabel: '확인',
              hideCancel: true,
            });
            break;
        }
      });
    } else {
      await ShowConfirm('데이터 요청중 에러가 발생했습니다.\n잠시 후 다시 시도해 주세요.', {
        ...CONFIRM_OPTIONS.TEXT,
        confirmLabel: '확인',
        hideCancel: true,
      });
    }
  };

  const handleAllCheck = (isModal: boolean) => {
    if (isModal) {
      setAddSelectedIds(modalAllCheck ? [] : addableStaff.map(r => r.id));
    } else {
      setSelectedIds(allCheck ? [] : filteredStaff
        .filter(isDeletable)
        .map(r => r.id));
    }
  }

  const handleDeleteSelected = async () => {
    const deletableSelected = selectedIds;
    const n = deletableSelected.length;
    if (n === 0) return;

    try {
      const confirm = await ShowConfirm(`선택하신 교직원 ${n}명을 삭제하시겠습니까?\n삭제된 교직원은 더이상 문자 서비스 이용이 불가합니다.`, {
        ...CONFIRM_OPTIONS.TEXT,
        confirmLabel: '삭제',
        cancelLabel: '취소',
      });
      if (!confirm) return;

      await removeManagersMutateAsync({ schoolId: currentSchool.schoolId, userIds: selectedIds });
      setSelectedIds([]);
      showToast('삭제하였습니다.', 2000);
    } catch(e) {
      handleError(e);
    }
  };

  const toggleSelect = (id: string, checked: boolean, isModal: boolean = false) => {
    if (isModal) {
      setAddSelectedIds(addSelectedIds.includes(id)
      ? addSelectedIds.filter(i => i !== id)
      : [...addSelectedIds, id]);
    } else {
      setSelectedIds(selectedIds.includes(id)
      ? selectedIds.filter(i => i !== id)
      : [...selectedIds, id]);
    }
  };

  const handleAddStaffComplete = async () => {
    try {
      await addManagersMutateAsync({ schoolId: currentSchool.schoolId, userIds: addSelectedIds});
      setNewIds(addSelectedIds);
      setShowAddModal(false);
      setAddSelectedIds([]);
    } catch(e) {
      await handleErrorAddStaff(e);
    }
  };

  const handleErrorAddStaff = async (error) => {
    handleError(error, async (errorCode: string) => {
      switch(errorCode) {
        case 'notExistEletterManager':
          await ShowConfirm('학교알리미에 등록된 교직원이 아닙니다.\n교직원 명단에서 삭제됩니다.', {
            ...CONFIRM_OPTIONS.TEXT,
            confirmLabel: '확인',
            hideCancel: true,
          });
          invalidate(currentSchool.schoolId, sort);
          break;
        case 'alreadySchoolManager':
          await ShowConfirm('이미 관리자로 등록된 교직원입니다.', {
            ...CONFIRM_OPTIONS.TEXT,
            confirmLabel: '확인',
            hideCancel: true,
          });
          invalidate(currentSchool.schoolId, sort);
          break;
        default:
          await ShowConfirm('데이터 요청중 에러가 발생했습니다.\n잠시 후 다시 시도해 주세요.', {
            ...CONFIRM_OPTIONS.TEXT,
            confirmLabel: '확인',
            hideCancel: true,
          });
          break;
      }
    });
  };

  return (
    <motion.div
      className="flex flex-col gap-5 mt-7.5"
      initial="hidden"
      animate="visible"
      variants={STAGGER_CONTAINER_VARIANTS}>
      <Card variant="lightgray">
        <ul className="flex flex-col gap-1">
          <li className="flex items-start gap-2">
            <span className="text-leading-b3">• 학교알리미를 이용하는 교직원에게 문자 발송 권한을 부여하실 수 있습니다.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-leading-b3">• 신규 교직원 추가는 [교직원 추가] 버튼을 이용해 주세요.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-leading-b3">• ‘권한 없음'의 경우 더 이상 문자 서비스 사용이 불가합니다.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-leading-b3">• 소유자 변경 및 삭제는 고객센터 또는 1:1문의를 이용해주세요.</span>
          </li>
        </ul>
      </Card>

      <div className="flex flex-col gap-3">
        <motion.div custom={0} variants={FADE_IN_UP_ORDERED_VARIANTS} className="flex justify-between w-full">
          <HiButton
            variant="secondary"
            disabled={selectedIds.length === 0}
            onClick={handleDeleteSelected}
            style={{ minWidth: 95 }}
          >
            <div className="flex items-center gap-1">
              <span>{selectedIds.length}명</span> 삭제
            </div>
          </HiButton>
          <HiButton type="primary" onClick={handleOpenAddModal}>
            <Plus size={18} className="stroke-text-base" />
            교직원 추가
          </HiButton>
        </motion.div>

        {/* 메인 테이블 */}
        <motion.div
          custom={1}
          variants={FADE_IN_UP_ORDERED_VARIANTS}
          className={`table-content table-box relative sticky-wrap ${filteredStaff.length <= 0 ? 'h-[420px] overflow-hidden' : ''}`}
          style={filteredStaff.length <= 0 ? {} : { maxHeight: 'calc(var(--vh) * 100 - 180px)', overflowY: 'auto' }}
        >
          <table className="w-full">
            <colgroup>
              <col style={{ width: '56px' }} />
              <col style={{ width: '400px' }} />
              <col style={{ width: 'auto' }} />
            </colgroup>
            <thead>
              <tr>
                <th className="px-3 py-2 sticky-top">
                  <CheckBox
                    onChange={() => handleAllCheck(false)}
                    checked={!isDisableAllCheckbox && allCheck}
                    disabled={isDisableAllCheckbox}
                  />
                </th>
                <th className="px-3 py-2 text-left cursor-pointer sticky-top" onClick={handleSort}>
                  교직원 이름 <Icon icon={
                    sort.direction === PermissionSortDirection.ASC ? 'arrow-down-sort' : 'arrow-up-sort'
                  } className="mr-1.5" />
                </th>
                <th className="px-3 py-2 text-left sticky-top">문자 서비스 권한</th>
              </tr>
            </thead>
            <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={3}>
                  <div className="flex items-center justify-center">
                    <Loading variant="spinner" className="static [transform:none]" />
                  </div>
                </td>
              </tr>
            ) : (
              filteredStaff.map((s) => {
                const isNew = newIds.includes(s.id);
                return (
                  <tr key={s.id} style={{ backgroundColor: isNew ? 'var(--bg-orange-subtlest)' : 'transparent' }}>
                    <td className="px-3 py-2 text-center" style={{ backgroundColor: 'transparent' }}>
                      <CheckBox checked={selectedIds.includes(s.id)} onChange={(v) => toggleSelect(s.id, v)} disabled={!isDeletable(s)} />
                    </td>
                    <td className="px-3 py-2" style={{ backgroundColor: 'transparent' }}>{s.userName}</td>
                    <td className="px-3 py-2 transition-colors duration-1000" style={{ backgroundColor: 'transparent' }}>
                      <div className="flex items-center gap-6">
                        {s.role === PermissionRole.OWNER&& <div className="text-leading-b3">소유자</div>}
                        {isDeletable(s) && (
                          <div className="[&_label]:!text-left [&_label]:!block">
                            <RadioBoxGroup
                              className={`gap-10.5`}
                              options={[
                                { label: '주소록 수정+문자 발송', value: SimplePermission.ALL },
                                { label: '문자 발송 전용', value: SimplePermission.SMS },
                                { label: '권한 없음', value: SimplePermission.NONE },
                              ]}
                              value={s.permission}
                              onChange={(val) =>
                                handleChangePermission(s.id, val as SimplePermission)
                              }
                              name={`perm-${s.id}`}
                            />
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
            </tbody>
          </table>
          {filteredStaff.length <= 0 && (
            <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 flex items-center justify-center pointer-events-none">
              <NoData message={noDataMessage} size="md" />
            </div>
          )}
        </motion.div>
      </div>

      {/* 교직원 추가 팝업 */}
      <HiModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        heading="교직원 추가"
        desc="학교알리미를 이용하는 교직원에게 문자 발송 권한을 부여하실 수 있습니다."
        size="lg"
        content={
          <div className="table-content table-box sticky-wrap overflow-y-auto" style={{ minHeight: 240, maxHeight: 580 }}>
            <table className="w-full">
              <colgroup>
                <col style={{ width: '56px' }} />
                <col style={{ width: '240px' }} />
                <col style={{ width: 'auto' }} />
              </colgroup>
              <thead>
                <tr>
                  <th className="sticky-top">
                    <CheckBox
                      checked={addableStaff.length > 0 && addSelectedIds.length === addableStaff.length}
                      onChange={() => handleAllCheck(true)}
                      disabled={addableStaff.length === 0}
                    />
                  </th>
                  <th className="sticky-top">교직원 이름</th>
                  <th className="sticky-top">비고</th>
                </tr>
              </thead>
              <tbody>
                {addableStaff.length === 0 ? (
                  /* 데이터가 없을 때 */
                  <tr>
                    <td colSpan={3} className="px-3 py-0">
                      <div className="flex flex-col items-center justify-center min-h-[200px] text-gray-400">
                        <span className="text-leading-b2 text-text-neutral-strong">더 이상 추가하실 교직원이 없습니다.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  addableStaff.map((s) => (
                    <tr key={s.id}>
                      <td className="px-3 py-2 text-center">
                        <CheckBox checked={addSelectedIds.includes(s.id)} onChange={(v) => toggleSelect(s.id, v, true)} />
                      </td>
                      <td className="px-3 py-2">{s.userName}</td>
                      <td className="px-3 py-2 !text-left">{s.classInfo}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        }
        footer={
          <div className="flex gap-2">
            <HiButton className="flex-1" variant="tertiary" size="lg" onClick={() => setShowAddModal(false)}>
              취소
            </HiButton>
            <HiButton
              className="flex-1"
              variant="primary"
              size="lg"
              onClick={handleAddStaffComplete}
              disabled={addableStaff.length === 0 || addSelectedIds.length === 0}
            >
              완료
            </HiButton>
          </div>
        }
      />
    </motion.div>
  );
};

export default PermissionBody;
