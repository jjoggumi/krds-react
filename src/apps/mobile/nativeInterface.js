import isMobileJs from "ismobilejs";

const isMobileObj = isMobileJs(window.navigator);
const anyOf = obj => Object.keys(obj).some(key => obj[key]);
const mobileDevice = anyOf(isMobileObj.android) ? 'android' : anyOf(isMobileObj.apple) ? 'apple' : 'unknown';
const iosPostMessage = command => window.webkit.messageHandlers.iOSHandler.postMessage({ command })
const execute = command => ({android: () => AOSHandler[command](),
    apple: () => iosPostMessage(command)}[mobileDevice] || (() => {}))();

export default {
  goBack: () => execute('goBack'),
  sendAgreementCompleted: () => execute('agreementCompleted'),
  sendGuardianVerificationRequired: () => execute('guardianVerificationRequired'),
}
