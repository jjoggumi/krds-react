import HiModal from '@/components/uiux/hiModal';
import { HiButton } from '@/components/uiux';
import { useApiErrorHandler } from '@/components/text/hooks/apiErrorHandler';
import { showToast } from '@/unimplementeds/toast';
interface ContactPasswordModalProps {
  isOpen: boolean;
  password: string;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

const ContactPasswordModal = ({ isOpen, password, onClose, onConfirm }: ContactPasswordModalProps) => {
  const { handleError } = useApiErrorHandler();

  const handleCopy = () => {
    navigator.clipboard.writeText(password).then(() => {
      showToast('비밀번호가 복사되었습니다.');
    });
  };

  const handleConfirm = async () => {
    try {
      handleCopy();
      await onConfirm();
    } catch (e) {
      await handleError(e);
    }
  };

  return (
    <HiModal
      isOpen={isOpen}
      onClose={onClose}
      dimClose
      size="md"
      content={(
        <>
          <div className="mb-4 -mt-4">
            <div className="text-leading-b1 font-bold">파일 비밀번호 확인</div>
            <div className="text-leading-b2">비밀번호는 타인에게 공유하지 마시고, 업무 목적 달성 후 즉시 파기하여 주시기 바랍니다.</div>
          </div>
          <div className="flex justify-between items-center border-control-neutral-strong bg-control-neutral-base rounded-sm px-3 py-1.5">
            <div className='text-leading-b2'>{password}</div>            
            <HiButton variant="tertiaryBlue" size="sm" onClick={handleCopy}>복사</HiButton>
          </div>
        </>
      )}
      footer={(
        <>
          <HiButton variant="tertiary" size="lg" onClick={onClose}>취소</HiButton>
          <HiButton variant="primary" size="lg" onClick={handleConfirm}>확인</HiButton>
        </>
      )}
    />
  );
};

export default ContactPasswordModal;
