import { useEffect, useRef, useState, useCallback, ChangeEvent } from 'react';
import { Reorder, AnimatePresence, motion } from "framer-motion";
import styles from './ContactGroupList.module.scss';
import clsx from 'clsx';

import { ContactGroup, ContactGroupDepthType } from '@/components/text/types/contact';

import { ChevronRight, ChevronDown, Plus, Pen, Trash2 } from 'lucide-react';
import { HiIcon, ShowConfirm, CONFIRM_OPTIONS, HiButton, HiInput } from '@/components/uiux';
import { Button } from '@/components/uiux/buttons';
import { useContactGroupMutation } from '@/components/text/queries/useContact';

import { useTextContext } from '@/components/text/context/TextContext';
import { useContactGroupContext } from '@/components/text/context/ContactContext';
import { dispatchRouteChange } from '../../utils';
import { useLocation } from 'react-router-dom';
import { useApiErrorHandler } from '@/components/text/hooks/apiErrorHandler';
import { isEmpty } from '@/utils/validate';
import { ApiError } from '@/components/text/api/error';
import { checkPermission } from '@/components/text/api';
import { PermissionActionType, PermissionFeatureType } from '@/components/text/types';

import {
  STAGGER_CONTAINER_FAST_VARIANTS,
  FADE_IN_UP_VARIANTS,
  FADE_IN_RIGHT_VARIANTS,
  FADE_IN_UP_ORDERED_VARIANTS,
} from '@/components/text/constants/animations';
import { contactKeys } from '@/components/text/queries/keys';
import { useQueryClient } from '@tanstack/react-query';

// --- Helper for conditional classes ---
const cx = (...args: (string | boolean | undefined | null)[]) => {
  return args.filter(Boolean).join(' ');
};

interface ContactGroupListProps {
  className?: string;
  onOpenModal?: () => void;
  isBatchImportOpen?: boolean;
  isChangeRouteMode: boolean;
  isEditable: boolean;
  keyword?: string;
  setKeyword?: (keyword: string) => void;
  onErrorNoAuthority?: () => void;
}

