"use strict";

import Vue from 'vue';
import vueScrollTo from "vue-scrollto";

Vue.use(vueScrollTo, {
	container: "body",
	duration: 300,
	easing: "ease",
	offset: 0,
	force: true,
	cancelable: true,
	onStart: false,
	onDone: false,
	onCancel: false,
	x: false,
	y: true
});