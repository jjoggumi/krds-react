import { ref } from 'vue';
import axios from "@/plugins/axios";
import URLProps from "@/enums/modules/URLProps";
import authentication from '@/plugins/authentication';
import ConfirmPopup from './ConfirmPopup.vue'
import ResultPopup from './ResultPopup.vue';
import Announcement from './Announcement.vue';
import LoginParents from './LoginParents.vue';
import LoginTeacher from './LoginTeacher.vue';
import { remoteConfig, FirebaseRemoteConfigKey } from '@/plugins/firebase'

const loginPageParams = {
  subMessage: '앞으로 이용을 원하는 SNS 계정을 선택해주세요.',
}

export class Controller {
  component: any;
  url: URL;
  applyEntryPath: string = '';

  constructor () {
    this.component = ref({});
    this.url = new URL(window.location.href);
  }

  public async process(applyEntryPath: string) {
    this.applyEntryPath = applyEntryPath;
    ([
      () => this.showAnnouncement(),
      () => this.showLoginParents(),
      () => this.showConfirmPopup(),
      () => this.showLoginTeacher(),
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
  
  private async showAnnouncement () {
    if (!(await this.checkExpired())) return;
    this.component.value = { component: Announcement };
  }

  private showLoginParents () {
    this.component.value = { component: LoginParents };
  }

  private showLoginTeacher () {
    this.component.value = { component: LoginTeacher };
  }

  private async showConfirmPopup () {
    authentication.save(this.getParamsMap());
    sessionStorage.setItem('idTokenForP2T', localStorage.idToken)
    if(!(await this.checkApplyStatus())) return;
    try {
      const response = await axios({
        method: 'get',
        baseURL: URLProps.API_SERVER_URL,
        url: `/users/${localStorage.uuid}`
      });
      this.component.value = { component: ConfirmPopup, props: { user: response.data, applyEntryPath: this.applyEntryPath } };
    } catch (e) {
      console.log(e);
    }

  }

  private async processTransfer () {
    const {clientRegistrationId, principalName} = this.getParamsMap();
    if (sessionStorage.getItem('idTokenForP2T')) {
      localStorage.setItem('idToken', sessionStorage.getItem('idTokenForP2T') || '');
      sessionStorage.removeItem('idTokenForP2T');
    }
    let response: any = null;
    try {
      response = await axios({
        method: 'post',
        baseURL: URLProps.API_SERVER_URL,
        url: `/eventTeacherAuth/switch`,
        data: {
          applyEntryPath: this.applyEntryPath,
          c: clientRegistrationId, n: principalName
        }
      });
    } catch (error:any) {
      response = error.response;
    }
    const status: number = response.status;

    this.component.value = { component: ResultPopup,
      props: { status,
        returnUri: [200, 204].includes(status) ? '/login/teacher/v2' : `/p2t/${this.applyEntryPath}?step=1`,
        data: {...response.data, clientRegistrationId} }};
  }

  private async checkExpired () {
    await remoteConfig.ensureInitialized()
    await remoteConfig.fetchAndActivate()
    const eventControlMap = JSON.parse(remoteConfig.getString(FirebaseRemoteConfigKey.EVENT_CONTROL) || '{}')
    if ((eventControlMap[this.applyEntryPath] || {expire: false}).expire) {
      this.component.value = { component: ResultPopup, props: { status: 410 }};
      return false;
    }
    return true;
  }

  private async checkApplyStatus () {
    try {
      const response = await axios.get(`/eventTeacherAuth?applyEntryPath=${this.applyEntryPath}`);
      if (response.data.applyStatus !== 'APPROVED') {
        this.component.value = { component: ResultPopup, props: { status: 404, returnUri: `/p2t/${this.applyEntryPath}?step=1` }};
        return false;
      }
    } catch (error:any) {
      this.component.value = { component: ResultPopup, props: { status: error.response.status, returnUri: `/p2t/${this.applyEntryPath}?step=1` }};
      return false;
    }
    return true;
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