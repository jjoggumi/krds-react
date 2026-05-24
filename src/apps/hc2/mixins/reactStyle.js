// Refcount map for shared styles
const styleRefCounts = {};

export default {
  methods: {
    applyStyle(selection) {
      if (typeof document === 'undefined') return;

      const assets = window.__REACT_ASSETS__ || {};
      const { hcCommonCss, tailwindCss } = assets;

      const ALL_KEYS = ['hcCommonCss', 'tailwindCss'];
      const enabled = (() => {
        if (!selection) return new Set(ALL_KEYS);
        if (typeof selection === 'string') return new Set([selection]);
        if (Array.isArray(selection)) return new Set(selection);
        if (typeof selection === 'object') {
          return new Set(ALL_KEYS.filter((k) => Boolean(selection[k])));
        }
        return new Set(ALL_KEYS);
      })();

      if (enabled.has('hcCommonCss') && hcCommonCss) {
        styleRefCounts['hcCommonCss'] = (styleRefCounts['hcCommonCss'] || 0) + 1;
        if (!document.getElementById('hcCommonCss')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = hcCommonCss;
          link.id = 'hcCommonCss';
          document.body.appendChild(link);
        }
      }

      if (enabled.has('tailwindCss') && tailwindCss) {
        styleRefCounts['hcTailwindCss'] = (styleRefCounts['hcTailwindCss'] || 0) + 1;
        if (!document.getElementById('hcTailwindCss')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = tailwindCss;
          link.id = 'hcTailwindCss';
          document.body.appendChild(link);
        }
      }
    },

    removeStyle(selection) {
      if (typeof document === 'undefined') return;

      const ALL_KEYS = ['hcCommonCss', 'tailwindCss'];
      const enabled = (() => {
        if (!selection) return new Set(ALL_KEYS);
        if (typeof selection === 'string') return new Set([selection]);
        if (Array.isArray(selection)) return new Set(selection);
        if (typeof selection === 'object') {
          return new Set(ALL_KEYS.filter((k) => Boolean(selection[k])));
        }
        return new Set(ALL_KEYS);
      })();

      if (enabled.has('tailwindCss') && (styleRefCounts['hcTailwindCss'] || 0) > 0) {
        styleRefCounts['hcTailwindCss'] -= 1;
        if (styleRefCounts['hcTailwindCss'] <= 0) {
          const tailwind = document.getElementById('hcTailwindCss');
          if (tailwind) document.body.removeChild(tailwind);
          styleRefCounts['hcTailwindCss'] = 0;
        }
      }

      if (enabled.has('hcCommonCss') && (styleRefCounts['hcCommonCss'] || 0) > 0) {
        styleRefCounts['hcCommonCss'] -= 1;
        if (styleRefCounts['hcCommonCss'] <= 0) {
          const hcCommonCss = document.getElementById('hcCommonCss');
          if (hcCommonCss) document.body.removeChild(hcCommonCss);
          styleRefCounts['hcCommonCss'] = 0;
        }
      }
    },

    setVh() {
      document.documentElement.style.setProperty(
        '--vh',
        `${window.innerHeight * 0.01}px`
      );
    },
  },
};
