<!--
@File(Method): MainBodySchoolsHeader.vue
@Description: 클래스 > 상단 영역 > 학교
@Modified: 2025-03-05 - #72684 프로필 이미지 아바타(HiAvatar) 구축 및 적용
-->
<template>
  <div class="cont-box-top-inner">
    <div class="class-top-heading">
      <div class="info">
        <HiAvatar
          class="image"
          type="school"
          size="lg" 
          :img="curSchoolImagePath ? curSchoolImagePath : null"
          alt="학교 이미지" 
        />             
        <!-- #72684 프로필 이미지 아바타(HiAvatar) 적용 전
        <div class="avatar-img lg image class">
          <div class="img-area">
            <img v-if="curSchoolImagePath" :src="curSchoolImagePath" alt="">
          </div>          
        </div>
        -->  
        <strong class="heading">{{ shortenSchoolName }}</strong>
        <span>{{ curSchoolAddress }}</span>
      </div>

      <div class="group-btn">
        <button
          v-if="curSchoolHomepage"
          class="hi-btn btn-white btn-md"
          @click="goHomePage(curSchoolHomepage)"
        >
          {{ $t("schools.homepage.button") }}
        </button>

        <main-body-schools-subscribe-btn
          v-if="schoolUri"
          :key="subscribeUuid"
          :is-disabled-subscribe-button="isDisabledSubscribeButton"
          :is-subscribe="isSubscribe"
          :school-uri="schoolUri"
          :subscribe-uuid="subscribeUuid"
          :school-subscribe-button-type="CONSTANTS.SCHOOL_SUBSCRIBE_BUTTON_TYPE.SCHOOLS"
          @subscribeComplete="subscribeComplete"
          @unSubscribeComplete="unSubscribeComplete"
        />
      </div>

    </div>
  </div>
</template>

<script>
import MainBodySchoolsSubscribeBtn from "./MainBodySchoolsSubscribeBtn.vue";
import {mapGetters} from "vuex";

export default {
  name: "mainBodySchoolsHeader",
  props: [
    "schools",
    "schoolUuid",
    "schoolUri",
    "user",
    "userUri",
    "isSubscribe",
    "subscribeUuid",
    "isDisabledSubscribeButton"
  ],
  components: {
    MainBodySchoolsSubscribeBtn
  },
  data: () => ({
    // postUrl: "/posts",
    // postProps: ["posted", "posteType", "posteTitle", "postContent", "files"],
  }),
  computed: {
    ...mapGetters({
      CONSTANTS: 'CONSTANTS'
    }),
    shortenSchoolName() {
      return this.$stringUtil.shorteningByLength(this.schools.schoolName)
    },
    curSchoolAddress() {
      return this.schools && this.schools.schoolAddress
        ? this.schools.schoolAddress
        : ''
    },
    curSchoolImagePath() {
      return this.schools && this.schools.schoolImagePath
        ? this.schools.schoolImagePath
        : ''
    },
    curSchoolHomepage() {
      return this.schools && this.schools.schoolUrl
        ? this.schools.schoolUrl
        : ''
    },
  },
  methods: {
    goHomePage(url) {
      // 새 탭으로 학교 홈페이지 열기
      window.open(url)
    },
    createTemplate(el) {
      // const postTypeVal = el.toUpperCase();
      let postUrl = "/posts";

      let param = {};
      let paramArr = [];

      if (el === "prompt") {
        const posted = prompt("포스트 일자를 입력해 주세요. ex)2019-09-24", "");
        if (posted === null) return false;

        const postType = prompt("포스트 타입을 입력해 주세요. ex)MEAL", "");
        if (postType === null) return false;

        const postTitle = prompt("제목을 입력해 주세요.", "");
        if (postTitle === null) return false;

        const postContent = prompt(
          "본문을 입력해 주세요. (개행 처리 포함)",
          ""
        );
        if (postContent === null) return false;

        let files = [];
        const file1 = prompt(
          "첨부파일을 입력해 주세요. (JSON 형식. 더이상 추가하지 않을 경우 공란 입력)",
          ""
        );
        const file2 = prompt(
          "첨부파일을 입력해 주세요. (JSON 형식. 더이상 추가하지 않을 경우 공란 입력)",
          ""
        );
        const file3 = prompt(
          "첨부파일을 입력해 주세요. (JSON 형식. 더이상 추가하지 않을 경우 공란 입력)",
          ""
        );
        const file4 = prompt(
          "첨부파일을 입력해 주세요. (JSON 형식. 더이상 추가하지 않을 경우 공란 입력)",
          ""
        );

        if (
          posted === null ||
          postType === null ||
          postTitle === null ||
          postContent === null
        ) {
          alert("필수 항목이 입력되지 않았습니다.");
          return false;
        }
        if (file1 !== null && file1 !== "") files.push(JSON.parse(file1));
        if (file2 !== null && file2 !== "") files.push(JSON.parse(file2));
        if (file3 !== null && file3 !== "") files.push(JSON.parse(file3));
        if (file4 !== null && file4 !== "") files.push(JSON.parse(file4));

        param["posted"] = new Date(posted).getTime();
        param["postStatus"] = "COMPLETE";
        param["postType"] = postType;
        param["postTitle"] = postTitle;
        param["postContent"] = postContent;
        param["parentUri"] = this.schoolUri;
        param["files"] = files;
      } else if (el === "CALENDAR_SCHOOL") {
        const posted = prompt("포스트 일자를 입력해 주세요. ex)2019-09-24", "");
        if (posted === null) return false;

        const postType = "CALENDAR_SCHOOL";
        const postTitle = prompt("제목을 입력해 주세요.", "");
        if (postTitle === null) return false;

        const postContent = prompt(
          "본문을 입력해 주세요. (개행 처리 포함)",
          ""
        );
        if (postContent === null) return false;

        if (
          posted === null ||
          postType === null ||
          postTitle === null ||
          postContent === null
        ) {
          alert("필수 항목이 입력되지 않았습니다.");
          return false;
        }

        param["posted"] = new Date(posted).getTime();
        param["postStatus"] = "COMPLETE";
        param["postType"] = postType;
        param["postTitle"] = postTitle;
        param["postContent"] = postContent;
        param["parentUri"] = this.schoolUri;
      }

      this.$log.debug(param);

      if (paramArr.length > 0) {
        for (param of paramArr) {
          this.$axios({
            method: "post",
            url: postUrl,
            data: param
          })
            .then(result => {
              this.$log.debug(
                `'${result.data._links.self.href}'가 생성되었습니다.`
              );
            })
            .catch(error => {
              this.$log.debug(error);
            });
        }
      } else {
        this.$axios({
          method: "post",
          url: postUrl,
          data: param
        })
          .then(result => {
            alert(`'${result.data._links.self.href}'가 생성되었습니다.`);
            this.$router.go(0);
          })
          .catch(error => {
            this.$log.debug(error);
          });
      }
    },
    subscribeComplete(subscribeUri) {
      this.$parent.isSubscribe = true;
      this.$parent.subscribeUuid = this.$comn.split(subscribeUri, "/");
    },
    unSubscribeComplete() {
      this.$parent.isSubscribe = false;
      this.$parent.subscribeUuid = "";
    },
  }
};
</script>
