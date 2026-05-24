"use strict";

import Vue from 'vue';
import VueLazyload from 'vue-lazyload'

Vue.use(VueLazyload, {
	preLoad: 1.3,
	// error: 'dist/error.png',
	// loading: 'http://download.hiclass.net/static/images/image_lazy_loading.gif',
	error: '',
	loading: '',
	attempt: 1,
	throttleWait: 200,
	// the default is ['scroll', 'wheel', 'mousewheel', 'resize', 'animationend', 'transitionend']
	listenEvents: ['scroll'],
	lazyComponent: true
})