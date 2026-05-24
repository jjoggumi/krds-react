"use strict"

import Vue from 'vue'
import moment from 'moment'
/**
 * moment.lang Deprecated in 2.8.1
 * https://momentjs.com/docs/#/i18n/changing-locale/
 */
moment.locale('ko', {
	weekdays: '일요일_월요일_화요일_수요일_목요일_금요일_토요일'.split('_'),
	weekdaysShort: '일_월_화_수_목_금_토'.split('_'),
})

Vue.prototype.$moment = moment

export default moment