<!--
@File(Method): ExportModal.vue
@Date Created: 2024.10.30
@Description: 게시글 내보내기 모달
-->
<template>
  <div class="post-export-wrap" v-if="isReady">
    <!-- 내보내기 모달  -->
    <HiModal class="post-export" type="type01" size="xl" @close="$emit('close')">
      <template v-slot:heading>
        게시글 내보내기
        <div class="smr">내보내기 할 클래스와 게시판을 선택해주세요.</div>
      </template>

      <template v-slot:content>
        <div class="hi-row no-gutters mb-10">
          <!-- 그룹 불러오기  -->
          <div class="col-sm-6 txt-left">
            <HiButton color="light-primary" size="sm" bitrounded @click="openModal('fetchGroups')">
              <HiIcon name="ico-star-fill" size="18"></HiIcon>
              그룹 불러오기
            </HiButton>
            <export-modal-group-list
              v-if="modals.fetchGroups"
              @openModal="openModal"
              @closeModal="closeModal"
              @openGroupEditModal="openGroupEditModal"
              @openGroupDelModal="openGroupEditModal"
              @callGroup="callGroup"
            />
          </div>
          <div class="col-sm-6 txt-right">
            <HiButton
              color="line-default"
              size="sm"
              bitrounded
              @click="openGroupEditModal({mode: 'create', groupName: '', groupId: null})"
              :disabled="!classes.some((classItem) => classItem.isExportChecked)"
            >
            <HiIcon name="ico-plus2" size="18"></HiIcon>
              그룹저장
            </HiButton>
          </div>
        </div>

        <!-- 클래스 목록  -->
        <div class="export-list">
          <ul>
            <li v-for="(classItem, index) in classes" :key="classItem.classId">
              <input
                  type="checkbox"
                  name="export-board-chk"
                  :id="`chk-class-${classItem.classId}`"
                  v-model="classItem.isExportChecked"
                  :class="{disabled: !classItem.isExportChecked}"
                  @click="exportCheckbox($event, classItem)"
              />
              <label :for="`chk-class-${classItem.classId}`">
                <span>
                  <div class="class-name">{{ classItem.className }}</div>
                  <!-- 게시판 목록  -->
                  <export-modal-board-list
                      :classItem="classItem"
                      :classLength="classes.length"
                      :index="index"
                      :pushTarget="postItem.pushTarget"
                  />
                  게시판으로 보냅니다
                </span>
              </label>
            </li>
          </ul>
        </div>
      </template><!-- end content  -->

      <template v-slot:footer>
        <HiButton color="line-light-primary" size="lg" @click="$emit('close')">취소</HiButton>
        <HiButton
            color="primary"
            size="lg"
            @click="exportPost(false)"
            :disabled="!classes.some((classItem) => classItem.isExportChecked)"
        >
          내보내기
        </HiButton>
      </template>
    </HiModal> <!-- end 내보내기 모달  -->

    <!-- 그룹 저장/수정 모달  -->
    <group-edit-modal
      v-if="modals.groupEdit"
      :groupEditInfo="groupEditInfo"
      :classes="classes"
      @closeModal="closeModal"
    />

    <!-- 그룹 삭제 모달 -->
    <group-delete-modal 
      v-if="modals.groupDel" 
      :groupEditInfo="groupEditInfo" 
      @closeModal="closeModal"
    />

    <!-- 선택 해제 후 그룹 불러오기 모달 -->
    <HiModal v-if="modals.reFetch" type="type01" size="xs" closeSkip @close="closeModal('reFetch')">
      <template v-slot:heading>이미 선택된 게시판이 있습니다.</template>
      <template v-slot:content>선택 해제하고 그룹을 불러오시겠습니까.</template>
      <template v-slot:footer>
        <HiButton color="line-light-primary" size="lg" @click="closeModal('reFetch')">취소</HiButton>
        <HiButton color="primary" size="lg" @click="getGroup(); closeModal('reFetch')">확인</HiButton>
      </template>
    </HiModal>

    <!-- 내보내기 진행 모달 -->
    <HiModal v-if="modals.exporting" type="type01" size="xs" closeSkip @close="closeModal('exporting')">
      <template v-slot:heading>내보내기 중입니다.</template>
      <template v-slot:content>
        <div class="w100">
          <p>{{ `${exportProgress} / ${exportTotal}` }}</p>
          <div class="progressbar">
            <span class="bar" :style="{'width': `calc(${exportProgress} / ${exportTotal} * 100%)`}"></span>
          </div>
        </div>
      </template>
    </HiModal>

    <!-- 내보내기 미완료 노티 모달  -->
    <export-retry-confirm-modal
        v-if="modals.exportNoti"
        :classes="classes"
        :exportSuccessCount="exportSuccessCount"
        :exportFailClassBoards="exportFailClassBoards"
        @closeModal="closeModal"
        @exportPost="exportPost"
        @closeExportModal="$emit('close')"
    />
  </div>
