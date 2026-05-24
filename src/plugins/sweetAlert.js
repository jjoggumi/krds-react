"use strict"

import swal from "sweetalert2";

///////////////////////////////////////////////////////////////
// Alert
///////////////////////////////////////////////////////////////
export function swalOptions(text, icon) {
  const customClass = 'swal2-custom-class'

  return {
    html: text,
    icon: icon,
    buttonsStyling: true,
    /**
     * https://sweetalert2.github.io/#configuration
     *
     * customClass: {
          container: '...',
          popup: '...',
          header: '...',
          title: '...',
          closeButton: '...',
          icon: '...',
          image: '...',
          content: '...',
          htmlContainer: '...',
          input: '...',
          inputLabel: '...',
          validationMessage: '...',
          actions: '...',
          confirmButton: '...',
          denyButton: '...',
          cancelButton: '...',
          loader: '...',
          footer: '....'
        }
     */
    customClass: {
      popup: customClass,
      container: customClass,
      actions: customClass,
      confirmButton: customClass,
      cancelButton: customClass,
      denyButton: customClass,
    }
  };
}

/**
 * sweet alert 2
 * @param text
 * @param icon
 * @param autoClose
 * @return {Promise<unknown>}
 */
export function alert(text, icon, autoClose) {
  // return new Promise((resolve, reject) => {
  return new Promise((resolve) => {
    let options = swalOptions(text, icon);
    if (autoClose === true) {
      options.showCancelButton = false;
      options.showConfirmButton = false;
      options.timer = 1200;
    } else {
      options.showCancelButton = false;
      options.showConfirmButton = true;
      options.confirmButtonText = "확인";
    }

    swal.fire(options).then(result => {
      // if (result.value == true) {
      //   resolve(result);
      // } else {
      //   reject(result);
      // }
      resolve(result);
    });
  });
}

export function confirm(text, icon, opts) {
  return new Promise((resolve, reject) => {
    let options = swalOptions(text, icon);
    options.showCancelButton = true
    options.showDenyButton = false
    options.showConfirmButton = true
    options.confirmButtonText = "확인"
    options.denyButtonText = "거절"
    options.cancelButtonText = "취소"
    options.reverseButtons = false

    if (opts && Object.keys(opts).length > 0) {
      for (const [key, value] of Object.entries(opts))
        options[key] = value
    }

    swal.fire(options)
      .then(result => result.isDismissed ? reject(result) : resolve(result))
  })
}

export function confirmDelete() {
  return confirm("삭제 하시겠습니까?", "warning");
}

export function confirmUpdate() {
  return confirm("적용 하시겠습니까?", "warning");
}

export function alertCreate() {
  return alert("저장 되었습니다.", "success", true);
}

export function alertUpdate() {
  return alert("수정 되었습니다.", "success", true);
}

export function alertDelete() {
  return alert("삭제 되었습니다.", "success", true);
}

export function alertError() {
  return alert(
    "서버와의 통신이 지연되고 있습니다.<br/>잠시후 다시 시도 하여 주십시오.",
    "error",
    false
  );
}

export function alertSearch() {
  return alert("검색어를 입력해주세요", "error", false);
}