export const ContactGroupList = ({ className, onOpenModal, isBatchImportOpen, isChangeRouteMode, isEditable, keyword, setKeyword, onErrorNoAuthority }: ContactGroupListProps) => {
  const { state } = useLocation();
  const { currentSchool } = useTextContext();
  const queryClient = useQueryClient();
  const {
    groups,
    totalCount,
    selectedGroupId,
    selectedParentGroup,
    setSelectedGroup,
    setSelectedParentGroup,
    setPendingAddedGroupId,
    isGroupsLoadError,
    groupsLoadError
  } = useContactGroupContext();
  const { updateGroupOrderMutateAsync } = useContactGroupMutation();

  const [openedGroupId, setOpenedGroupId] = useState<string | null>(null);
  const [prevGroups, setPrevGroups] = useState<ContactGroup[]>(groups);
  const [orderedGroups, setOrderedGroups] = useState<ContactGroup[]>(groups);

  const { handleError } = useApiErrorHandler();

  if (groups !== prevGroups) {
    setPrevGroups(groups);
    setOrderedGroups(groups);
  }

  const hasKeyword = isChangeRouteMode ? state?.keyword : !isEmpty(keyword);

  useEffect(() => {
    setOpenedGroupId(selectedParentGroup?.groupId || null);
  }, [selectedParentGroup]);

  useEffect(() => {
    if (!isGroupsLoadError) return;

    if (groupsLoadError instanceof ApiError) {
      if (isChangeRouteMode) {
        groupsLoadError.status === 406 ?
          handlePermissionError() :
          handleError(groupsLoadError);
        return;
      }

      if (groupsLoadError.status === 406) {
        onErrorNoAuthority && onErrorNoAuthority();
      }
    }
  }, [isGroupsLoadError, groupsLoadError]);

  const hasGroups = (groups && groups.length > 0) || (orderedGroups && orderedGroups.length > 0);

  const handleClickAll = () => {
    queryClient.invalidateQueries({ queryKey: contactKeys.searchBase(currentSchool.schoolId) }).then()
    if (isChangeRouteMode) {
      dispatchRouteChange({ menu: 'contact', query: {} });
      return;
    }
    setSelectedGroup(null);
    setSelectedParentGroup(null);
  };

  const handleAddCompleted = (groupId: string) => {
    setPendingAddedGroupId(groupId);
  }

  const handleReorder = (newOrder: ContactGroup[]) => {
    setOrderedGroups(newOrder);
  };

  const handleDragEnd = async () => {
    const orderItems = {
      depthType: ContactGroupDepthType.DEPTH1,
      groups: orderedGroups.map((g, index) => ({ groupId: g.groupId, sortNo: index + 1 }))
    };
    await updateGroupOrderMutateAsync({ schoolId: currentSchool.schoolId, orderItems });
  };

  const handlePermissionError = async () => {
    const isConfirm = await ShowConfirm('주소록 권한이 없습니다. ', {
      ...CONFIRM_OPTIONS.TEXT,
      hideCancel: true
    });

    if (isConfirm) {
      const res = await checkPermission(currentSchool.schoolId, {
        featureType: PermissionFeatureType.SEND_MESSAGE,
        actionType: PermissionActionType.SEND
      })

      if (res.content === 'NONE') {
        dispatchRouteChange({ menu: null, routePath: '/main' });
        return;
      }

      // 권한 갱신, 화면 갱신
      dispatchRouteChange({ menu: 'send', query: {}, reloadAuthorities: true });
    }
  };

  const maxSortNo = orderedGroups.length > 0
    ? Math.max(...orderedGroups.map(item => item.sortNo))
    : 0;

  return (
    <motion.div
      className={`${styles.lnbContainer} ${className ?? ''}`}
      initial="hidden"
      animate="visible"
      variants={STAGGER_CONTAINER_FAST_VARIANTS}
    >
      {isEditable && hasGroups && (
        <motion.div
          custom={0}
          variants={FADE_IN_UP_ORDERED_VARIANTS}
          initial="hidden"
          animate="visible"
        >
          <HiButton
            variant="link"
            onClick={onOpenModal}
            active={!!isBatchImportOpen}
            className={clsx(
              "w-full justify-center control-md px-6 mb-5 text-graphic-forest border border-graphic-forest hover:bg-graphic-forest/8 active:bg-graphic-forest/12",
              // 모달이 열려있을 때(active=true) 배경색 강제 고정
              isBatchImportOpen && "!bg-graphic-forest/12"
            )}
          >
            <HiIcon icon="file-excel" size={18} /> 
            주소록 일괄 등록하기
          </HiButton>
        </motion.div>
      )}
      <div className={styles.menuWrap}>
        <motion.h1
          custom={0}
          variants={FADE_IN_UP_ORDERED_VARIANTS}
          className={cx(styles.title, selectedGroupId === null && !hasKeyword && hasGroups && styles.isSelected)}
          onClick={handleClickAll}
        >
          전체 ({totalCount.toLocaleString()}명)
        </motion.h1>
        <Reorder.Group
          axis="y"
          values={orderedGroups}
          onReorder={handleReorder}
          className={`menuList ${styles.menuList}`}
          variants={STAGGER_CONTAINER_FAST_VARIANTS}
        >
          {orderedGroups.map((group, index) => (
            <Reorder.Item
              key={group.groupId}
              value={group}
              className={styles.menuItem}
              variants={FADE_IN_UP_VARIANTS}
              layout="position"
              dragListener={isChangeRouteMode}
              whileDrag={{ boxShadow: '0 0 3px rgba(0,0,0,0.1)', zIndex: 10 }}
              onDragEnd={handleDragEnd}
            >
              <GroupItem
                group={group}
                parentGroup={group}
                isChangeRouteMode={isChangeRouteMode}
                isEditable={isEditable}
                openedGroupId={openedGroupId}
                addCompleted={handleAddCompleted}
                setOpenedGroupId={setOpenedGroupId}
                setKeyword={setKeyword}
              />
            </Reorder.Item>
          ))}
          {isEditable && (
            <motion.li variants={FADE_IN_UP_VARIANTS}>
              <GroupAdd
                depthType={ContactGroupDepthType.DEPTH1}
                sortNo={maxSortNo + 1}
                parentGroup={null}
                addCompleted={(_) => { }}
              />
            </motion.li>
          )}
        </Reorder.Group>
      </div>
    </motion.div>
  );
};

interface GroupItemProps {
  group: ContactGroup;
  parentGroup: ContactGroup;
  isChangeRouteMode: boolean;
  isEditable: boolean;
  openedGroupId?: string | null;
  setOpenedGroupId?: (groupId: string | null) => void;
  addCompleted?: (groupId: string) => void;
  setKeyword?: (keyword: string) => void;
}