</template>

<script>
import HiModal from "@/components/Modal/HiModal";
import HiButton from "@/components/Button/HiButton";
import HiIcon from "@/components/Icon/HiIcon";
import ExportModalGroupList from "@/components/PostExport/ExportModalGroupList";
import ExportModalBoardList from "@/components/PostExport/ExportModalBoardList";
import ExportRetryConfirmModal from "@/components/PostExport/ExportRetryConfirmModal";
import GroupEditModal from "@/components/PostExport/GroupEditModal";
import GroupDeleteModal from "@/components/PostExport/GroupDeleteModal";
import {mapState} from "vuex";

export default {
  name: "export-modal",
  components: {
    ExportRetryConfirmModal,
    GroupDeleteModal,
    GroupEditModal,
    ExportModalBoardList,
    ExportModalGroupList,
    HiIcon,
    HiButton,
    HiModal
  },
  data() {
    return {
      isReady: false,

      modals: {
        groupEdit: false,
        groupDel: false,
        reFetch: false,
        exporting: false,
        exportNoti: false,
      },

      // 클래스 목록
      classes: [],

      // 내보내기 진행
      exportTotal: 0, // 내보낼 게시판 개수
      exportProgress: 0, // 진행도
      exportSuccessCount: 0, // 내보내기 성공 카운트
      exportSuccessClassBoards: [], // 내보내기 성공 정보
      exportFailClassBoards: [], // 내보내기 실패 정보

      // 내보낼 게시글 상세
      postItem: {},

      // 그룹 관리
      groupEditInfo: {
        mode: '',
        groupId: null,
        groupName: ""
      },

      // 그룹 불러오기
      callGroupId: '',
      callGroupFolderCount: 0
    };
  },
  props: {
    postId: {
      type: String
    },
    postTypeName: {
      type: String
    }
  },
  computed: {
    ...mapState({
      user: 'user',
      imagePackResize: 'imagePackResize'
    })
  },
  async mounted() {
    await this.getPost();
    await this.makeClasses();

    // 최근 선택한 목록 불러오기
    const exportingClassBoardInfos = JSON.parse(localStorage.getItem('postExportBoards')) || [];
    if (exportingClassBoardInfos.length > 0) {
      this.selectClassBoards(exportingClassBoardInfos);
    }

    this.isReady = true;
  },
  beforeDestroy() {
    // 선택 목록 저장
    if (this.exportSuccessClassBoards.length > 0) {
      localStorage.setItem('postExportBoards', JSON.stringify(this.exportSuccessClassBoards));
    }
  },
  methods: {
    // 모달 제어 =================================================================
    openModal(modalName) {
      this.$set(this.modals, modalName, true);
    },

    closeModal(modalName) {
      this.$set(this.modals, modalName, false);
    },

    openGroupEditModal({mode, groupName, groupId}) {
      this.groupEditInfo.mode = mode;
      this.groupEditInfo.groupId = groupId;
      this.groupEditInfo.groupName = groupName;
      this.openModal(mode === "delete" ? 'groupDel' : 'groupEdit');
    },

    // 게시물 상세 조회 ===========================================================
    async getPost() {
      const res = await this.$axios({
        method: 'GET',
        url: `/posts/${this.postId}`
      })
      this.postItem = res.data;
    },

    // 클래스-게시판/폴더 목록 =====================================================
    async getClasses(params) {
      return await this.$axios({
        method: 'GET',
        url: `/users/${this.user.currentId}/classes/${this.user.userType}`,
        params: params
      })
    },

    getBoardList(classId) {
      return this.$axios({
        method: 'GET',
        url: `/clazzes/${classId}/board`,
        params: {
          includeDefaultFolder: true
        }
      })
    },

    async makeClasses() {
      this.classes = [];

      let params = {
        page: 0,
        size: 20
      }
      // 클래스 목록
      const res = await this.getClasses(params);

      const classes = (res.data._embedded || {}).classes || [];
      this.classes.push(...classes.map(classItem => {
        return {
          ...classItem,
          isExportChecked: false,
          boardList: []
        }
      }));

      if (res.data.page.totalPages > 1) {
        for (let i = 1; i < res.data.page.totalPages; i++) {
          params.page = i;
          const res = await this.getClasses(params);
          const classes = (res.data._embedded || {}).classes || [];
          this.classes.push(...classes.map(classItem => {
            return {
              ...classItem,
              isExportChecked: false,
              boardList: []
            }
          }));
        }
      }

      if (this.classes.length > 0) {
        // 게시판 목록
        for (const classObj of this.classes) {
          const boardRes = await this.getBoardList(classObj.classId);

          const boardList = (boardRes.data._embedded || {}).boardList || [];
          classObj.boardList.push(...boardList.filter(b => b.boardType !== 'SECRET').map(board => {
            board.isChecked = false
            board.folderList.map(folder => folder.isChecked = false)
            return board
          }))
        }
      }
    },

    // 게시글 내보내기 ============================================================
    // 내보내기
    async exportPost(isRetry) {
      if (isRetry) {
        this.exportProgress = 0;
      }

      // 1. 내보내기 할 클래스(게시판/폴더) 배열
      let exportingClassBoardInfos = [];
      if (!isRetry) {
        exportingClassBoardInfos = this.getExportingClassBoardInfos();
      } else {
        exportingClassBoardInfos = _.cloneDeep(this.exportFailClassBoards);
        this.exportFailClassBoards = [];
      }

      if (exportingClassBoardInfos.length === 0) {
        this.$toasted.clear();
        this.$toasted.show("게시판을 선택해주세요.", {
          duration: 2000,
          className: "type01",
          position: "post-export-bottom-center",
        });
        return;
      }

      this.exportTotal = exportingClassBoardInfos.length;

      // 2. 내보내기 전 유효성 체크
      const validRes = await this.validPost();
      // 2-1. 게시글 삭제 체크
      if (validRes.data.isPostDel) {
        this.$hiClass.alert('게시글이 삭제되었습니다.', 'error')
            .then(() => {
              this.$emit("deletePost", this.postItem.currentId);
              this.$emit('close');
            })
        return false;
      }

      // 2-2. 비공개/삭제 클래스, 게시판/폴더 삭제, 게시판 미사용, 게시판 읽기 권한 블일치
      if (!validRes.data.isExport) {
        this.$hiClass.alert('내보낼 수 없는 클래스/게시판이 포함되어있습니다.<br>다시 확인해주세요.', 'warning')
            .then(async () => {
              await this.makeClasses();
              this.selectClassBoards(exportingClassBoardInfos);
            })
        return false;
      }

      // 2-3. 미사용 폴더 => 기폰 폴더로 변경 하여 내보내기
      if (validRes.data.folders.length > 0) {
        validRes.data.folders.forEach(folder => {
          const changedInfo = exportingClassBoardInfos.find(exportingClassBoardInfo => exportingClassBoardInfo.folderId === folder.folderId);
          if (changedInfo) {
            changedInfo.folderId = folder.defaultFolderId;
          }
        })
      }

      // 2-4. 게시글 수정 여부 체크
      if (validRes.data.updatedTimestamp > this.postItem.updatedTimestamp) {
        await this.getPost();
      }

      // 3. 내보내기
      this.openModal('exporting');
      for (let i = 0; i < exportingClassBoardInfos.length; i++) {
        const exportingClassBoardInfo = exportingClassBoardInfos[i];

        // 3-1. 게시글 복사
        let {copyPostItem, copyFiles} = await this.copyPost(exportingClassBoardInfo);
        if (!copyPostItem) {
          // 복사 실패 === 게시물 내보내기 실패이므로 copyFiles delete 요청
          if (copyFiles.length > 0) {
            copyFiles = copyFiles.map(copyFile => {
              delete copyFile.originalFile;
              return copyFile;
            })
            copyFiles.forEach(file => this.$hiClass.multipart.delete(file));
          }

          this.exportFailClassBoards.push(exportingClassBoardInfo);
          this.exportProgress++;
          continue;
        }

        // 3-2. 게시글 저장
        try {
          await this.$hiClass.posts.create(copyPostItem);
          this.exportSuccessCount++;
          this.exportSuccessClassBoards.push(exportingClassBoardInfo);
        } catch (error) {
          // 게시물 등록 실패 === 게시물 내보내기 실패이므로 copyFiles delete 요청
          copyFiles.forEach(file => this.$hiClass.multipart.delete(file));

          if (error.response.status === 428) {
            switch (error.response.data.error) {
              case 'notFoundBoardFolder':
              case 'deletedBoard':
              case 'deletedFolder':
              case 'deactivatedBoard':
              case 'deactivatedClass': {
                break
              }
              default: {
                this.exportFailClassBoards.push(exportingClassBoardInfo);
              }
            }

          } else { // 정의되지 않은 에러인 경우 내보낼 게시물 모두 실패 처리
            this.exportFailClassBoards.push(...exportingClassBoardInfos.slice(i, exportingClassBoardInfos.length));
            break
          }

        } finally {
          this.exportProgress++;
        }
      }

      this.closeModal('exporting');

      if (this.exportFailClassBoards.length > 0) {
        this.openModal('exportNoti');
      } else {
        this.$emit('close')
        this.$toasted.show("게시글 내보내기가 완료되었습니다.", {
          duration: 2000,
          className: "type01",
          position: "post-export-bottom-center",
        });
      }
    },

    // 내보낼 게시판 목록
    getExportingClassBoardInfos() {
      const exportClasses = this.classes.filter(classItem => classItem.isExportChecked);

      // 최종적으로 내보내기 할 클래스/게시판/폴더
      let exportingClassBoardInfos = [];

      for (let exportClass of exportClasses) {
        exportClass.boardList.map(board => {
          for (let folder of board.folderList) {
            if (folder.isChecked) {
              exportingClassBoardInfos.push({
                classId: exportClass.classId,
                boardId: board.boardId,
                folderId: folder.folderId,
                postType: board.postType
              })
            }
          }
        })
      }

      return exportingClassBoardInfos;
    },

    // 유효성 체크
    async validPost() {
      let boards = this.getExportingClassBoardInfos().map(classBoardInfo => {
        return {
          classId: classBoardInfo.classId,
          boardId: classBoardInfo.boardId,
          folderId: classBoardInfo.folderId
        }
      })

      return await this.$axios({
        method: 'POST',
        url: `/posts/${this.postItem.currentId}/valid`,
        data: { userId: this.user.currentId, boards }
      })
    },

    // 게시글 내보내기(게시글 복사) =================================================
    // 게시글 복사
    async copyPost(exportingClassBoardInfo) {
      let copyFiles = [];
      let copyPostItem = null;

      try {
        // 1. 파일 복사
        if (this.postItem.files && this.postItem.files.length > 0) {
          for (const originalFile of this.postItem.files) {
            const copyFile = this.copyFile(originalFile);

            const copiedFile = await this.callMultipartCopy(copyFile, originalFile);
            if (!copiedFile) {
              return { copyPostItem, copyFiles };
            }
            copyFiles.push(copiedFile);
          }
        }

        // 2. 복사 된 파일로 본문 가공
        const postContent = this.copyPostContent(this.postItem.postContent, copyFiles);
        if (!postContent) {
          return { copyPostItem, copyFiles };
        }
        copyFiles = copyFiles.map(copyFile => {
          delete copyFile.originalFile;
          return copyFile;
        })

        // 3. post 복사
        copyPostItem = this.copyPostObj(exportingClassBoardInfo, postContent, copyFiles);
        return { copyPostItem, copyFiles };

      } catch (error) {
        this.$log.debug(`copyPost err: ${error}`);
        return { copyPostItem, copyFiles };
      }
    },

    // 파일 복사
    copyFile(originalFile) {
      let copyFile = { isEncode: true };

      // 이미지일때
      if (originalFile.fileContentType.startsWith('image')) {
        copyFile.fileOriginalPath = originalFile.fileOriginalPath;
      }

      // 영상일때
      if (originalFile.fileContentType.startsWith('video')) {
        copyFile.fileOriginalPath = originalFile.fileOriginalPath;
        if (originalFile.fileTranscodePath) { // 인코딩 완료됨
          copyFile.fileTranscodePath = originalFile.fileTranscodePath;
          copyFile.isEncode = false;
          // 썸네일
          if (originalFile.fileThumbnailPath && !originalFile.fileThumbnailPath.includes('image.hiclass.net')) {
            copyFile.fileThumbnailPath = originalFile.fileThumbnailPath.split('?')[0];
          }
        }
      }

      // 문서일때
      if (!originalFile.fileContentType.startsWith('image') && !originalFile.fileContentType.startsWith('video')) {
        copyFile.fileOriginalPath = originalFile.fileOriginalPath;
        if (originalFile.fileConvertPath && !originalFile.fileConvertPath.includes('image.hiclass.net')) {
          copyFile.fileConvertPath = originalFile.fileConvertPath;
          copyFile.isEncode = false;
        }
        if (originalFile.fileThumbnailPath && !originalFile.fileThumbnailPath.includes('image.hiclass.net')) {
          copyFile.fileThumbnailPath = originalFile.fileThumbnailPath.split('?')[0];
        }
      }

      return copyFile
    },

    // 파일 복사 api 호출
    async callMultipartCopy(copyFile, originalFile) {
      const isEncode = copyFile.isEncode;
      delete copyFile.isEncode;

      const copyRes = await this.$hiClass.multipart.copy(copyFile, { encode: isEncode });

      if (copyRes.status === 200) {
        let fileContentType = originalFile.fileContentType;
        let fileName = originalFile.fileName;
        if (copyRes.data.fileOriginalPath && copyRes.data.fileOriginalPath.includes('.mp4')) {
          try {
            fileContentType = 'video/mp4';
            fileName = `${originalFile.fileName.split('.')[0]}.mp4`;
          } catch (e) {
            fileContentType = originalFile.fileContentType;
            fileName = originalFile.fileName;
          }
        }
        return {
          originalFile,
          fileContentType: fileContentType,
          fileFlag: originalFile.fileFlag,
          fileName: fileName,
          fileSize: originalFile.fileSize,
          ...copyRes.data
        }
      } else {
        return null;
      }
    },

    // 본문 복사
    copyPostContent(postContent, copyFiles) {
      try {
        let domParser = new DOMParser()
        let postContentDocument = domParser.parseFromString(postContent, 'text/html');
        let editorElement = null;

        const documentBody = postContentDocument.body;
        if (!documentBody) return null;

        // 본문
        editorElement = documentBody.querySelector('.class-fr-editor');
        if (editorElement) {
          // 본문 영상 교체
          const videos = editorElement.querySelectorAll('video');
          for (const video of videos) {
            video.controls = true;

            const videoSrc = video.firstElementChild && video.firstElementChild.src;
            const videoFile = copyFiles.find(file => file.originalFile.fileOriginalPath === videoSrc || file.originalFile.fileTranscodePath === videoSrc);

            if (videoSrc && videoFile) {
              if (videoFile.fileTranscodePath || videoFile.fileOriginalPath) {
                video.firstElementChild.src = videoFile.fileTranscodePath || videoFile.fileOriginalPath;
                if (videoFile.fileTranscodePath && videoFile.fileTranscodePath.includes('mp4')) {
                  video.firstElementChild.type = 'video/mp4';
                }
              }
            }

            if (videoSrc && videoFile && videoFile.fileThumbnailPath && videoFile.fileThumbnailPath !== '') {
              video.poster = videoFile.fileThumbnailPath;
            }
          }

          const frVideoEls = editorElement.querySelectorAll('.fr-video');
          for (const frVideoEl of frVideoEls) {
            frVideoEl.setAttribute('contenteditable', 'false');
          }

          // 본문 이미지 교체
          const images = editorElement.querySelectorAll('img')
          for (const img of images) {
            const imgSrc = img.src;
            const imgFile = copyFiles.find(d => d.originalFile.fileOriginalPath === imgSrc);

            if (imgSrc && imgFile) {
              if (imgFile.fileOriginalPath) {
                img.src = imgFile.fileOriginalPath;
              }
            }
          }
        }

        // 묶음 이미지
        let imagePackElement = documentBody.querySelector('.img-list-inner');
        if (imagePackElement) {
          imagePackElement.innerHTML = "";

          const imagePackFiles = copyFiles.filter(copyFile => copyFile.fileFlag === 'IMAGE_PACK');
          if (imagePackFiles.length > 0) {
            for (const imagePackFile of imagePackFiles) {
              const filesAnchorElement = postContentDocument.createElement('a');
              filesAnchorElement.href = 'javascript:void(0);';

              const filesImgThumbnailElement = postContentDocument.createElement('img');
              filesImgThumbnailElement.src = imagePackFile.fileThumbnailPath;
              filesImgThumbnailElement.alt = "";

              if (!imagePackFile.fileThumbnailPath) {
                // 묶음 사진 이미지일 경우 썸네일 주소 생성
                filesImgThumbnailElement.src = imagePackFile.fileOriginalPath.replace('//download', '//image')
                    .concat(`?width=${this.imagePackResize.THUMBNAIL_MAX_WIDTH}`)
                    .concat(`&height=${this.imagePackResize.THUMBNAIL_MAX_HEIGHT}`);
              }

              filesAnchorElement.appendChild(filesImgThumbnailElement);
              imagePackElement.appendChild(filesAnchorElement);
            }
          }
        }

        // 문서
        let docFileElement = documentBody.querySelector('.file-list');
        if (docFileElement) {
          docFileElement.innerHTML = "";

          const docFiles = copyFiles.filter(copyFile => copyFile.fileFlag === 'FILE' && !copyFile.fileContentType.startsWith('image') && !copyFile.fileContentType.startsWith('video'));
          for (const docFile of docFiles) {
            let filesAnchorElement = postContentDocument.createElement('a');
            filesAnchorElement.href = 'javascript:void(0);';

            let filesSpanFileNameElement = postContentDocument.createElement('span');
            filesSpanFileNameElement.className = 'attached-file-name';
            filesSpanFileNameElement.innerText = docFile.fileName;

            let filesSpanPreViewElement = postContentDocument.createElement('span');
            filesSpanPreViewElement.className = 'attached-preview';

            let filesImgPreViewElement = postContentDocument.createElement('img');
            filesImgPreViewElement.src = docFile.fileThumbnailPath;
            filesImgPreViewElement.alt = "";

            filesSpanPreViewElement.appendChild(filesImgPreViewElement);

            filesAnchorElement.appendChild(filesSpanFileNameElement);
            filesAnchorElement.appendChild(filesSpanPreViewElement);

            docFileElement.appendChild(filesAnchorElement);

            // doc 썸네일이 없을 경우 썸네일 영역 삭제
            if (!docFile.fileThumbnailPath)
              filesSpanPreViewElement.remove();
          }
        }

        return postContentDocument.body.innerHTML
      } catch (e) {
        this.$log.error(`getCopyPostContentEditor error => `, e);
        return null;
      }
    },

    // 등록 게시물 가공
    copyPostObj(exportingClassBoardInfo, postContent, copyFiles) {
      // 알림장 아니면 안전수칙 설정 제거
      if (exportingClassBoardInfo.postType !== 'NOTE') {
        this.postItem.postOptions = this.postItem.postOptions
            .filter(postOption => postOption.name !== 'safetyRoles' && postOption.name !== 'categoryId')
      }

      // 원문 게시물이 알림장인 경우 제목이 없이 작성되었다면 원문게시물의 기본 알림장 제목으로 저장
      if (this.postItem.postType === 'NOTE') {
        this.postItem.postTitle = this.postItem.postTitle ? this.postItem.postTitle : this.$moment(this.postItem.posted).format(`M월 D일 (ddd) ${this.postTypeName}`);
      }

      const PostObj = {
        posted: this.$moment().valueOf(),
        postType: exportingClassBoardInfo.postType,
        postTitle: this.postItem.postTitle,
        postContent: postContent,
        postStatus: 'COMPLETE',
        postMustRead: this.postItem.postMustRead,
        postPin: this.postItem.postPin,
        parentUri: `${process.env.VUE_APP_BASE_API_URI}/clazzes/${exportingClassBoardInfo.classId}`,
        boardId: exportingClassBoardInfo.boardId,
        categoryId: exportingClassBoardInfo.folderId,
        disclosureType: true,
        pushTarget: this.postItem.pushTarget,
        version: 'V2',
        files: copyFiles,
        postOptions: this.postItem.postOptions || [],
        userType: this.postItem.userType
      }
      if (this.postItem.postType === 'HOMEWORK' && exportingClassBoardInfo.postType === 'HOMEWORK') {
        PostObj.timestampStart = this.postItem.timestampStart;
        PostObj.timestampEnd = this.postItem.timestampEnd;
      }
      return PostObj;
    },

    // 그룹 불러오기 ==============================================================
    callGroup({groupId, folderCount}) {
      this.callGroupId = groupId;
      this.callGroupFolderCount = folderCount;

      if (this.classes.some((classItem) => classItem.isExportChecked)) {
        this.openModal('reFetch');
        return false;
      }

      this.getGroup();
    },

    // 그룹 불러오기 api 호출
    async getGroup() {
      let isReadParents = false;
      let isReadStudent = false;

      switch (this.postItem.pushTarget) {
        case 'ALL': {
          isReadParents = true;
          isReadStudent = true;
          break;
        }
        case 'PARENTS': {
          isReadParents = true;
          break;
        }
        case 'STUDENT': {
          isReadStudent = true;
          break;
        }
      }

      try {
        const res = await this.$axios({
          method: 'GET',
          url: `/users/${this.user.currentId}/boards/groups/${this.callGroupId}`,
          params: { isReadParents, isReadStudent }
        })

        const classIds = [];
        const boardIds = [];
        const folderIds = [];

        if (res.data._embedded.list && res.data._embedded.list.length > 0) {
          for (const group of res.data._embedded.list) {
            group.classes.map(classItem => {
              classIds.push(classItem.classId);
              boardIds.push(...classItem.boards.map(board => board.boardId));

              classItem.boards.map(board => {
                folderIds.push(...board.folders.map(folder => folder.folderId));
              })
            })
          }
        }

        this.classes.map(classItem => {
          classItem.isExportChecked = classIds.includes(classItem.classId);

          classItem.boardList.map(board => {
            board.folderList.map(folder => {
              folder.isChecked = folderIds.includes(folder.folderId);
            })

            board.isChecked = boardIds.includes(board.boardId) && board.folderList.every(folder => folder.isChecked);
          })
        })

        if (folderIds.length !== this.callGroupFolderCount) {
          this.$toasted.clear();
          this.$toasted.show("읽기권한이 없는 게시판은 제외되었습니다.", {
            duration: 2000,
            className: "type01",
            position: "post-export-bottom-center",
          });
        }

      } catch (error) {
        this.$log.debug('getGroup error: ', error);
      }
    },

    // 클래스 게시판 선택
    selectClassBoards(exportingClassBoardInfos) {
      const classIds = [];
      const boardIds = [];
      const folderIds = [];

      exportingClassBoardInfos.forEach(postExportBoard => {
        classIds.push(postExportBoard.classId);
        boardIds.push(postExportBoard.boardId);
        folderIds.push(postExportBoard.folderId);
      })

      this.classes.map(classItem => {
        classItem.boardList.map(board => {
          board.folderList.map(folder => {
            folder.isChecked = folderIds.includes(folder.folderId) && this.checkPushTarget(board);
          })
          board.isChecked = boardIds.includes(board.boardId) && board.folderList.every(folder => folder.isChecked);
        })

        classItem.isExportChecked = classIds.includes(classItem.classId) &&
            (
                classItem.boardList.some(board => board.isChecked) ||
                classItem.boardList.flatMap(board => board.folderList).some(folder => folder.isChecked)
            );
      })
    },

    // ==========================================================================
    // 게시판 선택 안됐을때 클래스 선택 시 toast
    exportCheckbox(event, classItem) {
      const isCheckedBoard = classItem.boardList.some(board => board.isChecked);
      const isCheckedFolder = classItem.boardList
          .flatMap(board => board.folderList.flatMap(folder => folder.isChecked))
          .some(isChecked => isChecked);

      if (!(isCheckedBoard || isCheckedFolder)) {
        this.$toasted.clear();
        this.$toasted.show("게시판을 선택해주세요.", {
          duration: 2000,
          className: "type01",
          position: "post-export-bottom-center",
        });
        event.preventDefault();
      }
    },

    // 게시판 읽기 권한 체크
    checkPushTarget(board) {
      switch (this.postItem.pushTarget) {
        case 'ALL': {
          return board.isReadParents && board.isReadStudent;
        }
        case 'PARENTS': {
          return board.isReadParents;
        }
        case 'STUDENT': {
          return board.isReadStudent;
        }
        case 'TEACHER': {
          return true;
        }
        default: {
          return false;
        }
      }
    },
  }
}
</script>

