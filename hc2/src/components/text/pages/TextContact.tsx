import React, { useState } from 'react';
import { useLoadingContext } from '../context/LoadingContext';
import { useTextContext } from '@/components/text/context/TextContext';
import { useExcelDownloadContact } from '@/components/text/hooks/contact';
import { useContactDownloadReasonMutation } from '@/components/text/queries/useContact';
import { getTextEletter } from '@/components/text/api/contact';

import { ContactGroupList } from '@/components/text/components/contact/ContactGroupList';
import { ContactBody } from '@/components/text/components/contact/ContactBody';
import { TitleArea } from '@/components/uiux/titlearea';
import { BatchImport } from '@/components/text/components/contact/BatchImport';
import ContactPasswordModal from '@/components/text/components/contact/modal/ContactPasswordModal';
import { ContactGroupContextProvider } from '@/components/text/context/ContactContext';
import { MaskingProvider } from '../context/MaskingContext';
import { useApiErrorHandler } from '../hooks/apiErrorHandler';
import { motion } from 'framer-motion';
import {
  STAGGER_CONTAINER_VARIANTS,
  FADE_IN_UP_ORDERED_VARIANTS,
} from '@/components/text/constants/animations';

export const TextContact = () => {
  const { showLoading, hideLoading } = useLoadingContext();
  const { currentSchool } = useTextContext();
  const { generateElContactExcel } = useExcelDownloadContact();
  const { createReasonMutateAsync } = useContactDownloadReasonMutation();
  const { handleError } = useApiErrorHandler();

  // 일괄등록 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [downloadTask, setDownloadTask] = useState<{ fileName: string, password: string, contacts?: any[], reasonItem?: any, isEletter?: boolean } | null>(null);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleReadyDownload = (fileName: string, options: { contacts?: any[], reasonItem?: any, isEletter?: boolean }) => {
    const password = crypto.randomUUID();
    setDownloadTask({ fileName, password, ...options });
    setIsPasswordOpen(true);
  };

  const handleDownloadConfirm = async () => {
    if (!downloadTask) return;
      const { fileName, password, contacts, reasonItem, isEletter } = downloadTask;
    try {
      showLoading();

      let targetContacts = contacts;
      if (reasonItem) {
        targetContacts = await createReasonMutateAsync({ schoolId: currentSchool.schoolId, reasonItem });
      } else if (isEletter) {
        targetContacts = await getTextEletter(currentSchool.schoolId);
      }

      if (targetContacts && targetContacts.length > 0) {
        await generateElContactExcel(targetContacts, fileName, password);
      }
    } catch(e) {
      handleError(e);
    } finally {
      setDownloadTask(null);
      setIsPasswordOpen(false);
      hideLoading();
    }
  };

  return (
    <>
      <div className="-mt-10 pt-10 sticky -top-10 bg-bg-base z-1">
          <TitleArea variant="col" level={1} summaryLevel={2} title="주소록" summary="학교 연락처를 등록하고 관리하실 수 있습니다."  />
      </div>
      <ContactGroupContextProvider isPermissionRequired={true}>
        <motion.div
          className="flex gap-10 mt-7.5"
          initial="hidden"
          animate="visible"
          variants={STAGGER_CONTAINER_VARIANTS}
        >
          <motion.div custom={0} variants={FADE_IN_UP_ORDERED_VARIANTS}>
            <ContactGroupList onOpenModal={handleOpenModal} isBatchImportOpen={isModalOpen} isChangeRouteMode={true} isEditable={true} />
          </motion.div>
          <motion.div custom={0} variants={FADE_IN_UP_ORDERED_VARIANTS} className="flex-1 min-w-0">
            <ContactBody onOpenModal={handleOpenModal} onReadyDownload={handleReadyDownload} />
          </motion.div>
        </motion.div>

        <MaskingProvider
          initialIsMasked={true} >
          <BatchImport isOpen={isModalOpen} onClose={handleCloseModal} onReadyDownload={handleReadyDownload} />
        </MaskingProvider>

        {isPasswordOpen && downloadTask && (
          <ContactPasswordModal
            isOpen={isPasswordOpen}
            password={downloadTask.password}
            onClose={() => setIsPasswordOpen(false)}
            onConfirm={handleDownloadConfirm}
          />
        )}
      </ContactGroupContextProvider>
    </>
  );
};
