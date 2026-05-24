const PREFIX = '/offerwall';

export default [
  {
    path: '/',
    name: 'offerwall',
    component: () => import('@/apps/offerwall/main.vue'),
    redirect: '/offerwall/statistics',
  },
  {
    path: PREFIX,
    name: 'offerwall',
    component: () => import('@/apps/offerwall/main.vue'),
    redirect: '/offerwall/statistics',
    children: [
      {
        path: 'statistics',
        name: 'offerwall-statistics',
        component: () => import('@/apps/offerwall/statistics.vue')
      },
      {
        path: 'settlement',
        name: 'offerwall-settlement',
        component: () => import('@/apps/offerwall/settlement/index.vue')
      }
    ]
  },
  {
    path: "/offerwall/auth/sms2fa",
    name: "offerwall-sms2fa",
    component: () => import('@/apps/login/offerwall/Sms2fa.vue')
  },
  {
    path: "/logout/offerwall",
    name: "logoutOfferwall",
    component: () => import('@/apps/login/LogoutOfferwall.vue')
  },
  {
    path: "/logout/offerwall/callback",
    name: "logoutOfferwallCallback",
    component: () => import('@/apps/login/LogoutOfferwallCallback.vue')
  },
  {
    path: "/login/callback/offerwall",
    name: "loginCallback",
    component: () => import('@/apps/login/LoginOfferwallCallback.vue')
  },
  {
    path: "*",
    name: "error-pageNotFound",
    component: () => import('@/apps/error/ErrorPageOfferwallNotFound.vue')
  },
]