<style lang="scss" scoped>
.post-export-wrap{
  position: fixed;
  z-index: 9999;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;

  .post-export {
    ::v-deep .modal__layer {
      height: 740px;
      .modal__content {
        height: calc(100% - 175px);
      }
    }

    // 내보내기 리스트
    .export-list {
      border: 1px solid var(--gray-05);
      border-radius: 6px;
      padding: 12px 0;
      height: calc(100% - 34px);

      ul {
        overflow-y: auto;
        height: 100%;

        > li {
          > label {
            display: flex;
            align-items: center;
            padding: 8px 20px;
            &::before {
              background: url(~@/assets/img/svg/checkbox-add.svg) no-repeat;
            }
            > span {
              display: flex;
              align-items: center;
              .class-name {
                width: 220px;    
                text-align: left;
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                line-height: 1.2;                
                word-break: break-all;
              }
            }
          }
          > input[type="checkbox"]:checked + label::before {
            background: url(~@/assets/img/svg/checkbox-checked.svg) no-repeat;
          }

          .hi-selectbox::v-deep {
            width: 340px;
            margin: 0 10px;
            .option__layer {
              // max-height: 330px;
              max-height: 217px;
            }
            .board-list {
              border: 0;
            }
            .selected {
              border: 1px solid #666;
            }
            &:not(.is-opened):hover .selected {
              border: 1px solid #222;
              transition: 0.3s;
            }
          }
          input[type="checkbox"]:disabled + label > span,
          input[type="checkbox"].disabled + label > span {
            color: #bdbdbd;
            .hi-selectbox::v-deep {
              &:not(.is-opened) .selected {
                color: #616161;
                border: 1px solid #e0e0e0;
              }
              &:not(.is-opened):hover .selected {
                border-color: #666;
                transition: 0.3s;
              }
            }
          }
          input[type="checkbox"]:checked + label > span {
            .hi-selectbox::v-deep {
              .selected {
                border: 1px solid var(--primary);
                background: var(--primary-03);
              }
            }
          }
        }
      }
    }
  }
}

</style>