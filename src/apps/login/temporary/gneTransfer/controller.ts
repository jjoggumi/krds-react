import { ref } from 'vue';
import comn from '@/assets/js/common';
import axios from "@/plugins/axios";
import URLProps from "@/enums/modules/URLProps";
import authentication from '@/plugins/authentication';
import ConfirmPopup from './ConfirmPopup.vue'
import ResultPopup from './ResultPopup.vue';

const loginPageParams = {
  subMessage: '앞으로 이용을 원하는 SNS 계정을 선택해주세요.',
}

export class Controller {
  component: any;
  url: URL;

  constructor () {
    this.component = ref(null);
    this.url = new URL(window.location.href);
  }

  public async process() {
    ([
      () => this.goWhaleSpace(),
      () => this.showConfirmPopup(),
      () => this.showSnsPage(),
      () => this.processTransfer()
    ][this.determineStep()])();
  }

  public getComponent () {
    return this.component;
  }

  private determineStep(): number {
    const step = this.getParam('step');
    return step ? parseInt(step, 10) : 0;
  }
  
  private goWhaleSpace () {
    localStorage.clear();

    const callbackUrl: string = process.env.VUE_APP_BASE_LOGIN_CALLBACK_PARAMETER_PREFIX +
      window.location.protocol +
      '//' + window.location.hostname + comn.getLocationPort() +
      '/tep?step=1';

    const baseLoginUri = process.env.VUE_APP_BASE_LOGIN_URI || '';
    const baseLoginGnePath = process.env.VUE_APP_BASE_LOGIN_GNE_PATH || '';
    window.location.href = baseLoginUri + baseLoginGnePath + callbackUrl;
  }

  private async showConfirmPopup () {
    authentication.save(this.getParamsMap());
    try {
      const response = await axios({
        method: 'get',
        baseURL: URLProps.API_SERVER_URL,
        url: `/users/${localStorage.uuid}`
      });
      this.component.value = { component: ConfirmPopup, props: { user: response.data } };
    } catch (e) {
      console.log(e);
    }

  }

  private showSnsPage () {
    const userType = localStorage.userType;
    const loginSuffix = userType === 'TEACHER' ? 'teacher/v2' : 'student';
    window.location.href = `/login/${loginSuffix}?tep=${this.buildUriEncodedParameters(loginPageParams)}
    `;
  }

  private async processTransfer () {
    const params = this.getParamsMap();
    let response: any = null;
    try {
      response = await axios({
        method: 'post',
        baseURL: URLProps.API_SERVER_URL,
        url: `/users/${localStorage.uuid}/switch`,
        data: {
          c: params.clientRegistrationId,
          n: params.principalName,
        }
      });
    } catch (error:any) {
      response = error.response;
    }
    const status: number = response.status;

    this.component.value = { component: ResultPopup, props: { status }};
  }

  private buildUriEncodedParameters(params: { [key: string]: string }): string {
    return btoa(encodeURIComponent(JSON.stringify(params)));
  }

  private getParamsMap(): { [key: string]: string } {
    const params: { [key: string]: string } = {};
    this.url.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }

  private getParam(key: string): string {
    return this.url.searchParams.get(key) || '';
  }
}