import Vue, { getCurrentInstance } from "vue";
import Dialog from "@/apps/timetable/q-temp/Dialog.vue"

const useDialog = () => {
  // @ts-ignore
  const { proxy } = getCurrentInstance();

  const toast = (message: string, options: any | undefined = undefined) => {
    if(options === undefined) {
      options = {
        duration: 2000,
        className: "type01",
      }
    }

    // proxy.$toasted.clear();
    proxy.$toasted.show(message, options);
  }

  const alert = (message: string) => {
    // quasar의 dialog를 hiClass의 alert로 교체: prototype -> hi-class-ui
    proxy.$hiClass.alert(message);
    /*
    $q.dialog({
      title: '알림',
      message,
    });
    */

    return;
  };


  const confirmSimple = async (
    text: string
  ) => {
    const confirmed = await confirm?.(text, null, {
      customClass: {
        popup: 'timetable-confirm',
        confirmButton: 'btn-primary',
      },
      showCloseButton: true,
    });

    return confirmed;
  };

  const alertSimple = async (
    text: string
  ) => {
    await confirm(text, null, {
      showCancelButton: false,
      customClass: 'timetable-confirm',
      showCloseButton: true,
    });
  };

  const confirm = async (
    text: string,
    icon: any = null,
    options: any = null,
  ) => {
    return (await proxy.$hiClass.confirm(text, icon, options).catch(() => {}) || { isConfirmed: false }).isConfirmed;
  };


  // @Deprecated
  // prototype의 confirm을 hiClass의 confirm으로 매칭
  const _confirm = async (
    message: string,
    title: string | undefined = undefined
  ) => {
    if (!title) {
      title = '확인';
    }2

    return new Promise((resolve) => {
      // quasar의 dialog를 hiClass의 confirm으로 교체: prototype -> hi-class-ui
      proxy.$hiClass.confirm(message)
      .then((result: boolean) => {
        resolve(result);
      })
      .catch(() => {
        resolve(false);
      });
    });

    /*
    return new Promise((resolve) => {
      $q.dialog({
        title,
        message,
        cancel: {
          label: '취소',
        },
        ok: {
          label: '확인',
        },
        persistent: true,
      })
        .onOk(() => {
          resolve(true);
        })
        .onCancel(() => {
          resolve(false);
        })
        .onDismiss(() => {
          resolve(false);
        });
        
    });
    */
  };

  const qDialog = (options: any) => {
    return new Promise((resolve, reject) => {
      const DialogComponent = Vue.extend(Dialog);
      const instance = new DialogComponent({
        propsData: options
      });

      instance.$on('ok', (data: any) => {
        resolve(data);
        instance.$destroy();
        document.body.removeChild(instance.$el);
      });

      instance.$on('cancel', () => {
        reject('cancel');
        instance.$destroy();
        document.body.removeChild(instance.$el);
      });

      instance.$on('dismiss', () => {
        reject('dismiss');
        instance.$destroy();
        document.body.removeChild(instance.$el);
      });

      const el = document.createElement('div');
      document.body.appendChild(el);
      instance.$mount(el);
    });
  };

  return {
    confirmSimple,
    alertSimple,
    alert,
    toast,
    confirm,
    _confirm,

  };
};

export { useDialog };
