import { setBaseUrl } from '@/apis/request'
import { registerCustomElement } from '@/supporters'
import { env } from '@/supporters/migrations'
// import '@/assets/css/hc-tailwind.css';
// import '@/assets/css/hc-common.css';

import {
  HitalkVoteEditorMain,
  HitalkVoteEditorModal,
  HitalkVotePortal,
  HitalkVoteManager, HitalkVoteFloatRoom
} from './components/hitalk/vote'

import { TimetableDailyHome } from "./components/timetable/daily/main/main";
import { TimetableMyHome } from "./components/timetable/daily/my/main"
import { TimetableMobileMain } from "./components/timetable/mobile/main"
import { WeblinkDetailContent } from "./components/text/components/weblink/WeblinkDetailContent"
import { WeblinkDetail } from "./components/text/components/weblink/WeblinkDetail"
import { TextMain } from '@/components/text/main';
import { TextFullPage } from '@/components/text/TextFullPage';
import { TextMain as UiuxPage } from '@/components/uiux/page';

[
  ['HitalkVoteEditorMain', HitalkVoteEditorMain],
  ['HitalkVoteEditorModal', HitalkVoteEditorModal],
  ['HitalkVotePortal', HitalkVotePortal],
  ['HitalkVoteManager', HitalkVoteManager],
  ['HitalkVoteFloatRoom', HitalkVoteFloatRoom],
  ['TimetableDailyHome', TimetableDailyHome],
  ['TimetableMyHome', TimetableMyHome],
  ['TextMain', TextMain],
  ['TextFullPage', TextFullPage],
  ['UiuxPage', UiuxPage],
  ['WeblinkDetailContent', WeblinkDetailContent],
  ['WeblinkDetail', WeblinkDetail],
  ['TimetableMobileMain', TimetableMobileMain]
].forEach(([name, component]) => registerCustomElement(name, component))

setBaseUrl(env.BASE_API_URI)