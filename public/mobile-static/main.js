async function loadScript(src) {
  return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
  });
}

(async () => {
  await Promise.all(jsAssets.split(',').map(loadScript));
  document.body.classList.add('loaded');
})();

export default {};