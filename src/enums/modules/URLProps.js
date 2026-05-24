const URLProps = Object.freeze({
  // TODO: 20220822 websocket error test
  HITALK_CONNECT_URL: `${process.env.VUE_APP_CHAT_CONNECT_URL_PREFIX}${sessionStorage.webSocketErrorTest || ''}${process.env.VUE_APP_CHAT_CONNECT_URL_SUFFIX}`,
  HITALK_PUBLISH_URL: process.env.VUE_APP_CHAT_PUBLISH_URL,
  HITALK_SUBSCRIBE_URL: process.env.VUE_APP_CHAT_SUBSCRIBE_URL,
  API_SERVER_URL: process.env.VUE_APP_BASE_API_URI,
  FILE_SERVER_URL: process.env.VUE_APP_BASE_FILE_URI,
  DEFAULT_PROFILE_IMAGE_URL: process.env.VUE_APP_URL_PROTOCOL + process.env.VUE_APP_BASE_CDN_URI + "/static/images/user_profile_default.png",
  DEFAULT_CLASS_IMAGE_URL : process.env.VUE_APP_URL_PROTOCOL + process.env.VUE_APP_BASE_CDN_URI + "/7e30/8730/178730/68969468-120a-4904-a4e8-d99d427bc441.png",
  DEFAULT_SCHOOL_IMAGE_URL : process.env.VUE_APP_URL_PROTOCOL + process.env.VUE_APP_BASE_CDN_URI + "/static/images/school_image_default.png",
  APP_CHAT_API_SERVER_URI : process.env.VUE_APP_CHAT_API_SERVER_URI,
  BEHAVIOR_CONNECT_URL : `${process.env.VUE_APP_BEHAVIOR_CONNECT_URL_PREFIX}${sessionStorage.webSocketErrorTest || ''}${process.env.VUE_APP_BEHAVIOR_CONNECT_URL_SUFFIX}`,
  BEHAVIOR_PUBLISH_URL: process.env.VUE_APP_BEHAVIOR_PUBLISH_URL,
  BEHAVIOR_SUBSCRIBE_URL: process.env.VUE_APP_BEHAVIOR_SUBSCRIBE_URL,
});

export default URLProps;