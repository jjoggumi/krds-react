const hiClassAppVersion = () => {
  const match = window.navigator.userAgent.match(/com\.iscreammedia\.app\.hiclass\.[a-zA-Z]+\/([\d.]+)/);
  return match ? match[1] : undefined;
}

const appVersion = hiClassAppVersion()
const mobileHelpVersion = appVersion ? (appVersion >= '1.23.17' ? '2' : '') : document.location.search.includes('v2') ? '2' : ''

export default () => ({
  pathOfMobileHelp: `/mobile/help${mobileHelpVersion}`,
})