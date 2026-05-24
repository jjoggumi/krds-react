import axios from "@/plugins/axios";
import {URLProps} from "@/enums";
import Vue from "vue";
import qs from "qs";
import {v4 as uuidv4} from "uuid";
import Graphemer from 'graphemer';

const storeClazzes = {
  namespaced: true, 
  state:{
    clazzes: [], // clazzes 의 근본
    clazzMemberRole: '', // 클래스 내의 멤버의 역할
    /**
     * 출결알리기
     */
    attendance: {
      modal: {
        isShowNoUseModal: false, // 출결알리기 off. 학부모 모달
        isShowConfirmUseModal1: false, // 출결알리기 off. 선생님 모달. 학생명단 O
        isShowConfirmUseModal2: false, // 출결알리기 off. 선생님 모달. 학생명단 X
        isShowStudentRegisterModal: false, // 출결알리기 학생 명단 최초 등록
        isShowStudentRegisterCompleteModal: false, // 출결알리기 학생 명단 최초 등록완료
      },
      applyList: [], // 제출내역
      applyListSearch: {
        isBusy: false,
        isSearchEnd: false,
        isSearching: false,
        scrollLimit: 400,
        params: {
          classId: '',
          page: 0,
          size: 20,
          sort: '',
          isConfirmed: null, // radio (null: 전체, false: 미확인)
          studentName: '',
          tagId: [],
          isNeedFileCount: true
        }
      },
      isUnconfirmedAttendanceExist: false // 미확인 제출내역 존재하는지
    },
    attendanceModal :{
      id: null, 
      classId: null, 
      isShowRegisterModal: false, 
      isShowDetailModal: false, 
      isConfirmdMode: false, 
      clazzMemberRole: null
    },
    classUser: {}
    },
    getters: {
      getApplyListOf: state => (studentId, attendanceType) => {
        if (!studentId) return []
        let result = state.attendance.applyList.filter(a => a.student.studentId === studentId && a.attendanceConfirmType !== 'NOT_ACCEPT')
        result = attendanceType ? result.filter(a => a.attendanceType === attendanceType) : result
        return result
      }
    },
    mutations: {
    setAttendanceModal(state, modal) {
      state.attendanceModal = modal
    },
    setClazzes(state, clazzes){
      state.clazzes = clazzes;
    },
    setClazzMemeberRole(state, role){
      state.clazzMemberRole = role;
    },
    setIsShowAttendanceNoUseModal(state, isShow) {
      state.attendance.modal.isShowNoUseModal = isShow
    },
    setIsShowAttendanceConfirmUseModal1(state, isShow) {
      state.attendance.modal.isShowConfirmUseModal1 = isShow
    },
    setIsShowAttendanceConfirmUseModal2(state, isShow) {
      state.attendance.modal.isShowConfirmUseModal2 = isShow
    },
    setIsShowAttendanceStudentRegisterModal(state, isShow) {
      state.attendance.modal.isShowStudentRegisterModal = isShow
    },
    setIsShowAttendanceStudentRegisterCompleteModal(state, isShow) {
      state.attendance.modal.isShowStudentRegisterCompleteModal = isShow
    },
    setAttendanceApplyList(state, applyList) {
      state.attendance.applyList = applyList
    },
    setAttendanceApplyListSearchParams(state, params) {
      for (const [key, value] of Object.entries(params)) {
        state.attendance.applyListSearch.params[key] = value
      }
    },
    setAttendanceIsUnconfirmedAttendanceExist(state, isUnconfirmedAttendanceExist) {
      state.attendance.isUnconfirmedAttendanceExist = isUnconfirmedAttendanceExist
    },
    clearAttendanceApplyListSearch(state) {
      state.attendance.applyListSearch = {
        ...state.attendance.applyListSearch,
        isBusy: false,
        isSearchEnd: false,
        isSearching: false,
        scrollLimit: 400,
        params: {
          ...state.attendance.applyListSearch.params,
          page: 0,
          size: 20,
          sort: '',
          isConfirmed: null,
          studentName: '',
          tagId: []
        }
      }
    },
    setClassUser(state, data) {
      state.classUser = data
    }
  },
  actions: {
    // 클래스 학생 명단 
    callClazzStudents: async ({rootState}, payload) => {
      const getClazzStudents = async (page) => {
        return await axios({
          method: "GET",
          baseURL: URLProps.API_SERVER_URL,
          url: `/clazzStudents/clazz/${payload.classId}`,
          params: {
            studentNo: payload.studentNo,
            studentName: payload.studentName,
            isUsed: payload.isUsed,
            isIncludeMatchTag: true,
            page: page,
            size: payload.size
          }
        })
      }

      try {
        let clazzStudents = [];
        const { data: { page, _embedded }} = await getClazzStudents(payload.page);

        if (_embedded) {
          clazzStudents.push(..._embedded.clazzStudents);
        }

        if (_embedded && page && page.totalPages > page.number + 1) {
          for (let i = page.number + 1; i < page.totalPages; i++) {
            const { data: { _embedded } } = await getClazzStudents(i);
            clazzStudents.push(..._embedded.clazzStudents);
          }
        }

        return clazzStudents;

      } catch(error) {
        console.error(" callClazzStudents error => ", error);
      }
    },
    // 출결 등록 
    callCreateAttendance: async ({rootState}, payload) => {
      try{
        await axios({
          method: "POST",
          baseURL: URLProps.API_SERVER_URL,
          url: '/attendances/multiple-dates',
          data: payload
        })
        return 0
      } catch(error) {
        return error.response.status
      }
    },
    // 출결 수정 
    callUpdateAttendance: async ({rootState}, payload) => {
      try{
        await axios({
          method: "PATCH",
          baseURL: URLProps.API_SERVER_URL,
          url: `/attendances/${payload.id}`,
          data: payload.data
        })
        return 0
      } catch(error) {
        return error.response.status
      }
    },
    // 출결 알리기 삭제
    callAttendanceDeleteById: async ({rootState}, payload) => {
      try{
        await axios({
          method: "DELETE",
          baseURL: URLProps.API_SERVER_URL,
          url: `/attendances/${payload}`,
        })
        return 0
      } catch(error) {
        return error.response.status
      }
    },
    // 출결 알리기 상세 조회 
    callAttendanceById: async ({rootState}, payload) => {
      try{
        const res = await axios({
          method: "GET",
          baseURL: URLProps.API_SERVER_URL,
          url: `/attendances/${payload}`,
        })
        return res
      } catch(error) {
        return error.response
        //console.error(" callAttendanceById error => ", error);
      }
    },
    // 회원과 연결된 학생 목록 조회
    callClazzStudentsUsers: async ({rootState}, payload) => {
      try{
        const res = await axios({
          method: "GET",
          baseURL: URLProps.API_SERVER_URL,
          url: `/clazzStudentUsers/${localStorage.uuid}`,
          params: {
            classId: payload.classId,
            isUsed: true,
            page: 0,
            size: 1,
            sort: 'insertedTimestamp,desc'
          }
        })
        return res.data && res.data._embedded ? res.data._embedded.clazzStudents : []
      } catch(error) {
        console.error(" callClazzStudentsUsers error => ", error);
      }
    },
    // 출결 알리기 제출내역
    callAttendancesByClassId: async ({state, rootState, rootGetters, commit, dispatch}, payload = {init: false, isDeleted: false}) => {
      let deletedParmas = {
        ...state.attendance.applyListSearch.params
        , page: state.attendance.applyList.length
        , size: 1
      }
      
      if (payload.init) {
        state.attendance.applyListSearch.params.page = 0
        state.attendance.applyListSearch.isSearchEnd = false
        commit('setAttendanceApplyList', [])
      }

      if (
        state.attendance.applyListSearch.isBusy ||
        state.attendance.applyListSearch.isSearchEnd
      ) return

      try {
        state.attendance.applyListSearch.isSearching = true
        state.attendance.applyListSearch.isBusy = true

        const res = await axios({
          method: 'GET',
          url: '/attendances',
          params: !payload.isDeleted ? state.attendance.applyListSearch.params : deletedParmas,
          paramsSerializer: (params) => {
            return qs.stringify(params, {arrayFormat: 'repeat'});
          }
        })
        
        if (res.data._embedded && res.data._embedded.attendances.length > 0) {
          state.attendance.applyList.push(...res.data._embedded.attendances)
          state.attendance.applyList = _.uniqBy(state.attendance.applyList, 'attendanceId')
        }

        if(!payload.isDeleted) {
          state.attendance.applyListSearch.params.page = state.attendance.applyListSearch.params.page + 1
        }
        state.attendance.applyListSearch.isBusy = false
        state.attendance.applyListSearch.isSearchEnd =
          res.data.page.totalPages === 0 ||
          res.data.page.number + 1 === res.data.page.totalPages

        // 레드닷 삭제 (선생님만 표시)
        if (rootGetters.isCurClassOwnerOrManager && state.attendance.applyList.length === 0) {
          commit('setAttendanceIsUnconfirmedAttendanceExist', false)
        }
        state.attendance.applyListSearch.isSearching = false
      } catch (e) {
        Vue.$log.error(e)
        state.attendance.applyListSearch.isSearching = false
      }
    },
    // 출결 알리기 학부모 안내 문구 조회
    // payload: {classId: '', guidType: {guideType: []}}
    callAttendanceGuide: async ({state}, payload) => {
      try {
        const res = await axios({
          method: 'GET',
          url: `/attendanceGuides/${payload.classId}`,
          params: payload.guideType,
          paramsSerializer: (params) => {
            return qs.stringify(params, {arrayFormat: 'repeat'});
          }
        })
        return res.data
      } catch (e) {
        Vue.$log.error(e)
      }
    },
    // 출결 알리기 안내문구 저장
    patchAttendanceGuidesGuides: async ({state}, payload) => {
      try {
        const res = await axios({
          method: 'PATCH',
          url: `/attendanceGuides/${payload.classId}`,
          data: payload.guide
        })
      } catch (e) {
        Vue.$log.error(e)
      }
    },
    // 출결 알리기 lnb 레드닷
    checkUnconfirmedAttendance: async ({state}, payload) => {
      try {
        const res = await axios({
          method: 'GET',
          url: `/attendances/unconfirmed/${payload.classId}`
        })
        return res.data.exists
      } catch (e) {
        Vue.$log.error(e)
      }
    },
    generateProfileImage: async ({rootState, dispatch}, {profileText, profileBgColor, profileBgImage}) => {
      const splitter = new Graphemer()
      const canvas = document.getElementById("profile-canvas")
      const ctx = canvas.getContext("2d")
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const drawBackground = async () => {
        if (profileBgColor && profileBgColor.trim().length > 0) {
          ctx.fillStyle = profileBgColor
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        } else {
          await new Promise((resolve, reject) => {
            const bgImage = new Image()
            bgImage.crossOrigin = 'anonymous'
            bgImage.src = profileBgImage
            bgImage.onload = async () => {
              const {width: imgWidth, height: imgHeight} = bgImage
              const imgRatio = imgWidth / imgHeight
              let sHeight = imgRatio > 1 ? imgHeight : imgWidth / 1
              let sWidth = imgRatio > 1 ? imgHeight * 1 : imgWidth
              let sx = imgRatio > 1 ? (imgWidth - sWidth) / 2 : 0
              let sy = imgRatio > 1 ? 0 : (imgHeight - sHeight) / 2

              ctx.drawImage(bgImage, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height)
              ctx.fillStyle = 'rgba(0, 0, 0, 0.32)'
              ctx.fillRect(0, 0, canvas.width, canvas.height)
              resolve(true)
            }
          })
        }
      }

      const drawText = () => {
        const centerX = canvas.width / 2
        const centerY = canvas.height / 2
        const title = profileText || ""
        const lineHeight = 360

        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.font = "bold 330px 'Pretendard Variable', 'Noto Color Emoji', sans-serif"
        ctx.fillStyle = "#fff"

        if (splitter.splitGraphemes(title).length > 3 && !/^[0-9]{1,2}-[0-9]{1,2}$/.test(title)) {
          const firstLine = splitter.splitGraphemes(title).slice(0, 2).join('')
          const secondLine = splitter.splitGraphemes(title).slice(2).join('')
          ctx.fillText(firstLine, centerX, (centerY - lineHeight / 2) + 40)
          ctx.fillText(secondLine, centerX, (centerY + lineHeight / 2) + 40)
        } else {
          ctx.fillText(title, centerX, centerY + 40)
        }
      }

      try {
        await drawBackground()
        await drawText()
        const file = await dispatch('storeImageEditor/base64ToFile', {fileName: `${uuidv4()}.png`, thumbnailDataUrl: canvas.toDataURL("image/png")}, { root: true })
        const res = await rootState.hiClass.multipart.upload(file)
        return res.data._links.original.href
      } catch (err) {
        return null
      }
    }
  }
}
export default storeClazzes;