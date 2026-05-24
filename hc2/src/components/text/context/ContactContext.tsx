import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { ContactGroup } from '@/components/text/types/contact';
import { useLocation } from 'react-router-dom';
import { useTextContext } from '@/components/text/context/TextContext';
import { useContactGroup } from '@/components/text/queries/useContact';
import { dispatchRouteChange } from '../utils';

interface ContactGroupState {
  groups: ContactGroup[];
  totalCount: number;
  selectedGroupId: string | null;
  selectedGroup: ContactGroup | null;
  selectedGroupName: string[];
  selectedParentGroupId: string | null;
  selectedParentGroup: ContactGroup | null;
  setSelectedGroup: (group: ContactGroup | null) => void;
  setSelectedParentGroup: (group: ContactGroup | null) => void;
  setPendingAddedGroupId: (groupId: string) => void;
  onSelectAll: () => void;
  isGroupsLoadError: boolean;
  groupsLoadError: Error | null;
  isGroupsPending: boolean;
}

export const ContactGroupContext = createContext<ContactGroupState | null>(null);

export const ContactGroupContextProvider = ({ children, isPermissionRequired }: { children: ReactNode, isPermissionRequired: boolean }) => {
  const location = useLocation();
  const { currentSchool } = useTextContext();
  const { groups, totalCount, isError, error, isPending: isGroupsPending } = useContactGroup(currentSchool.schoolId, isPermissionRequired);

  const [selectedGroup, setSelectedGroup] = useState<ContactGroup | null>(null);
  const [selectedParentGroup, setSelectedParentGroup] = useState<ContactGroup | null>(null);
  const [pendingAddedGroupId, setPendingAddedGroupId] = useState<string>(null);

  const selectedGroupId = useMemo(() => {
    return selectedGroup?.groupId || null
  }, [selectedGroup]);

  const selectedParentGroupId = useMemo(() => {
    return selectedParentGroup?.groupId || null
  }, [selectedParentGroup]);

  const selectedGroupName = useMemo(() => {
    if (!selectedGroup) return ['전체'];
    const depth1Name = selectedParentGroup.groupName;
    const depth2Name = selectedGroup.groupName;
    return [depth1Name, depth2Name];
  }, [selectedGroup, selectedParentGroup])

  useEffect(() => {
    if (!groups) return;
    const { groupId, keyword } = location.state || {};

    let targetGroup: ContactGroup | null = null;
    let targetParent: ContactGroup | null = null;

    if (groupId && !keyword) {
      targetParent = groups.find(g => g.children?.some(c => c.groupId === groupId)) || null;
      targetGroup = targetParent?.children?.find(c => c.groupId === groupId) || null;
    }

    if (
      selectedGroup?.groupId !== (targetGroup?.groupId || null) ||
      selectedGroup?.groupName !== (targetGroup?.groupName || null)
    ) {
      setSelectedGroup(targetGroup);
    }

    if (
      selectedParentGroup?.groupId !== (targetParent?.groupId || null) ||
      selectedParentGroup?.groupName !== (targetParent?.groupName || null)
    ) {
      setSelectedParentGroup(targetParent);
    }
  }, [location, groups]);

  useEffect(() => {
    if (!pendingAddedGroupId || !groups || groups.length === 0) return;
    dispatchRouteChange({ menu: 'contact', query: { groupId: pendingAddedGroupId } });
    setPendingAddedGroupId(null);
  }, [pendingAddedGroupId]);

  const onSelectAll = () => {
    setSelectedGroup(null);
    setSelectedParentGroup(null);
  }

  return (
    <ContactGroupContext.Provider
      value={{
        groups,
        totalCount,
        selectedGroupId,
        selectedGroup,
        selectedGroupName,
        selectedParentGroupId,
        selectedParentGroup,
        setSelectedParentGroup,
        setSelectedGroup,
        setPendingAddedGroupId,
        onSelectAll,
        isGroupsLoadError: isError,
        groupsLoadError: error,
        isGroupsPending
      }}
    >
      {children}
    </ContactGroupContext.Provider>
  );
};

export const useContactGroupContext = () => {
  const context = useContext(ContactGroupContext);
  if (!context) throw new Error('Cannot find ContactGroupProvider');
  return context;
}
