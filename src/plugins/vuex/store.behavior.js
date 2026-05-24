import axios from '@/plugins/axios'
import qs from 'qs';
import {URLProps} from '@/enums'
import _, { method } from 'lodash'
import Stomp from "stompjs";
import {FirebaseRemoteConfigKey, remoteConfig} from '@/plugins/firebase'
import { eventBus } from '@/main'

const storeBehavior = {
    namespaced: true,
    state: {
        isLogout: false,
        isWritingRecord: false,
        behaviorViewerOptions: {
            isOpen: false,
            currentIndex: 0,
            files: []
        },
        curClassroom: {},
        students: [],
        groups: [],
        // characters: [
        //     { code: 'hc0001', url: 'https://download.hiclass.net/static/classroom/student/hc0001_head.png' },
        //     { code: 'hc0002', url: 'https://download.hiclass.net/static/classroom/student/hc0002_head.png' },
        //     { code: 'hc0003', url: 'https://download.hiclass.net/static/classroom/student/hc0003_head.png' },
        //     { code: 'hc0004', url: 'https://download.hiclass.net/static/classroom/student/hc0004_head.png' },
        //     { code: 'hc0005', url: 'https://download.hiclass.net/static/classroom/student/hc0005_head.png' },
        //     { code: 'hc0006', url: 'https://download.hiclass.net/static/classroom/student/hc0006_head.png' },
        //     { code: 'hc0007', url: 'https://download.hiclass.net/static/classroom/student/hc0007_head.png' },
        //     { code: 'hc0008', url: 'https://download.hiclass.net/static/classroom/student/hc0008_head.png' },
        //     { code: 'hc0009', url: 'https://download.hiclass.net/static/classroom/student/hc0009_head.png' },
        //     { code: 'hc0010', url: 'https://download.hiclass.net/static/classroom/student/hc0010_head.png' },
        //     { code: 'hc0011', url: 'https://download.hiclass.net/static/classroom/student/hc0011_head.png' },
        //     { code: 'hc0012', url: 'https://download.hiclass.net/static/classroom/student/hc0012_head.png' }
        // ],
        characters: [],
        stompClient: null,
        updateSubscribeList: {},
        pointGiveFinishModal: {
            open: false,
            mode: 'good'
        },
        sendPoints: null,
        detailClass: {},
        newStudentPoints: [],
        lastStudentsParams: {},
        lastSenderUUID: '',
        resetStudentsIds: [],
        mySend: {
            rewardId: null
        },
        seatPlans: [],
        seatPlanMode: null,
        seatActiveCount: 0,
        lastSeatPlanId: null,
        isUsageConsentExisted: false,

        // 인원체크 새 창 열기
        isExternalChecklist: false,
        checklistToken: null
    },
    getters: {
        loginUser: (state, getters, rootState) => {
            return rootState.user
        },
        userType: (state, getters) => {
            return getters.loginUser.userType
        },
        isUsageConsentExisted: (state) => {
            return state.isUsageConsentExisted
        },
        isStompConnected: (state) => {
            return state.stompClient && state.stompClient.connected
        }
    },
    mutations: {
        setResetStudentsIds: (state, ids) => {
            state.resetStudentsIds = ids
        },
        setIsWritingRecord: (state, isWriting) => {
            state.isWritingRecord = isWriting
        },
        setIsLogout: (state, isLogout) => {
            state.isLogout = isLogout
        },
        setCurClassroom: (state, classroom) => {
            state.curClassroom = classroom
        },
        setStudents: (state, students) => {
            state.students = students
        },
        setNewStudentPoints: (state, students) => {
            state.newStudentPoints = students
        },
        setGroups: (state, groups) => {
            state.groups = groups
        },
        setBehaviorViewerOptions: (state, options) => {
            state.behaviorViewerOptions = options
        },
        setPointGiveFinishModal: (state, item) => {
            state.pointGiveFinishModal.open = item.open
            state.pointGiveFinishModal.mode = item.mode
        },
        setCharacters: (state, list) => {
            state.characters = list
        },
        setSendPoints: (state, list) => {
            state.sendPoints = list
        },
        setDetailClass: (state, data) => {
            state.detailClass = data
        },
        setLastStudentsParams: (state, data) => {
            state.lastStudentsParams = data
        },
        setMySend: (state, data) => {
            state.mySend = data
        },
        setSeatPlans: (state, data) => {
            state.seatPlans = data
        },
        setSeatPlanMode: (state, data) => {
            state.seatPlanMode = data
        },
        setSeatActiveCount: (state, data) => {
          state.seatActiveCount = data
        },
        setLastSeatPlanId: (state, data) => {
          state.lastSeatPlanId = data
        },
        setIsUsageConsentExisted: (state, data) => {
            state.isUsageConsentExisted = data
        },
        setLastSenderUUID: (state, senderUUID) => {
            state.lastSenderUUID = senderUUID
        },
        setIsExternalChecklist: (state, isExternalChecklist) => {
          state.isExternalChecklist = isExternalChecklist
        },
        setChecklistToken: (state, token) => {
          state.checklistToken = token
        }
    },
    actions: {
        getLoginUserInfomation: async ({rootState}) => {
            try {
                const loginUserRes = await axios({
                    method: 'GET',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/users/${localStorage.uuid}`
                })
            
                rootState.userUri = loginUserRes.data._links.self.href
                rootState.userType = loginUserRes.data.userType
                rootState.user = loginUserRes.data
            } catch(error) {
                rootState.log.error(error)
            }
        },
        addClassroom: async ({rootState}, classroomName) => {
            try {
                const response = await axios({
                    method: 'POST',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classrooms`,
                    data: {
                        userId: localStorage.uuid,
                        classroomName
                    }
                })
                return {...response.data, status: response.status}
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        patchClassroomName: async ({rootState}, params) => {
            try {
                await axios({
                    method: 'PATCH',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/name`,
                    data: {
                        userId: localStorage.uuid,
                        classroomName: params.classroomName
                    }
                })
                return {status: 200}
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        patchClassroomIsUsed: async ({rootState}, params) => {
            try {
                await axios({
                    method: 'PATCH',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/${params.isUsed ? 'used' : 'not-used'}`,
                    params: {
                        userId: localStorage.uuid
                    }
                })
                return {status: 200}
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        deleteClassroom: async ({rootState}, classroomId) => {
            try {
                await axios({
                    method: 'DELETE',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${classroomId}`,
                    params: {
                        userId: localStorage.uuid
                    }
                })
                return {status: 200}
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        patchClassroomSort: async ({rootState}, classroomIds) => {
            try {
                await axios({
                    method: 'PATCH',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classrooms/sorting`,
                    data: {
                        userId: localStorage.uuid,
                        classroomIds
                    }
                })
                return {status: 200}
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        getClassrooms: async ({rootState}, parmas) => {
            try {
                const classrooms = await axios({
                    method: 'GET',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classrooms`,
                    params: {
                        userId: localStorage.uuid,
                        ...parmas
                    }
                })
                
                return {...classrooms.data, status: classrooms.status}
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        getClassroomDetail: async ({rootState, commit}, classroomId) => {
            try {
                const classroom = await axios({
                    method: 'GET',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${classroomId}`,
                    params: {
                        userId: localStorage.uuid
                    }
                })
                commit('setCurClassroom', classroom.data)
                return {...classroom.data, status: classroom.status}
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        getIsClazzStudents: async ({rootState}, classId) => {
            try {
                const isStudents = await axios({
                    method: 'GET',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/clazzStudents/clazz/${classId}/exists`,
                    params: {
                        isUsed: true
                    }
                })
                return isStudents.data.exists
            } catch(error) {
                rootState.log.error(error)
                return false
            }
        },
        patchLoadClassStudents: async ({rootState}, params) => {
            try {
                const classroomStudents = await axios({
                    method: 'PATCH',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/students/class-student/${params.isLoad ? 'load' : 'not-load'}`,
                    params: {
                        userId: localStorage.uuid
                    }
                })
                
                return {...classroomStudents.data, status: classroomStudents.status}
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        addClassroomStudents: async ({rootState}, params) => {
            try {
                const classroomStudents = await axios({
                    method: 'PUT',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/students`,
                    data: {
                        userId: localStorage.uuid,
                        studentNames: params.studentNames
                    }
                })
                
                return {...classroomStudents.data, status: classroomStudents.status}
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        addClassroomStudentNews: async ({rootState}, params) => {
            try {
                const classroomStudents = await axios({
                    method: 'POST',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/students`,
                    data: {
                        studentInfos: params.students
                    }
                })

                return classroomStudents
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        patchClassroomStudentPhoto: async ({rootState}, params) => {
            try {
                await axios({
                    method: 'PATCH',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/student/${params.studentId}/photo`,
                    data: {
                        userId: localStorage.uuid,
                        studentPhoto: params.studentPhoto
                    }
                })
                return {status: 200}
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        patchClassroomStudentNumber: async ({rootState}, params) => {
            try {
                await axios({
                    method: 'PATCH',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/student/${params.studentId}/no`,
                    data: {
                        userId: localStorage.uuid,
                        studentNo: params.studentNo
                    }
                })
                return {status: 200}
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        patchClassroomStudentName: async ({rootState}, params) => {
            try {
                await axios({
                    method: 'PATCH',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/student/${params.studentId}/name`,
                    data: {
                        userId: localStorage.uuid,
                        studentName: params.studentName
                    }
                })
                return {status: 200}
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        patchClassroomStudentCharacter: async ({rootState}, params) => {
            try {
                await axios({
                    method: 'PATCH',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/student/${params.studentId}/character`,
                    data: {
                        userId: localStorage.uuid,
                        studentCharacter: params.studentCharacter,
                        studentPhoto: params.studentPhoto
                    }
                })
                return {status: 200}
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        patchClassroomStudentBirth: async ({rootState}, params) => {
            try {
                await axios({
                    method: 'PATCH',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/student/${params.studentId}/birthday`,
                    data: {
                        userId: localStorage.uuid,
                        studentBirthday: params.studentBirthday
                    }
                })
                return {status: 200}
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        patchClassroomStudentGender: async ({rootState}, params) => {
            try {
                await axios({
                    method: 'PATCH',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/student/${params.studentId}/gender`,
                    data: {
                        userId: localStorage.uuid,
                        studentGender: params.studentGender
                    }
                })
                return {status: 200}
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        patchClassroomStudentIsHiding: async ({rootState}, params) => {
            try {
                await axios({
                    method: 'PATCH',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/student/${params.studentId}/${params.isHiding ? 'hide' : 'show'}`,
                    params: {
                        userId: localStorage.uuid
                    }
                })
                return {status: 200}
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        deleteClassroomStudent: async ({rootState}, params) => {
            try {
                await axios({
                    method: 'DELETE',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/student/${params.studentId}`,
                    params: {
                        userId: localStorage.uuid
                    }
                })
                return {status: 200}
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        getClassroomStudentDetail: async ({rootState}, params) => {
            try {
                const student = await axios({
                    method: 'GET',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/student/${params.studentId}`,
                    params: {
                        userId: localStorage.uuid
                    }
                })
                
                return {...student.data, status: student.status}
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        getClassroomStudents: async ({rootState, commit}, params) => {
            try {
                const students = await axios({
                    method: 'GET',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/students`,
                    params: {
                        userId: localStorage.uuid,
                        ...params
                    }
                })

                const studentList = students.data._embedded ? students.data._embedded.classroomStudents.map(item => {
                    return {
                        ...item,
                        checked: false,
                    }
                }) : []   
                commit('setLastStudentsParams', params)
                if(params.hasOwnProperty('isHidden') && !params.isHidden) {
                    commit('setStudents', studentList);
                }         
                
                return studentList
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        addIscreamConsent: async ({rootState, commit}, params) => {
            try {
                const consent = await axios({
                    method: 'POST',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/iscream/consent`,
                    params: {userId: params.userId}
                })
                const iscreamConsentExisted = consent.status === 204 ? true : false;
                commit('setIsUsageConsentExisted', iscreamConsentExisted);
            } catch (error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        getIscreamConsent: async ({rootState}, params) => {
            try {
                const consent = await axios({
                    method: 'GET',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/iscream`,
                    params: {userId: params.userId}
                }).catch(error => { rootState.log.error(error) })
                return consent.data || {};
            } catch (error) {
                rootState.log.error(error)
                return {}
            }
        },
        getIscreamClasses: async ({rootState}, params) => {
            try {
                const classes = await axios({
                    method: 'GET',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/iscream/classes`,
                    params: {userId: params.userId}
                }).catch(error => { rootState.log.error(error) })
                return classes.data || {};
            } catch (error) {
                rootState.log.error(error)
                return {}
            }
        },
        addIscreamStudents: async ({rootState}, params) => {
            try {
                const students = await axios({
                    method: 'POST',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/iscream/students`,
                    params: {classSeq: params.classSeq, userId: params.userId}
                })
                return students;
            } catch (error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        patchRewardResetStudents: async ({rootState}, params) => {
            try {
                const resetStudents = await axios({
                    method: 'PATCH',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/rewards/reset`,
                    data: {
                        userId: localStorage.uuid,
                        studentIds: params.studentIds
                    }
                })
                return {...resetStudents.data, status: resetStudents.status}
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        patchRewardResetAllStudents: async ({rootState}, params) => {
            try {
                const resetStudents = await axios({
                    method: 'PATCH',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/rewards/reset/all`,
                    data: {
                        userId: localStorage.uuid
                    }
                })
                return {...resetStudents.data, status: resetStudents.status}
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        addClassroomGroup: async ({rootState}, params) => {
            try {
                const classroomGroup = await axios({
                    method: 'PUT',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/groups`,
                    data: {
                        userId: localStorage.uuid,
                        groupName: params.groupName,
                        studentIds: params.studentIds
                    }
                })
                
                return {...classroomGroup.data, status: classroomGroup.status}
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        patchClassroomGroupName: async ({rootState}, params) => {
            try {
                await axios({
                    method: 'PATCH',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/group/${params.groupId}/name`,
                    data: {
                        userId: localStorage.uuid,
                        groupName: params.groupName
                    }
                })
                return {status: 200}
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        petchClassroomGroupStudents: async ({rootState}, params) => {
            try {
                const group = await axios({
                    method: 'PATCH',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/group/${params.groupId}/students`,
                    data: {
                        userId: localStorage.uuid,
                        studentIds: params.studentIds
                    }
                })
                return {...group.data, status: group.status}
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        patchClassroomGroupIsHiding: async ({rootState}, params) => {
            try {
                await axios({
                    method: 'PATCH',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/group/${params.groupId}/${params.isHiding ? 'hide' : 'show'}`,
                    params: {
                        userId: localStorage.uuid
                    }
                })
                return {status: 200}
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        deleteClassroomGroup: async ({rootState}, params) => {
            try {
                await axios({
                    method: 'DELETE',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/group/${params.groupId}`,
                    params: {
                        userId: localStorage.uuid
                    }
                })
                return {status: 200}
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        getClassroomGroupDetail: async ({rootState}, params) => {
            try {
                const group = await axios({
                    method: 'GET',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/group/${params.groupId}`,
                    params: {
                        userId: localStorage.uuid
                    }
                })
                
                return {...group.data, status: group.status}
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        getClassroomGroups: async ({rootState, commit}, params) => {
            try {
                const groups = await axios({
                    method: 'GET',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/groups`,
                    params: {
                        userId: localStorage.uuid,
                        ...params
                    }
                })
                const groupList = groups.data._embedded ? groups.data._embedded.classroomGroups : []   
                
                if(!params.isHidden) {
                    commit('setGroups', groupList)
                }         
                
                return groupList
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        addRecoringAudioBookmark: async ({rootState}, params) => {
            try {
                const bookmark = await axios({
                    method: 'POST',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/record/${params.recordId}/bookmarks`,
                    data: {
                        bookmarkTime: params.bookmarkTime
                    }
                })
                
                return {...bookmark.data, status: bookmark.status}
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        patchRecoringAudioBookmark: async ({rootState}, params) => {
            try {
                const bookmark = await axios({
                    method: 'PATCH',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/record/${params.recordId}/bookmark/${params.bookmarkId}/memo`,
                    data: {
                        bookmarkMemo: params.bookmarkMemo
                    }
                })
                return {...bookmark.data, status: bookmark.status}
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        deleteRecoringAudioBookmark: async ({rootState}, params) => {
            try {
                await axios({
                    method: 'DELETE',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/record/${params.recordId}/bookmark/${params.bookmarkId}`
                })
                return {status: 200}
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        addRecoringTargets: async ({rootState}, params) => {
            try {
                await axios({
                    method: 'PUT',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/record/${params.recordId}/targets`,
                    data: {
                        studentIds: params.studentIds,
                        groupIds: params.groupIds
                    }
                })
                return {status: 200}
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        deleteRecordingTargets: async ({rootState}, params) => {
            try {
                await axios({
                    method: 'DELETE',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/record/${params.recordId}/targets`,
                    data: {
                        studentIds: params.studentIds,
                        groupIds: params.groupIds
                    }
                })
                return {status: 200}
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        patchRecordingTargets: async ({rootState}, params) => {
            try {
                await axios({
                    method: 'PATCH',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/record/${params.recordId}/targets`,
                    data: {
                        studentIds: params.studentIds,
                        groupIds: params.groupIds
                    }
                })
                return {status: 200}
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        patchRecordingDescription: async ({rootState}, params) => {
            try {
                const record = await axios({
                    method: 'PATCH',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/record/${params.recordId}/description`,
                    data: {
                        recordContent: params.recordContent
                    }
                })
                return {...record.data, status: record.status}
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        patchRecordingStyle: async ({rootState}, params) => {
            try {
                await axios({
                    method: 'PATCH',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/record/${params.recordId}/style`,
                    data: {
                        recordStyle: params.recordStyle
                    }
                })
                return {status: 200}
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        addRecordingFiles: async ({rootState}, params) => {
            try {
                const files = await axios({
                    method: 'PUT',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/record/${params.recordId}/files`,
                    data: {
                        files: params.files
                    }
                })
                return files.data._embedded.files
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        addClassroomRecording: async ({rootState}, params) => {
            try {
                const recording = await axios({
                    method: 'POST',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/record`,
                    data: {
                        ...params
                    }
                })
                
                return {...recording.data, status: 200}
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        deleteClassroomRecording: async ({rootState}, params) => {
            try {
                await axios({
                    method: 'DELETE',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/record/${params.recordId}`
                })
                return {status: 200}
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        }, 
        getClassroomRecordingDetail: async ({rootState}, params) => {
            try {
                const recording = await axios({
                    method: 'GET',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/record/${params.recordId}`,
                    params: {
                        isIncludeTargets: params.isIncludeTargets
                    }
                })
                
                return {...recording.data, status: recording.status}
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        getClassroomRecordings: async({rootState}, params) => {
            try {
                const recordings = await axios({
                    method: 'GET',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/records`,
                    params,
                    paramsSerializer: (params) => {
                        return qs.stringify(params, {arrayFormat: 'repeat'});
                    }
                })
                
                return {...recordings.data, status: recordings.status}
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        getClassroomRecordingsSearch: async({rootState, commit}, params) => {
            try {
                const recordings = await axios({
                    method: 'POST',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/records/search`,
                    params: {
                        size: params.size,
                        page: params.page
                    },
                    data: {
                        keyword: params.keyword,
                        recordTypes: params.recordType,
                        dateStart: params.date,
                        dateEnd: params.date,
                        month: params.month,
                        studentIds: params.studentId ? [params.studentId] : null,
                        sort: params.sort
                    }
                })
                
                return {...recordings.data, status: recordings.status}
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        getClassroomRecordCounts: async({rootState}, params) => {
            try {
                const recordCountApi = async (page) => {
                    const counts = await axios({
                        method: 'GET',
                        baseURL: URLProps.API_SERVER_URL,
                        url: `/classroom/${params.classroomId}/report/record/total/students`,
                        params: {
                            userId: localStorage.uuid,
                            ...params, page
                        }
                    })

                    return {...counts.data, status: counts.status}
                }
                const one = await recordCountApi(0)

                if(one.page.totalPages < 2) {
                    return one
                } else {
                    const pageCount = one.page.totalPages - 1
                    const pages = [...Array(pageCount).keys()].map(p => p + 1)
                    const apiArray = pages.map(p => {
                        return recordCountApi(p)
                    })
                    const response = await Promise.all(apiArray)
                    const studentRecords = [...one._embedded.studentRecords, ...response.map(r => r._embedded.studentRecords).flat()]
                    return {_embedded: { studentRecords }, page: {...one.page, number: pageCount}, status: 200}
                }
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        getClassroomPointTotal: async({rootState}, params) => {
            try {
                const total = await axios({
                    method: 'GET',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/report/point/total`,
                    params: {
                        userId: localStorage.uuid,
                        ...params
                    }
                })
                
                return {...total.data, status: total.status}
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        getClassroomPointNameByTotal: async({rootState}, params) => {
            try {
                const pointByTotal = await axios({
                    method: 'GET',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/report/point/total/points`,
                    params: {
                        userId: localStorage.uuid,
                        ...params
                    }
                })
                
                return {...pointByTotal.data, status: pointByTotal.status}
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        getClassroomStudentByTotal: async({rootState}, params) => {
            try {
                const studentByTotal = await axios({
                    method: 'GET',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/report/point/total/students`,
                    params: {
                        userId: localStorage.uuid,
                        ...params
                    }
                })
                
                return {...studentByTotal.data, status: studentByTotal.status}
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        getClassroomPointIssuedList: async({rootState}, params) => {
            try {
                const url = params.studentId
                    ? `/v2/classroom/${params.classroomId}/report/point/reward/student/${params.studentId}`
                    : `/v2/classroom/${params.classroomId}/report/point/rewards`
                const issuedList = await axios({
                    method: 'GET',
                    baseURL: URLProps.API_SERVER_URL,
                    url,
                    params: {
                        userId: localStorage.uuid,
                        ...params
                    }
                })
                
                return {...issuedList.data, status: issuedList.status}
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        getClassroomPointIssuedListSearch: async({rootState}, params) => {
            try {
                const issuedList = await axios({
                    method: 'POST',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/report/rewards/search`,
                    data: {
                        ...params
                    },
                    params: {
                        page: params.page,
                        size: params.size
                    }
                })
                
                return {...issuedList.data, status: issuedList.status}
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        patchPaidPointMemo: async ({rootState}, params) => {
            try {
                await axios({
                    method: 'PATCH',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/v2/classroom/${params.classroomId}/reward/${params.rewardId}/${params.pointId}/${params.sortNo}/${params.studentId}/memo`,
                    data: {
                        userId: localStorage.uuid,
                        memo: params.memo
                    }
                })
                return {status: 200}
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        deletePaidAllPoint: async ({rootState}, params) => {
            try {
                await axios({
                    method: 'DELETE',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/rewards/all`,
                    params: {
                        userId: localStorage.uuid
                    }
                })
                return {status: 200}
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        deleteTargetPaidAllPoint: async ({rootState}, params) => {
            try {
                await axios({
                    method: 'DELETE',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/rewards/student/${params.studentId}`,
                    params: {
                        userId: localStorage.uuid
                    }
                })
                return {status: 200}
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        deletePaidPoint: async ({rootState}, params) => {
            try {
                await axios({
                    method: 'DELETE',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/v2/classroom/${params.classroomId}/rewards`,
                    data: {
                        userId: localStorage.uuid,
                        ...params
                    }
                })
                return {status: 200}
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        }, 
        patchPointGiveFinishModal: async({rootState, commit}, params) => {
            commit('setPointGiveFinishModal', params)
        },
        getClassroomRecordReports: async({rootState}, params) => {
            try {
                const recordReports = await axios({
                    method: 'POST',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/report/records`,
                    data: params,
                    params: {
                        page: params.page,
                        size: params.size
                    }
                })
                
                return {...recordReports.data, status: recordReports.status}
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        getClassroomRecordReportsSearch: async({rootState}, params) => {
            try {
                const recordReports = await axios({
                    method: 'POST',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/report/records/search`,
                    data: {...params, recordTypes: ['PHOTO', 'VIDEO', 'AUDIO', 'NUGA']},
                    params: {
                        page: params.page,
                        size: params.size
                    }
                })
                
                return {...recordReports.data, status: recordReports.status}
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        getClassroomTags: async({rootState}, params) => {
            try {
                const tags = await axios({
                    method: 'GET',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/tags`,
                    params: {
                        userId: localStorage.uuid,
                        ...params
                    }
                })
                const tagList = tags.data._embedded ? tags.data._embedded.classroomTags : [] 
                return tagList
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        getRecordExcelData: async({rootState}, params) => {
            try {
                const downloadData = await axios({
                    method: 'POST',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/records/excel`,
                    data: {
                        ...params
                    }
                })
                const data = downloadData.data._embedded ? downloadData.data._embedded.classroomContents : [] 
                return data
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        deleteMultiRecordings: async ({rootState}, params) => {
            try {
                await axios({
                    method: 'PUT',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/records/delete`,
                    data: {
                        recordIds: params.recordIds
                    }
                })
                return {status: 200}
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        getBehaviorFiles: async ({rootState}, params) => {
            try {
                const behaviorFiles = await axios({
                    method: 'POST',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/records/files`,
                    data: params,
                    params: {
                        page: params.page ? params.page : 0
                    }
                })
                return {...behaviorFiles.data, status: behaviorFiles.status}
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        getDetailClass: async({commit, state, rootState, dispatch}, params) => {
            try {
                const getDetail = await axios({
                    method: 'GET',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}?userId=${localStorage.uuid}`,
                })

                if(getDetail){
                    const obj = {
                        studentViewType: getDetail.data.studentViewType,
                        pointViewType: getDetail.data.pointViewType
                    }
                    commit('setDetailClass', obj)
                }
                return getDetail
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        connectStompClient: async({state, rootState, dispatch}) => {
            if (state.stompClient) {
                await dispatch('disconnectStompClient')
                state.stompClient = null;
            }

            // console.log("URLProps.BEHAVIOR_CONNECT_URL",localStorage.idToken, URLProps, URLProps.BEHAVIOR_CONNECT_URL)
            state.stompClient = Stomp.client(URLProps.BEHAVIOR_CONNECT_URL);
            state.stompClient.reconnect_delay = 2000;
            state.stompClient.debug = () => {};
            // state.stompClient.debug = (e) => { rootState.log.debug(e) };
            state.stompClient.heartbeat.incoming = 20000;
            state.stompClient.heartbeat.outgoing = 20000;
            state.stompClient.connect(
                { Authorization: `Bearer ${state.isExternalChecklist ? state.checklistToken : localStorage.idToken}` },
                async (success) => {
                    await dispatch('subscribeStompClient')

                    if(state.sendPoints !== null) {
                        await dispatch('sendStompClient', state.sendPoints);
                    }
                },
                async (failure) => {
                  console.log("failure", failure)
                  // 새 창 접근이 아니고, 토큰 만료된 경우에 교실 상세 조회 (토큰 갱신 위함)
                  if (
                    !state.isExternalChecklist &&
                    typeof failure?.headers?.message === 'string' &&
                    failure.headers.message.toLowerCase().includes('jwtvalidationexception')
                  ) {
                    await dispatch('getClassroomDetail', state.curClassroom.classroomId)
                  }

                  if (failure.toString().toLowerCase().includes('lost connection')) {
                    dispatch('connectStompClient')
                  }
                }
            );
        },
        subscribeStompClient: async({commit, state, dispatch, rootState}) => {
            if (!state.stompClient || !state.stompClient.connected) {
                dispatch("connectStompClient")
                return false
            }

            const destination = URLProps.BEHAVIOR_SUBSCRIBE_URL + `classroom_${state.curClassroom.classroomId}`
            state.stompClient.subscribe(
                destination,
                (response) => {
                    dispatch('subscribeReceive', response);
                },
                {
                }
            );
        },
        subscribeReceive: async({state, commit, dispatch, rootState, getters}, payload) => {
            const data = JSON.parse(payload.body)
            const updateSubscribeListOf = (contentType, content) => {
              state.updateSubscribeList = { contentType, content }
            }
            const updateSubscribeListByData = () =>
              updateSubscribeListOf(data.contentType, JSON.parse(data.content));
            ({
              pointComplete: () => {
                const content = JSON.parse(data.content);
                if (!state.mySend.rewardId || state.mySend.rewardId !== content.rewardId) {
                  updateSubscribeListByData();
                }
              },
              pointReset: updateSubscribeListByData,
              drawRandom: () => {
                  if (state.lastSenderUUID !== data.senderUUID) {
                      eventBus.$emit('behavior-records/drawRandom', data)
                  }
              },
              groupDraw: () => {
                  if (state.lastSenderUUID !== data.senderUUID) {
                      eventBus.$emit('behavior-records/openGroupDraw', data)
                  }
              },
              checklist: updateSubscribeListByData,

            }[data.contentType] || (() => {
              if (!state.mySend.rewardId || state.mySend.rewardId !== data.rewardId) {
                updateSubscribeListOf('pointEsc', data);
              }
            }))();
        },
        sendStompClient: async({state, commit, dispatch}, payload) => {
            const obj = JSON.parse(JSON.stringify(payload))
            if(obj.contentType === "pointComplete") {
                const content = JSON.parse(obj.content)
                commit('setMySend', {
                    rewardId: content.rewardId
                })

                state.updateSubscribeList = {
                    contentType: obj.contentType,
                    content: JSON.parse(obj.content)
                }
            } else if(!obj.contentType) {
                commit('setMySend', {
                    rewardId: obj.rewardId
                })

                state.updateSubscribeList = {
                    contentType: "pointEsc",
                    content: obj
                }
            }

            if (!state.stompClient || !state.stompClient.connected) {
                commit('setSendPoints', payload)
                dispatch("connectStompClient")
                return false
            } else {
                commit('setSendPoints', null)
            }

            const destination = URLProps.BEHAVIOR_SUBSCRIBE_URL + `classroom_${state.curClassroom.classroomId}`
            state.stompClient.send(
                destination,
                {},
                JSON.stringify(payload)
            );
        },
        disconnectStompClient: async ({state, dispatch}) => {
            // state.stompClient.deactivate();
            try {
                await dispatch('clearStompClientSubscriptions');
        
                if (state.stompClient && state.stompClient.connect) {
                    state.stompClient.disconnect();
                }
                
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error(e)
            }
        },
        clearStompClientSubscriptions: ({state, dispatch, rootState}) => {
          try {
            if (state.stompClient) {
                //   const stompClientSubscriptionsIds = Object.keys(state.stompClient.subscriptions)
                //   if(stompClientSubscriptionsIds.length > 0){
                //     stompClientSubscriptionsIds.forEach(subscribeId => {
                //       dispatch('unsubscribeStompClient', { subscribeId: subscribeId })
                //     })
                //   }
            }
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e)
          }
        },
        getCharacters : ({commit}) => {
            // remoteConfig.settings = {
            //     minimumFetchIntervalMillis: 3600000,
            // }
            remoteConfig.defaultConfig = ({
                'is_auto_location': 'false',
            })

            remoteConfig.ensureInitialized()
            remoteConfig.fetchAndActivate()
                .then(() => {
                    const data = remoteConfig.getString(FirebaseRemoteConfigKey.STUDENT_CHARACTERS_KEY)
                    const list = JSON.parse(data).map(code => {
                        return {
                            code: code,
                            url: `https://download.hiclass.net/static/classroom/student/${code}_head.png`
                        }
                    })
                    commit('setCharacters', list)
                })
                .catch((err) => {
                    console.log("err", err)
                })
        },

        /* 자리배치 */
        getSeatPlans: async ({rootState, commit}, params) => {   // 자리배치 생성
            try {
                const res = await axios({
                    method: 'GET',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/seatPlan`
                })
                commit('setSeatPlans', _.cloneDeep(res.data._embedded.seatPlans))
                return res
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        getDetailSeatPlan: async ({rootState}, params) => {   // 자리배치 상세조회
            try {
                const res = await axios({
                    method: 'GET',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/seatPlan/${params.seatPlanId}`,
                    params: {
                        version: params.version
                    }
                })

                return res
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        getDetailSeatPlanSections: async ({rootState}, params) => {   // 자리배치 분담/모둠 조회
            try {
                const res = await axios({
                    method: 'GET',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/seatPlan/${params.seatPlanId}/sections?version=${params.version}`,
                    /*
                    params: {
                        version: params.version
                    }
                    */
                })

                return res
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        deleteSeatPlan: async ({rootState}, params) => {   // 자리배치 상세조회
            try {
                const res = await axios({
                    method: 'DELETE',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/seatPlan/${params.seatPlanId}`,
                    params: {
                        version: params.version
                    }
                })

                return res
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        addSeatPlan: async ({rootState}, params) => {   // 자리배치 생성
            try {
                const res = await axios({
                    method: 'POST',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/seatPlan`,
                    data: params.data
                })

                return res
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        resetSeatPlan: async ({rootState}, params) => {   // 자리배치 생성
            try {
                const res = await axios({
                    method: 'PUT',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/seatPlan/${params.seatPlanId}`,
                    params: {
                        version: params.version
                    },
                    data: params.data
                })

                return res
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        updateSeatPlan: async ({rootState}, params) => {   // 자리배치 생성
            try {
                const res = await axios({
                    method: 'PATCH',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/seatPlan/${params.seatPlanId}`,
                    params: {
                        version: params.version
                    },
                    data: params.data
                })

                return res
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        patchStudentSeat: async ({rootState}, params) => {   // 학생 자리 지정/변경
            try {
                const res = await axios({
                    method: 'PUT',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/seatPlan/${params.seatPlanId}/students`,
                    params: {
                        version: params.version
                    },
                    data: {
                        studentSeats: params.studentSeats
                    }
                })

                return res
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        patchStudentHidden: async ({rootState}, params) => {   // 학생 자리 지정/변경
            try {
                const res = await axios({
                    method: 'PATCH',
                    baseURL: URLProps.API_SERVER_URL,
                    url: `/classroom/${params.classroomId}/seatPlan/${params.seatPlanId}/students/hidden`,
                    params: {
                        version: params.version
                    },
                    data: {
                      isStudentHidden: params.isStudentHidden
                    }
                })

                return res
            } catch(error) {
                rootState.log.error(error)
                return {...error.response}
            }
        },
        waitForSeatPlansOfValidLength: ({dispatch}, {classroomId, validLength}) => {
          return new Promise(async (resolve) => {
            let length = 0
            while (length != validLength) {
              length = (await dispatch('getSeatPlans', { classroomId })).data._embedded.seatPlans.length
            }
            resolve()
          })
        },
        /* 자리배치 */
    }
}

export default storeBehavior