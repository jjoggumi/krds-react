"use strict";

import Vue from 'vue';
import VueLogger from 'vuejs-logger';
import CONSTANTS from '@/plugins/constants.js';

const webURL = process.env.VUE_APP_BASE_UI_URI;
const isProduction = process.env.NODE_ENV === 'production';
const isProductionUI = webURL === 'https://www.hiclass.net';
const logLevel = isProduction && isProductionUI ? CONSTANTS.LOG_LEVELS.ERROR : CONSTANTS.LOG_LEVELS.DEBUG;
 
const options = {
    isEnabled: true,
    logLevel: logLevel,
    stringifyArguments: false,
    showLogLevel: false,
    showMethodName: false,
    separator: '|',
    showConsoleColors: true
};
 
Vue.use(VueLogger, options);