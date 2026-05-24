"use strict";

import $ from "jquery";

const imgUtil = {
  cropForIE(imgElement) {
    const t = imgElement;
    const s = 'url(' + t.src + ')', // 이미지 태그의 src를 가져옴.
      p = t.parent(); // 부모 컨테이너 'a'
    // eslint-disable-next-line no-unused-vars
    const p2 = p.parent(), // 부모 컨테이너 '.img-container'
      d = $('<div class="backGround"></div>'); // div를 하나 만듦.

    t.hide(); //이미지는 숨기고.
    p.append(d); //부모div에 생성한 div를 붙임.

    d.css({
      'height': 300,
      'background-size': 'cover',
      'background-repeat': 'no-repeat',
      'background-position': 'center',
      'background-image': s,
      'border': '1px solid red'
    });
  },
  setCropBoxImgStyle(w, h) {
    return {
      width: w,
      height: h,
      "text-align": "center"
    };
  }
};

export default imgUtil;
