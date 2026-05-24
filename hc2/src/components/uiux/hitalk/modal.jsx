import Style from './modal.module.css'
import { Icon } from '@/components/uiux'
import ReactDOM from 'react-dom/client';
import { RoundedButton } from './buttons'

export const ModalBackground = ({ children }) => {
  return (
    <div className={Style.modalBackground}>
      {children}
    </div>
  )
}

export const Modal = ({ children, shown }) => {
  return shown ? <ModalBackground>
      { children }
    </ModalBackground> : <></>
}

export const Dialog = ({ children, shown, onClose = () => {}, withCloseButton = true, className = '', footer }) => {
  return (
    <Modal shown={shown}>
      <div className={`${Style.modalDialog} ${className} modal-dialog`}>
        <div className={Style.modalHeader}>
          {withCloseButton && <Icon icon='close' onClick={onClose} />}
        </div>
        <div className={Style.modalContent}>
          {children}
        </div>
        <div className={Style.modalFooter}>
          {footer}
        </div>
      </div>
    </Modal>
  )
}

let exclusiveModal = null;

const showModal = ({content, footer, withCloseButton=false, exclusive=false, className=''}) => {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.zIndex = '100000';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '100vw';
  container.style.height = '100vh';
  document.body.appendChild(container);

  return new Promise((resolve) => {
    const root = ReactDOM.createRoot(container);
    let closed = false;
    const close = (result) => {
      if (closed) return;
      closed = true;
      root.unmount();
      container.remove();
      resolve(result);
      if (exclusiveModal === close) {
        exclusiveModal = null;
      }
    };

    if (exclusive) {
      if (exclusiveModal && typeof exclusiveModal === 'function') {
        exclusiveModal(undefined);
      }
      exclusiveModal = close;
    }

    root.render(
      <Dialog shown={true} onClose={() => close(undefined)} withCloseButton={withCloseButton} footer={footer(close)} className={className}>
        {content(close)}
      </Dialog>
    );
  });
};

export const ShowAlert = async (message, confirmLabel = '확인', options = {}) => {
  const { className = '' } = options;
  await showModal({content: (close) => (
    <div className={Style.alertDialog}>
      <pre className={Style['alertMessage']}>{message}</pre>
    </div>
  ), footer: (close) => (
    <RoundedButton className={Style.confirmButton} onClick={() => close(true)}>{confirmLabel}</RoundedButton>
  ), withCloseButton: false, exclusive: true, className});
};

export const ShowConfirm = async (message, options = {}) => {
  const { confirmLabel, cancelLabel, reverse, className, hideCancel, withCloseButton, confirmClassName, cancelClassName } = {
    ...{ confirmLabel: '확인', cancelLabel: '취소', reverse: false, className: '', hideCancel: false, withCloseButton: false, confirmClassName: '', cancelClassName: '' },
    ...options
  };
  
  // confirmLabel이 '삭제'일 때 자동으로 warning 클래스 추가
  const confirmWarningClass = confirmLabel === '삭제' ? 'bg-warning' : '';
  
  return await showModal({
    content: (close) => (
      <div className={Style.alertDialog}>
        <pre className={Style.alertMessage}>{message}</pre>
      </div>
    ),
    footer: (close) => {
      const confirm = <RoundedButton className={`${Style.confirmButton} ${confirmWarningClass} ${confirmClassName}`.trim()} onClick={() => close(true)}>{confirmLabel}</RoundedButton>;
      const cancel = <RoundedButton className={`${Style.cancelButton} ${cancelClassName}`.trim()} onClick={() => close(false)} filled={false}>{cancelLabel}</RoundedButton>;
      if (hideCancel) {
        return <>{confirm}</>;
      }
      return (
        <>
          {reverse ? cancel : confirm}
          {reverse ? confirm : cancel}
        </>
      );
    },
    withCloseButton,
    exclusive: true,
    className
  });
};

export const CONFIRM_OPTIONS = {
  // 시간표
  TIME_TABLE: {
    className: 'time-table-alert',
  },
  // 문자
  TEXT: {    
    className: 'text-alert',
    withCloseButton: true,
    reverse: true,
  },
};