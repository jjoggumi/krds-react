// import { Timetables } from "@/apis/Timetables";
import { Timetables } from "../../../apis/Timetables";
import { getCurrentInstance } from "vue";
import { useDialog } from "../composables/dialog";
import { AxiosError } from "axios";

/*
 * TimetableContextBase
 * - 시간표 관련 데이터들을 관리하는 Context의 기본 클래스
 * - 컨텍스트 외부에서 전체 데이터를 변경하는 경우는 없도록 하자.
 * - 건별 추가/수정/삭제는 가능하나, 전체 데이터는 컨텍스트 내에서만 관리한다.
 */
export default abstract class TimetableContextBase<T> {  

  private _proxy: any;
  private _loaded: boolean = false;
  private _api: any;
  private _presetTimetableId: string | null = null;

  protected _model: any;

  protected _dialog: any;
  
  
  constructor() {
    // @ts-ignore
    const { proxy } = getCurrentInstance();
    this._proxy = proxy;    
    this._api = new Timetables();
    this._dialog = useDialog();
  }

  public static getInstance(): any {    
    throw new Error('getInstance() must be implemented in derived class');
  }

  public async reload(): Promise<void> {
    this._loaded = false;
    await this.load();
  }

  public async load(): Promise<void> {
    if(this._loaded) {
      return;
    }

    this._loaded = true;
    await this.fetch();
  }

  public async reloadWithTimetableId(timetableId: string): Promise<void> {
    this.presetTimetableId = timetableId;
    this._loaded = false;

    await this.load();
  }

  abstract fetch(): Promise<void>;
  
  get timetableId(): string {
    // 미리 설정된 시간표 ID가 있다면 그것을 사용
    if(this._presetTimetableId) {
      return this._presetTimetableId;
    }

    const { timetableId: routeTimetableId } = this._proxy.$route.params;
    return routeTimetableId || '';
  }

  get templateId(): string | null {
    const { templateId: routeTemplateId } = this._proxy.$route.params;
    return routeTemplateId || null;
  }

  get api(): any {
    return this._api;
  }

  get proxy(): any {
    return this._proxy;
  }

  get dialog(): any {
    return this._dialog;
  }

  set presetTimetableId(timetableId: string | null) {
    this._presetTimetableId = timetableId;
  }

  protected showErrorDialog(error: AxiosError): void {
    const response = error.response;
    const resData = response?.data as { message: string, cause: string, error: string };

    if(resData.error) {
      this.dialog.alertSimple(resData.error);
    }
  }
}