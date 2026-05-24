import Vue from 'vue'
import axios from "axios";
import store from "@/plugins/vuex/store";

const _terms = {
	/**
	 * 최신 이용약관 가져오기
	 * @returns {AxiosPromise}
	 */
	getService() {
		return axios({
			method: 'GET',
			url: `https://download.hiclass.net/static/terms/service/service_${store.getters.getRecentServiceRecord}.html?timestamp=${new Date().getTime()}`
		})
	},

	/**
	 * 민감정보 동의내역 가져오기
	 * @returns {AxiosPromise}
	 */
	getSensitive(record) {
		return axios({
			method: 'GET',
			url: `https://download.hiclass.net/static/terms/sensitive/${record}.html?timestamp=${new Date().getTime()}`
		})
	},
		
	/**
	 * 개인정보 처리 방침 가져오기
	 * @returns {AxiosPromise}
	 */
	getPrivacy(privaceRecord) {
		return axios({
			method: 'GET',
			url: `https://download.hiclass.net/static/terms/privacy/privacy_${privaceRecord}.html?timestamp=${new Date().getTime()}`
		})
	},

	/**
	 * 개인정보 처리 방침 축약 가져오기
	 * @returns {AxiosPromise}
	 */
	getPrivacyPreview() {
		return axios({
			method: 'GET',
			url: `https://download.hiclass.net/static/terms/privacyPreview/privacy_preview_${store.getters.getRecentPrivacyPreviewRecord}.html?timestamp=${new Date().getTime()}`
		})
	},

  /**
   * 개인정보 처리 방침 축약 가져오기 (사용자 타입별)
   * @returns {AxiosPromise}
   */
  getPrivacyPreviewByUserType(userType) {
    const recentPrivacyPreviewRecord = store.getters.getRecentPrivacyPreviewRecordByUserType(userType)
    return axios({
      method: 'GET',
      url: `https://download.hiclass.net/static/terms/privacyPreview/${userType.toLowerCase()}/privacy_preview_${recentPrivacyPreviewRecord}.html?timestamp=${new Date().getTime()}`
    })
  },

  getPrivacyUseDetail(targetMonth) {
    return axios({
      method: 'GET',
      url: `https://download.hiclass.net/static/terms/privacyUseDetail/privacyUseDetail_${targetMonth}.html?timestamp=${new Date().getTime()}`
    })
  },

  getTextPolicy(textRecord) {
    return axios({
      method: 'GET',
      url: `https://download.hiclass.net/static/terms/text/text_${textRecord}.html?timestamp=${new Date().getTime()}`
    })
  },

  parsingHtmlGetHead(str) {
    let parser = new DOMParser()
    let doc = parser.parseFromString(str, 'text/html')
    return doc.head
  },

	parsingHtml(str) {
		let parser = new DOMParser()
		let doc = parser.parseFromString(str, 'text/html')
		return doc.body.innerHTML
	},

	/**
	 * 개정일 배열 json 데이터
	 * @returns {AxiosPromise}
	 */
	getTermsRecord() {
    const fileName = process.env.VUE_APP_BASE_UI_URI === 'https://www.hiclass.net' ? 'terms_record' : 'terms_record_dev'

		return axios({
			method: 'GET',
			url: `https://download.hiclass.net/static/terms/${fileName}.json?timestamp=${new Date().getTime()}`
		})
	},

  /**
   * 알레르기 정보 수집 및 이용 동의
   * SensitiveAgreementModal.vue에서 사용중
   * @returns {AxiosPromise}
   */
  getSensitiveInfoUse() {
    const fileName = process.env.VUE_APP_BASE_UI_URI === 'https://www.hiclass.net' ? 'allergy' : 'dev.allergy'
    return axios({
      method: 'GET',
      url: `https://download.hiclass.net/static/terms/sensitive/${fileName}.json`
    })
  },

  /**
   * 알레르기 정보 수집 및 이용 동의
   * SensitiveAgreementModal.vue에서 사용중
   * @returns {AxiosPromise}
   */
  getSensitiveInfoThirdParty() {
    const fileName = process.env.VUE_APP_BASE_UI_URI === 'https://www.hiclass.net' ? 'medication' : 'dev.medication'
    return axios({
      method: 'GET',
      url: `https://download.hiclass.net/static/terms/sensitive/${fileName}.json`
    })
  }
}

const terms = {};
terms.install = function (Vue) {
	Vue.terms = _terms;
	window.terms = _terms;
	Object.defineProperties(Vue.prototype, {
		terms: {
			get() {
				return _terms;
			}
		},
		$terms: {
			get() {
				return _terms;
			}
		},
	});
};

Vue.use(terms)

export default terms;
