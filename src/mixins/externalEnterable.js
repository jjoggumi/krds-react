const queryMap = () => 
  window.location.search.slice(1).split('&').reduce((a, e) => (([k, v]) => ({...a, [k]: v}))(e.split('=')), {});

export const loginKeys = ['uuid', 'idToken', 'refreshToken', 'userType', 'forceRefresh'];
export const skipPaths = ['/p2t'];

export default {
  beforeCreate() {
    if (skipPaths.some(p => window.location.pathname.startsWith(p))) return;
    const params = queryMap();
    const passedKeys = loginKeys.filter(k => params[k]);
    passedKeys.forEach(k => localStorage.setItem(k, params[k]));
    if (passedKeys.length === loginKeys.length) {
      window.location.href = window.location.href.replace(window.location.search, '');
      this.$destroy();
    }
  }
}