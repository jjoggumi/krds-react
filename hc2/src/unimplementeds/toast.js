const getToastOptions = (durationOrOptions = 3000) => {
  if (typeof durationOrOptions === 'number') {
    return {
      duration: durationOrOptions,
    };
  }

  return {
    duration: 3000,
    ...durationOrOptions,
  };
};

const applyToastStyles = (options = {}) => {
  if (!options.containerStyle) {
    return;
  }

  requestAnimationFrame(() => {
    const container = document.querySelector('.toasted-container');

    if (!container) {
      return;
    }

    Object.entries(options.containerStyle).forEach(([key, value]) => {
      container.style[key] = value;
    });
  });
};

export const showToast = (message, durationOrOptions = 3000) => {
  if (!window.app?.$toasted) return;
  const toasted = window.app.$toasted;
  const toastOptions = getToastOptions(durationOrOptions);

  toasted.clear();

  applyToastStyles(toastOptions);
  toasted.show(message, toastOptions);
}
