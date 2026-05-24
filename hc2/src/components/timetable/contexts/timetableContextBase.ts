// import { Timetables } from "@/apis/Timetables";
// import { getCurrentInstance } from "vue";
// import { useDialog } from "../composables/dialog";
import { AxiosError } from "axios";
import { Hc2Timetables } from "../apis";

/*
 * TimetableContextBase
 * - 시간표 관련 데이터들을 관리하는 Context의 기본 클래스
 * - 컨텍스트 외부에서 전체 데이터를 변경하는 경우는 없도록 하자.
 * - 건별 추가/수정/삭제는 가능하나, 전체 데이터는 컨텍스트 내에서만 관리한다.
 */
export default abstract class TimetableContextBase<T> {  
  
  private _loaded: boolean = false;
  private _api: any;
  private _presetTimetableId: string | null = null;

  protected _model: any;
  protected _listeners: Set<() => void> = new Set();

  protected _dialog: any;
    
  constructor() {
    // @ts-ignore
    // const { proxy } = getCurrentInstance();
    this._api = new Hc2Timetables();
  }

  public static getInstance(): any {
    throw new Error('getInstance() must be implemented in derived class');
  }

  // 구독
  subscribe = (cb: () => void) => {
    this._listeners.add(cb);
    // console.log('Subscribed. Total listeners:', this._listeners.size, this._listeners);

    return () => {
      this._listeners.delete(cb);
      //console.log('Unsubscribed. Total listeners:', this._listeners.size, this._listeners);
    };
  };

  // 현재 스냅샷
  getSnapshot = () => {
      return this._model;
  }

  protected notifyListeners = () => {
    // console.log('Notifying listeners. Total listeners:', this._listeners.size, this._listeners);

    this._listeners.forEach(cb => cb());
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

    // const { timetableId: routeTimetableId } = this._proxy.$route.params;
    const routeTimetableId = null;
    return routeTimetableId || '';
  }

  set presetTimetableId(timetableId: string | null) {
    this._presetTimetableId = timetableId;
  }

  get api(): any {
    return this._api;
  }

  /*
  get proxy(): any {
    return this._proxy;
  }
  

  get dialog(): any {
    return this._dialog;
  }
  */

  protected showErrorDialog(error: AxiosError): void {
    const response = error.response;
    const resData = response?.data as { message: string, cause: string, error: string };

    if(resData.error) {
      console.error('API Error:', resData);
      // this.dialog.alert(resData.error);
    }
  }
  
}