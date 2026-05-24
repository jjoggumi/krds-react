"use strict"

import Vue from 'vue'
import $ from "jquery";
import "jquery.scrollbar";
import "jquery-ui/ui/widgets/slider";

import "jquery-ui/themes/base/all.css";

const jqueryUtil = {
  /**
   * jquery custom scrollbar init
   */
  scrollbar() {
    const selector = $(".scrollbar-outer")
    if (selector.length > 0)
      selector.scrollbar();
  }
};

Vue.prototype.$jqueryUtil = jqueryUtil;