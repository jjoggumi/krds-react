import { useEffect, useState } from 'react';
import { SendTargetWithValidation } from '@/components/text/types';

export const useSendReceiver = ({ isDeduplication, onUpdateTargets }: {isDeduplication: boolean, onUpdateTargets?: (targets: SendTargetWithValidation[]) => void}) => {
  const [targets, setTargets] = useState<SendTargetWithValidation[]>([]);

  useEffect(() => {
    onUpdateTargets(targets)
  }, [targets]);

  useEffect(() => { 
    setTargets((prev) => prev.map((t, index) => ({
      ...t,
      isDuplication: isDeduplication ? false : getIsDuplication(prev, t.phoneNumber, index)
    })));
  }, [isDeduplication]);

  const handleImportTargets = (newTargets: SendTargetWithValidation[]) => {
    setTargets(newTargets.map((t, index) => ({
      ...t,
      isDuplication: isDeduplication ? false : getIsDuplication(newTargets, t.phoneNumber, index)
    })));
  }

  const handleClickAllDelete = () => {
    setTargets([]);
  }

  const handleClickDelete = (rowIndex: number) => {
    const newTargets = [...targets];
    newTargets.splice(rowIndex, 1);
    setTargets(newTargets);
  }

  const handleChangeTargets = (newTargets: SendTargetWithValidation[]) => {
    setTargets(newTargets.map((t, index) => ({
      ...t,
      isDuplication: isDeduplication ? false : getIsDuplication(newTargets, t.phoneNumber, index)
    })));
  }

  return {
    targets,
    handleImportTargets,
    handleClickAllDelete,
    handleClickDelete,
    handleChangeTargets
  }
}

export const getIsDuplication = (targets: SendTargetWithValidation[], phonNumber: string, curIndex: number) => {
  const phonNumbers = targets.map((t: SendTargetWithValidation) => t.phoneNumber);
  const firstIndex = phonNumbers.findIndex(number => number === phonNumber);
  return firstIndex === -1 ? false :  firstIndex < curIndex;
}