const GroupItem = ({ group, parentGroup, isChangeRouteMode, isEditable, openedGroupId, setOpenedGroupId, addCompleted, setKeyword }: GroupItemProps) => {
  const { currentSchool } = useTextContext();
  const {
    selectedGroupId,
    setSelectedGroup,
    setSelectedParentGroup
  } = useContactGroupContext();
  const { updateGroupOrderMutateAsync } = useContactGroupMutation();

  const [isEditing, setIsEditing] = useState<boolean>(false);

  const childrenGroups = group.children ? group.children.filter((c) => c.groupId) : [];
  const hasChildren = !!group.children || false;
  const depthType = hasChildren ? ContactGroupDepthType.DEPTH1 : ContactGroupDepthType.DEPTH2;

  const [orderedChildrenGroups, setOrderedChildrenGroups] = useState<ContactGroup[]>(childrenGroups);

  useEffect(() => {
    const newChildren = group.children ? group.children.filter((c) => c.groupId) : [];
    setOrderedChildrenGroups(newChildren);
  }, [group.children]);

  const isSelected = group.groupId === selectedGroupId;
  const isOpened = openedGroupId === group.groupId;

  const handleClickGroup = () => {
    if (!isChangeRouteMode) {
      setKeyword && setKeyword('');
    }

    if (!hasChildren) {
      if (isChangeRouteMode) {
        dispatchRouteChange({ menu: 'contact', query: { groupId: group.groupId } });
        return;
      }
      setSelectedGroup(group);
      setSelectedParentGroup(parentGroup);
      return;
    }

    if (!isChangeRouteMode) {
      setSelectedGroup(group);
      setSelectedParentGroup(group);
    }

    setOpenedGroupId(openedGroupId === group?.groupId ? null : group.groupId);
  };

  const handleReorder = (newOrder: ContactGroup[]) => {
    setOrderedChildrenGroups(newOrder);
  };

  const handleDragEnd = async () => {
    const orderItems = {
      depthType: ContactGroupDepthType.DEPTH2,
      groups: orderedChildrenGroups.map((g, index) => ({ groupId: g.groupId, sortNo: index + 1 }))
    };
    await updateGroupOrderMutateAsync({ schoolId: currentSchool.schoolId, orderItems });
  };

  const fixedMaxSortNo = hasChildren === true
    ? childrenGroups.length > 0 ? Math.max(...childrenGroups.map(item => item.sortNo)) : 0
    : 0;


  return (
    <div
      className={cx(styles.menuItem, !hasChildren && styles.isSub, (isSelected || isOpened) && styles.isSelected)}
    >
      {isEditing ? (
        <GroupEditItem
          depthType={depthType}
          parentGroupId={parentGroup?.groupId || null}
          groupId={group.groupId}
          initGroupName={group.groupName}
          isEditing={isEditing}
          maxSortNo={fixedMaxSortNo}
          setIsEditing={setIsEditing}
          addCompleted={(_) => { }}
          isOpened={isOpened}
        />
      ) : (
        <GroupReadItem
          depthType={depthType}
          group={group}
          isOpened={isOpened}
          handleClickGroup={handleClickGroup}
          isEditable={isEditable}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
        />
      )}

      {/* 소분류 렌더링 (열림/닫힘 애니메이션 유지) */}
      <AnimatePresence>
        {isOpened && (
          <motion.div
            className={cx(styles.ulReset, styles.subList)}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
            transition={{ duration: 0.22 }}
          >
            <Reorder.Group
              axis="y"
              values={orderedChildrenGroups}
              onReorder={handleReorder}
              initial="hidden"
              animate="visible"
              variants={STAGGER_CONTAINER_FAST_VARIANTS}
            >
              {orderedChildrenGroups.map((group) => (
                <Reorder.Item
                  key={group.groupId}
                  value={group}
                  initial="hidden"
                  animate="visible"
                  variants={FADE_IN_RIGHT_VARIANTS}
                  layout="position"
                  dragListener={isChangeRouteMode}
                  whileDrag={{ boxShadow: '0 0 3px rgba(0,0,0,0.1)', zIndex: 10 }}
                  onDragEnd={handleDragEnd}
                >
                  <GroupItem
                    group={group}
                    parentGroup={parentGroup}
                    isChangeRouteMode={isChangeRouteMode}
                    isEditable={isEditable}
                    setKeyword={setKeyword}
                  />
                </Reorder.Item>
              ))}
            </Reorder.Group>
            {depthType === ContactGroupDepthType.DEPTH1 && isEditable && (
              <GroupAdd
                depthType={ContactGroupDepthType.DEPTH2}
                sortNo={fixedMaxSortNo + 1}
                parentGroup={parentGroup}
                addCompleted={addCompleted}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface GroupAddProps {
  depthType: ContactGroupDepthType;
  sortNo: number;
  parentGroup: ContactGroup | null;
  addCompleted: (groupId: string) => void;
}

const GroupAdd = ({ depthType, sortNo, parentGroup, addCompleted }: GroupAddProps) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const parentGroupId = parentGroup ? parentGroup.groupId : null;
  const isSub = depthType === ContactGroupDepthType.DEPTH2;

  const addButton = (
    <HiButton
      variant="link"
      size="lg"
      onClick={() => setIsEditing(true)}
      className="inline-flex items-center text-b2 group text-text-neutral-strong gap-1.5 !h-10 pt-0.5 hover:text-text-default hover:font-bold"
    >
      <Plus className="w-5 h-5 stroke-text-neutral-strong group-hover:stroke-text-default" />
      {!isSub ? '그룹 추가하기' : '추가하기'}
    </HiButton>
  );

  return (
    isEditing ?
      (
        <div className={cx(styles.menuItem, isSub && styles.isSub)}>
          <GroupEditItem
            depthType={depthType}
            parentGroupId={parentGroupId}
            groupId={null}
            initGroupName={null}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            addCompleted={addCompleted}
            maxSortNo={sortNo}
            isOpened={false}
          />
        </div>
      ) :
      (
        isSub ?
          (
            <div className={cx(styles.menuItem, isSub && styles.isSub, styles.addBtnContainer)}>
              {addButton}
            </div>
          )
          :
          (
            <div className={cx(styles.menuItem, isSub && styles.isSub, styles.addBtnContainer)}>
              {addButton}
            </div>
          )
      )
  )
};

interface GroupReadItemProps {
  depthType: ContactGroupDepthType;
  group: ContactGroup;
  isOpened: boolean;
  isEditable: boolean;
  handleClickGroup: () => void;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
}

const GroupReadItem = ({ depthType, group, isOpened, isEditable, handleClickGroup, isEditing, setIsEditing }: GroupReadItemProps) => {
  const isDepth1 = depthType === ContactGroupDepthType.DEPTH1;

  return (
    <div className={cx(styles.menuView)} onClick={handleClickGroup}>
      {isDepth1 ? (isOpened ? <ChevronRight size={20} className="min-w-5 text-text-default " /> : <ChevronDown size={20} className="min-w-5 text-text-default" />) : <span className={styles.dot}>•</span>}

      <span className={cx(styles.menuName, isDepth1 && styles.isMain, 'line-clamp-2')}>
        {group.groupName}
        <span className={styles.count}>({group.count.toLocaleString()}명)</span>
      </span>

      {isEditable &&
        <GroupOptionButton
          group={group}
          isEditing={isEditing}
          onSave={() => setIsEditing(false)}
          setIsEditing={setIsEditing}
        />
      }
    </div>
  );
}

interface GroupEditItemProps {
  depthType: ContactGroupDepthType,
  parentGroupId: string | null;
  groupId: string | null;
  initGroupName: string | null;
  isEditing: boolean;
  maxSortNo: number;
  setIsEditing: (isEditing: boolean) => void;
  addCompleted: (groupId: string) => void;
  isOpened?: boolean;
}

const GroupEditItem = ({ depthType, parentGroupId, groupId, initGroupName, isEditing, maxSortNo, setIsEditing, addCompleted, isOpened = false }: GroupEditItemProps) => {
  const { currentSchool } = useTextContext();
  const { groups } = useContactGroupContext();
  const { createGroupMutateAsync, updateGroupMutateAsync } = useContactGroupMutation();
  const { handleError } = useApiErrorHandler();

  const [tempGroupName, setTempGroupName] = useState<string>(initGroupName ? initGroupName.slice(0, 10) : '');
  const divRef = useRef<HTMLDivElement>(null);
  const isSavingRef = useRef<boolean>(false);
  const isSub = depthType === ContactGroupDepthType.DEPTH2;

  // 커서 포커스 및 커서 위치 끝으로 이동
  useEffect(() => {
    if (!isEditing) return;
    const t = setTimeout(() => {
      const input = divRef.current?.querySelector('input') as HTMLInputElement | null;
      if (input) {
        input.focus();
        const len = input.value.length;
        try { input.setSelectionRange(len, len); } catch { /* ignore */ }
      }
    }, 0);
    return () => clearTimeout(t);
  }, [isEditing]);

  const handleSave = useCallback(async () => {
    if (isSavingRef.current) return;

    const finalName = (tempGroupName ?? '').trim().slice(0, 10);
    const initNameTrunc = initGroupName ? initGroupName.trim().slice(0, 10) : null;
    if (!finalName || initNameTrunc === finalName) {
      setIsEditing(false);
      return;
    }

    const existingGroupNames = isSub ?
      groups.find(g => g.groupId === parentGroupId)?.children?.filter(g => g.groupId !== groupId).map(g => g.groupName) || [] :
      groups.filter(g => g.groupId !== groupId).map(g => g.groupName);

    if (existingGroupNames.includes(finalName)) {
      await ShowConfirm('중복된 이름입니다.', {
        ...CONFIRM_OPTIONS.TEXT,
        hideCancel: true
      });
      return;
    }

    try {
      isSavingRef.current = true;
      if (initGroupName) await updateGroup(finalName);
      else await createGroup(finalName);
      setIsEditing(false);
    } catch (e) {
      //안에서 throw 안하기는한데, isSavingRef의 안전성을 위해....
    } finally {
      isSavingRef.current = false;
    }
  }, [tempGroupName, initGroupName]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      const isModalClick = target.closest('.modal-dialog');
      if (isModalClick) return;

      if (divRef.current && !divRef.current.contains(target)) {
        handleSave().then();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [divRef, handleSave]);

  const createGroup = async (name?: string) => {
    const finalName = (name ?? tempGroupName ?? '').trim().slice(0, 10);
    const groupForSave = {
      depthType,
      groupName: finalName,
      groupId: parentGroupId || null,
      sortNo: maxSortNo,
    };
    try {
      const { groupId } = await createGroupMutateAsync({ schoolId: currentSchool.schoolId, group: groupForSave })
      addCompleted(groupId);
    } catch (e) {
      await handleError(e);
    }
  }

  const updateGroup = async (name?: string) => {
    if (!groupId) return;
    const finalName = (name ?? tempGroupName ?? '').trim().slice(0, 10);

    const groupForUpdate = {
      depthType,
      groupId: groupId,
      groupName: finalName
    }

    try {
      await updateGroupMutateAsync({ schoolId: currentSchool.schoolId, group: groupForUpdate, parentGroupId })
    } catch (e) {
      await handleError(e);
    }
  }

  return (
    <div ref={divRef} className={cx(styles.menuView, styles.menuEdit)}>
      {depthType === ContactGroupDepthType.DEPTH1 ? (
        isOpened ? <ChevronDown size={20} className="min-w-5 text-text-neutral-strong" /> : <ChevronRight size={20} className="min-w-5 text-text-neutral-strong" />
      ) : (
        <span className={styles.dot}>•</span>
      )}
      <HiInput
        value={tempGroupName}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setTempGroupName(((e.target.value as string) ?? '').slice(0, 10))}
        onBlur={() => { }}
        placeholder={depthType === ContactGroupDepthType.DEPTH1 ? '그룹명' : '메뉴명'}
        showClearButton={false}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleSave().then();
          }
        }}
        size="sm"
        className={isSub ? '!px-2' : undefined}
      />
      {isEditing &&
        <GroupOptionButton
          onSave={handleSave}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
        />
      }
    </div>
  );
}

interface GroupOptionButtonProps {
  group?: ContactGroup;
  isEditing: boolean;
  onSave: () => void;
  setIsEditing: (isEditing: boolean) => void;
}

const GroupOptionButton = ({ group, isEditing, onSave, setIsEditing }: GroupOptionButtonProps) => {
  const { currentSchool } = useTextContext();
  const { selectedGroupId, selectedParentGroupId } = useContactGroupContext();
  const { deleteGroupMutateAsync } = useContactGroupMutation();

  const groupId = group?.groupId || null;

  const handleClickPen = () => {
    if (!isEditing) {
      groupId ? setIsEditing(true) : null;
    } else {
      onSave()
    }
  };

  const handleClickTrash = () => {
    groupId ?
      handleDeleteGroup() :
      setIsEditing(false);
  };

  const handleDeleteGroup = async () => {
    try {
      if (group.count > 0) {
        const isDelete = await ShowConfirm('한번 삭제한 그룹은 복구가 불가합니다.\n정말 삭제하시겠습니까?', {
          ...CONFIRM_OPTIONS.TEXT,
          confirmLabel: '삭제',
          cancelLabel: '취소',
        });
        if (!isDelete) return;
      }
      await deleteGroupMutateAsync({ schoolId: currentSchool.schoolId, groupId });
    } finally {
      if (selectedGroupId === groupId || selectedParentGroupId === groupId) {
        dispatchRouteChange({ menu: 'contact', query: {} });
      }
    }
  };

  return (
    <div className={styles.actionBtns}>
      <HiButton variant="link" onClick={handleClickPen}>
        <Pen size={18} className="stroke-text-neutral-base hover:stroke-text-default" />
      </HiButton>
      <HiButton variant="link" onClick={handleClickTrash}>
        <Trash2 size={18} className="stroke-text-neutral-base hover:stroke-text-default" />
      </HiButton>
    </div>
  )
}
