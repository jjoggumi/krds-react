import { apiCall } from '@/apis/request'
import { env } from '@/supporters/migrations'
import { formatDateFromYmd } from '@/components/uiux/hitalk'

const chatApiUrl = env.CHAT_API_SERVER_URI

class Controller {
  constructor () {}

  determineIsOwnerOrManagerOf = (chatUsers, userId) => 
    chatUsers.filter(m => ['OWNER', 'MANAGER'].includes(m.memberRole))
      .map(m => m.userId).includes(userId)

  loadChatRooms = async (roomId) => {
    const { _embedded } = await apiCall('GET /v2/chatRooms', {
      query: { userId: localStorage.uuid, size: 500, roomId }})
    return _embedded?.chatMessages || [];
  }

  loadChatUsers = async (classId) => {
    const { _embedded } = await apiCall('GET /v2/chatUsers', {
      query: { userId: localStorage.uuid, classId }})
    return _embedded?.chatUsers || [];
  }

  loadChatUsersByRoom = async (roomId) => {
    const room = (await this.loadChatRooms(roomId)).shift() || {};
    return room.classId ? await this.loadChatUsers(room.classId) : [];
  }

  loadVoteDetail = async (messageId) => {
    return await apiCall(`GET /hitalks/vote/${messageId}`).catch(() => undefined);
  }

  loadVoteAnswer = async (messageId) => {
    return await apiCall(`GET /hitalks/vote/${messageId}/answer`).catch(() => undefined);
  }

  searchVotes = async ({isMyPublished = false, page, size=20}) => {
    return (await apiCall(`POST /hitalks/votes`, { body: { isMyPublished, userId: localStorage.uuid }, query: { page, size } }))._embedded?.results || [];
  }

  updateVoteAnswer = async (messageId, answer) => {
    if (answer.answers?.length > 0) {
      return await apiCall(`PUT /hitalks/vote/${messageId}/answer`, { body: answer }).catch(() => undefined);
    } else {
      return await apiCall(`DELETE /hitalks/vote/${messageId}/answer`).catch(() => undefined);
    }
  }

  loadReportFor = async (messageId, type) => {
    const res = await apiCall(`GET /hitalks/vote/${messageId}/reports/${type}`).catch(() => undefined);
    return res?._embedded?.results || [];
  }

  submitVote = (voteModel, voteId = null) => {
    if (voteId) {
      return apiCall(`PATCH /hitalks/vote/${voteId}`, { body: voteModel }).catch(() => undefined);
    } else {
      return apiCall(`POST ${chatApiUrl}/hitalks/vote`, { body: voteModel }).catch(() => undefined);
    }
  }

  deleteVote = (voteId) => {
    return apiCall(`DELETE /hitalks/vote/${voteId}`).catch(() => undefined);
  }

  deleteAllVotesInRoom = (roomId) => {
    return apiCall(`DELETE /hitalks/${roomId}/votes`).catch(() => undefined);
  }

  reloadReports = async (messageId, dispatch = () => {}) => {
    const [itemReport, memberReport, absentees] = await Promise.all(
      ['item', 'member', 'non'].map(type => this.loadReportFor(messageId, type))
    );
    itemReport.forEach(attachFormattedItemContent);
    memberReport.forEach(member => member.questions.forEach(attachFormattedItemContent));
    const totalMemberCount = (memberReport?.length + absentees?.length) || 0;
    dispatch({ itemReport, memberReport, absentees, totalMemberCount });
    return [itemReport, memberReport, absentees, totalMemberCount];
  }

  uploadImage = async (file) => {
    const fileData = new FormData();
    fileData.append('file', file, file.name);
    fileData.append('encode', true);

    const response = await fetch(env.BASE_FILE_URI + '/multipart', {
      method: 'POST',
      body: fileData
    });

    if (!response.ok) {
      throw new Error('File upload failed');
    }

    return await response.json();
  }

  loadRoomVotes = async (room, query = {}) => {
    const res = await apiCall(`GET /hitalks/${room.room}/votes`, { query }).catch(() => undefined);
    const results = res?._embedded?.results || [];
    const details = await Promise.all(results.map(r => this.loadVoteDetail(r.messageId).then(d => ({...r, ...d}))));
    return details.map(r => ({ ...r, room }));
  }

  loadAllVotes = async () => {
    const groupRooms = (await this.loadChatRooms()).filter(r => r.roomType === 'GROUP');
    const votes = await Promise.all(groupRooms.map(room => this.loadRoomVotes(room)));
    return votes.flat();
  }

  formatClosedTimestamp = (timestamp, withHour = true) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const pad = n => n.toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(2);
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const weekDays = '일월화수목금토';
    const weekDay = weekDays.charAt(date.getDay());
    let result = `${year}.${month}.${day} (${weekDay})`;
    if (withHour) {
      result += ` ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    }
    result += date > new Date() ? ' 마감 예정' : ' 마감';
    return result;
  }

  loadUser = async (userId) => {
    return await apiCall(`GET /users/${userId}`).catch(() => ({}));
  }

  hasAnswerers = async (voteId) => {
    const members = await this.loadReportFor(voteId, 'member');
    return members.length > 0;
  }

  updateVoteStatus = (roomId, voteId, status) => {
    return apiCall(`PUT ${chatApiUrl}/hitalks/${roomId}/vote/${voteId}/status`, {
      body: { userId: localStorage.uuid, ...status }
    }).catch(() => undefined);
  }

  loadVoteStatus = (voteId) => {
    return apiCall(`GET /hitalks/vote/${voteId}/status`).catch(() => undefined);
  }

  sendPushNotification = (voteId) => {
    return apiCall(`POST /hitalks/vote/${voteId}/nonAnswer/push`).catch(() => undefined);
  }

  getConnectRoomItemFromLegacyHiclass = () => JSON.parse(sessionStorage.getItem('connectRoomItem')) || {}
}

export const controller = new Controller();
export const minAnswers = 3;

export const createAnswer = (itemContent = '') => ({
  itemContent,
  fileCategory: null,
  fileName: null,
  fileContentType: null,
  fileSize: null,
  fileOriginalPath: null
});

export const createQuestion = (question = {}) => ({
  questionTitle: '',
  questionDescription: '',
  items: Array.from({ length: minAnswers }, () => createAnswer()),
  questionType: 'TEXT',
  isMultipleChoice: false,
  isAnonymous: false
});

export const attachFormattedItemContent = ({questionType, items}) => {
  items.forEach(item => {
    item.formattedContent = ({DATE: () => formatDateFromYmd(item.itemContent, {spaceBeforeWeekday: false})}[questionType] || (() => item.itemContent))();
  });
};
