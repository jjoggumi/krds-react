import {eventBus} from "@/main";
import { Hitalks } from "@/apis/Hitalks";
import XLSX from 'xlsx';
const apis = { hitalks: new Hitalks() };

export const setupVoteEventHandlers = (hiTalk) => {
  eventBus.$on('openVoteEditor', (option) => {
    hiTalk.showVoteEditor(option?.messageId);
  });
  eventBus.$on('closeVoteEditor', hiTalk.hideVoteEditor);
  eventBus.$on('onChangeVotePortal', ({ detail }) => {
    if (detail?.type === 'exportExcel') return downloadExcel(detail?.data);
  })

  const downloadExcel = (data) => {
    if (!data || !data.length) return;
    const workSheet = XLSX.utils.aoa_to_sheet(data)
    const workBook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workBook, workSheet)
    XLSX.writeFile(workBook, '투표 응답 내용.xlsx')
  }

  window.addEventListener('vote-file-uploading', async (event) => {
    const { files, resolve } = event.detail || {}
    if (files && files.length) {
      hitalk.$store.commit('storeImageEditor/setIsSingleMode', true)
      hiTalk.$store.commit('storeImageEditor/setCustomSendButtonLabel', '완료')
      const uploadFileList = await hiTalk.openImageEditorAndWait({
        uploadedFiles: null,
        inputFiles: files,
        imageLimitCount: 30,
        componentKey: 'hitalk-chat-layout',
        targetIdx: 0,
        parentComponent: 'hitalkChatLayout'
      })
      hitalk.$store.commit('storeImageEditor/setIsSingleMode', false)
      hitalk.$store.commit('storeImageEditor/setCustomSendButtonLabel', '')
      resolve(uploadFileList.length > 0 ? uploadFileList[0].file : null)
    }
  })

  window.addEventListener('vote-show-image-layout', ({detail}) => {
    hitalk.showImageOnImageViewLayout(detail)
  })
}
