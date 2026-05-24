import {getField, updateField} from 'vuex-map-fields'

const requestURL = process.env.VUE_APP_BASE_API_URI
const fileURL = process.env.VUE_APP_BASE_FILE_URI
const multipartURL = fileURL + '/multipart'

const storeSchool = {
  namespaced: true,
  state: {
    requestURL,
    fileURL,
    multipartURL,
    
    // 신규 학교 추가 신청할 학교명
    schoolAppliesTempSchoolName: null,
    alarmPlusSchools: [],
    textAuthorities: [] // 문자 서비스 권한 있는 학교
  },
  getters: {
    // eslint-disable-next-line
    getField,
    // 특정 학교의 특정 메뉴에 대한 권한 여부를 확인
    hasTextAuthorityPermission: (state) => (schoolId, menu) => {
      const authority = state.textAuthorities.find(a => a.schoolId === schoolId);
      if (!authority) return false;

      const { permissions, role } = authority;
      const allowedFeatureTypes = permissions
        .filter(p => (p.isAllowed) && p.featureType)
        .map(p => p.featureType);

      if (role === 'OWNER') return true;
      if (menu === 'send') return allowedFeatureTypes.includes('SEND_MESSAGE');
      if (menu === 'contact') return allowedFeatureTypes.includes('CONTACT');
      if (menu === 'result') return true; // 결과 메뉴는 권한만 있으면 항상 허용
      if (menu === 'permission') return role === 'OWNER';

      return true;
    },
    // 특정 메뉴 권한이 있는 첫 번째 학교 정보를 반환
    getFirstPermissibleSchool: (state, getters) => (menu = 'send') => {
      return state.textAuthorities.find(a => getters.hasTextAuthorityPermission(a.schoolId, menu));
    }
  },
  mutations: {
    // eslint-disable-next-line
    updateField,
  
    setSchoolAppliesTempSchoolName: (state, payload) => {
      state.schoolAppliesTempSchoolName = payload.schoolAppliesTempSchoolName;
    },
    setAlarmPlusSchools: (state, alarmPlusSchools) => {
      state.alarmPlusSchools = alarmPlusSchools;
    },
    setTextAuthorities: (state, textAuthorities) => {
      state.textAuthorities = textAuthorities;
    }
    
  },
  actions: {
    loadTextAuthorities: async ({rootState, commit}) => {
      try {
        const { data: { _embedded: { lists = [] } } } = await rootState.axios.get(`/schools/text/authorities`);
        commit('setTextAuthorities', lists)
      } catch (err) {
        console.error(err);
      }
    },
  }
}

export default storeSchool