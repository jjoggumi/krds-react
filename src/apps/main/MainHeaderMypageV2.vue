<template>
  <div class="mypage-wrap" ref="mypageWrap" :class="['variant-' + variant]">
    <ul v-if="isLoginUser">
      <li class="user-name">
        <a
          href="javascript:"
          @click="toggleDropdown"
          @mouseenter="isDropdownHovered = true"
          @mouseleave="isDropdownHovered = false"
        >
          <span class="photo">
            <img :src="loginUserPhoto" @error="loginUserPhotoReplace" alt="" />
          </span>
          <span class="user-name-text" v-show="showUserInfoText">{{ trimmedUserName }}</span>
          <span v-if="loginUserType" class="user-type" v-show="showUserInfoText">{{ loginUserType }}</span>
          <HiIcon
            :name="(variant === 'default' || variant === 'alarmplus') && (isDropdownHovered || isDropdownOpen) ? 'ico-down-circle-fill' : 'ico-down-circle'"
            :color="variant === 'alarmplus' ? 'white' : 'black'"
            size="20"
            @click.stop="toggleDropdown"
            :class="['rotate-icon', { open: isDropdownOpen }]"
            v-show="showUserInfoText"
          />
        </a>
        <ul
          v-if="isDropdownOpen"
          class="dropdown-layer"
          :class="{ open: dropdownOpenState }"
          v-click-outside="hideMyPage"
          ref="mypageDropdown"
        >
          <!-- :style="dropdownInlineStyle" -->
          <li :class="{ selected: selectedMenu === 'MY_PAGE' }">
            <a href="javascript:" @click="onClick('MY_PAGE')">
              <span class="mypage-icon-btn">
                <img src="~@/assets/img/icon/ic-my.png" alt="알림" />
              </span>
              마이페이지
            </a>
          </li>
          <li :class="{ selected: selectedMenu === 'HELP' }">
            <a href="javascript:" @click="onClick('HELP')">
              <span class="mypage-icon-btn">
                <img src="~@/assets/img/icon/ic-smile.png" alt="알림" />
              </span>
              고객센터
            </a>
          </li>
          <li :class="{ selected: selectedMenu === 'LOGOUT' }">
            <a href="javascript:" @click="onClick('LOGOUT')">
              <span class="mypage-icon-btn">
                <img src="~@/assets/img/icon/ic-logout.png" alt="알림" />
              </span>
              로그아웃
            </a>
          </li>
        </ul>
      </li>
    </ul>
    <ul v-else>
      <li>
        <a href="javascript:" @click="logout()">인트로 페이지로 이동</a>
      </li>
    </ul>
  </div>
</template>

<script>

import {mapActions} from "vuex";

export default {
  name: "mainHeader_v2",
  props: {
    user: Object,
    variant: {
      type: String,
      default: 'default'
    }
  },
  components: {},
  data: () => ({
    callbackUrl: "",
    isLogouting: false,
    isDropdownOpen: false,
    dropdownOpenState: false,
    selectedMenu: null,
    showUserInfoText: window.innerWidth >= 1024,
    isDropdownHovered: false,
    dropdownPos: { top: 0, left: 0 }
  }),
  computed: {
    trimmedUserName() {
      const name = this.user?.userName || '';
      return name.length > 5 ? name.slice(0, 5) + '…' : name;
    },
    isLoginUser() {
      return this.user.userName !== undefined;
    },
    loginUserPhoto() {
      const userPhoto = this.user.userPhoto
        ? this.user.userPhoto
        : this.$store.state.userProfileDefault

      // return `<span class="photo" style="background-image: url('${userPhoto}');"></span>`
      return userPhoto
    },
    loginUserStr() {
      let loginUserStr = this.user.userName
      loginUserStr += '<span>'

      switch (this.user.userType) {
        case 'TEACHER':
          loginUserStr += ' 선생님'
          break
        case 'PARENTS':
          loginUserStr += ' 학부모'
          break
        case 'STUDENT':
          loginUserStr += ' 학생'
          break
      }
      // loginUserStr += ' 님'
      loginUserStr += "</span>"

      return loginUserStr;
    },
    loginUserHtml() {
      return this.loginUserPhoto + this.loginUserStr
    },
    loginUserType() {
      let loginUserType = null
      switch (this.user.userType) {
        case 'TEACHER':
          loginUserType = ' 선생님'
          break
        case 'PARENTS':
          loginUserType = ' 학부모'
          break
        case 'STUDENT':
          loginUserType = ' 학생'
          break
      }
      return loginUserType
    },
    // 드롭다운 고정 좌표 스타일
    dropdownInlineStyle() {
      if (!this.isDropdownOpen) return {};
      return {
        left: this.dropdownPos.left + 'px',
        top: this.dropdownPos.top + 'px'
      };
    }
  },
  created() {},
  methods: {
    ...mapActions({
      triggerAnalyticsLogEvent: 'triggerAnalyticsLogEvent',
    }),
    ...mapActions("storeHitalk",{
      callChatWebToken: "callChatWebToken"
    }),
    goRoute(path) {
      if (path === this.$route.path) this.$router.go(0);
      else this.$router.push(path, () => {});
    },
    async logout() {
      if(!this.isLogouting) {
        this.isLogouting = true
        await this.callChatWebToken({
          token : "",
          method : "delete"
        });
        
        this.$router.push("/logout", () => {
          this.isLogouting = false
        });
      }
    },
    onClick(button) {
      // 메뉴 클릭 시 드롭다운은 항상 닫기
      // (HELP는 라우팅으로 자연스럽게 사라지지만, MY_PAGE도 동일하게 닫히도록 처리)
      this.hideMyPage();
      this.selectedMenu = button
      switch (button) {
        case 'LOGOUT':
          this.triggerAnalyticsLogEvent({ code: 'analytics.header.gnbMyPage.logout.click' })
          this.logout()
          break
        case 'MY_PAGE':
          this.triggerAnalyticsLogEvent({ code: 'analytics.header.gnbMyPage.myPage.click' })
          this.triggerAnalyticsLogEvent({ code: 'analytics.mypage.click' })
          this.goRoute('/main/mypage')
          break
        case 'HELP':
          this.triggerAnalyticsLogEvent({ code: 'analytics.header.gnbMyPage.help.click' })
          this.triggerAnalyticsLogEvent({ code: 'analytics.help.click' })
          this.goRoute('/help')
          break
      }
    },
    loginUserPhotoReplace(e) {
      e.target.src = this.$store.state.userProfileDefault
    },
    toggleDropdown() {
      if (this.isDropdownOpen) {
        // 닫기
        this.dropdownOpenState = false;
        setTimeout(() => {
          this.isDropdownOpen = false;
        }, 300);
        // 위치 업데이트 리스너 해제
        window.removeEventListener('resize', this.updateDropdownPos);
        window.removeEventListener('scroll', this.updateDropdownPos, true);
      } else {
        // 열기
        this.isDropdownOpen = true;
        this.$nextTick(() => {
          setTimeout(() => {
            this.dropdownOpenState = true;
          }, 10);
          // 열릴 때 위치 계산 및 리스너 등록
          this.updateDropdownPos();
          window.addEventListener('resize', this.updateDropdownPos);
          // 캡처 모드로 스크롤 변경 감지(헤더 내부 스크롤 포함)
          window.addEventListener('scroll', this.updateDropdownPos, true);
        });
      }
    },
    hideMyPage() {
      this.dropdownOpenState = false;
      setTimeout(() => {
        this.isDropdownOpen = false;
      }, 300);
      // 닫힐 때 리스너 해제
      window.removeEventListener('resize', this.updateDropdownPos);
      window.removeEventListener('scroll', this.updateDropdownPos, true);
    },
    checkWindowSize() {
      const width = window.innerWidth
      this.showUserInfoText = width >= 1060
    },
    // 드롭다운을 뷰포트 기준으로 고정 위치로 배치
    updateDropdownPos() {
      if (!this.isDropdownOpen) return;
      const wrap = this.$refs.mypageWrap;
      const anchor = wrap ? wrap.querySelector('.user-name a') : null;
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      const dropdownEl = this.$refs.mypageDropdown;
      const width = dropdownEl ? dropdownEl.offsetWidth : 170;
      const rightMargin = 12; // 우측 여백 유지
      let left = rect.right - width;
      const viewportWidth = window.innerWidth;
      const maxLeft = viewportWidth - width - rightMargin;
      if (left > maxLeft) left = maxLeft;
      if (left < rightMargin) left = rightMargin;
      const top = rect.bottom + 8; // 버튼 아래 간격
      this.dropdownPos = { top, left };
    }
  },
  mounted() {
    document.addEventListener("click", this.handleClickOutside)
    window.addEventListener("resize", this.checkWindowSize)
    this.checkWindowSize()
  },
  beforeDestroy() {
    document.removeEventListener("click", this.handleClickOutside)
    window.removeEventListener("resize", this.checkWindowSize)
    window.removeEventListener('resize', this.updateDropdownPos);
    window.removeEventListener('scroll', this.updateDropdownPos, true);
  }
};
</script>

<style lang="scss" scoped>
  .mypage-wrap {
    width: auto;
    position: relative;
    box-sizing: border-box;
    text-align: right;
    ul { 
      font-size: 0; 
      li {
        display: inline-block;
        vertical-align: middle;
        a {
          display: inline-block;
          font-size: 12px;
        }
      }
    }
    &.variant-alarmplus {
      .user-name {
        a {
          .user-name-text {
            color: #fff;
          }
          .user-type {
            color: #fff;
          }
        }
      }
    }
    .user-name {
      a {
        display: flex;
        align-items: center;
        font-size: 16px;
        font-family: var(--font-body);
        color: #222;
        font-weight: 300;
        line-height: 24px;
        cursor: pointer;
        span {
          font-family: var(--font-body);
        }
        .user-name-text {
          margin-left: 8px;
        }
        .user-type {
          margin-left: 4px;
        }
        .rotate-icon {
          width: 20px !important;
          height: 20px !important;
          transition: transform 0.3s ease;
          image-rendering: auto;
          &.open {
            transform: rotate(180deg);
          }
        }
        .hi-ico {
          padding: 0;
          margin-left: 4px;
        }
      }
      .photo {
        display: inline-block;
        width: 36px;
        height: 36px;
        background-size: cover;
        background-position: center center;
        background-repeat: no-repeat;
        // background: #C4C4C4;
        border: 1px solid transparent;
        border-radius: 50%;
        position: relative;
        overflow: hidden;
        img {
          position: absolute;
          left: 50%;
          top: 50%;
          width: auto;
          min-width: 100%;
          height: 100%;
          transform: translate(-50%, -50%);          
          -webkit-transform: translate(-50%, -50%);
          -o-object-fit: cover;
          object-fit: cover;
          image-rendering: auto;
          border-radius: 50%;
          z-index: 1;
        }
      }
        .dropdown-layer {
        // 헤더 스크롤의 클리핑을 피하기 위해 고정 위치로 변경
        position: fixed;
        min-width: 170px;
        padding: 20px 15px;
        border-radius: 12px;
        border: 1px solid #CCD0D7;
        background: #FFF;
        box-shadow: 1px 1px 2px 0px rgba(0, 0, 0, 0.08), 0px 0px 30px 0px rgba(0, 0, 0, 0.08);
        list-style: none;
        z-index: 10050;
        /* 기본적으로 우측 오프셋을 고정하여 닫힐 때 위치가 변경되지 않도록 함 */
        right: 23px;
        @media (max-width: 780px) {
          right: 8px;
        }
        opacity: 0;
        pointer-events: none;
        transform: translateY(-5px);
        -webkit-transform: translateY(-5px);
        transition: opacity 0.3s ease, transform 0.3s ease, -webkit-transform 0.3s ease;
        top: 62px;
        &.open {
          opacity: 1;
          pointer-events: auto;
          transform: translateY(0);
          -webkit-transform: translateY(0);
        }
        li {
          display: flex;
          height: 34px;
          align-items: center;
          gap: 12px;
          align-self: stretch;
          white-space: nowrap;
          border-radius: 8px;
          transition: background 0.18s cubic-bezier(0.4,0,0.2,1);          
          &:hover,
          &.selected {
            background: #EBEEF4;            
          }
          a {
            display: flex;
            align-items: center;
            color: #000;
            font-family: var(--font-body);
            font-size: 15px;
            font-weight: 500;
            line-height: 24px; 
            padding: 0 8px;
            gap: 12px;
            cursor: pointer;
            .hi-ico {
              display: flex;
              justify-content: center;
              align-items: center;
              gap: 10px;
              aspect-ratio: 1/1;
              border-radius: 38px;
              background: #EBEEF4;
            }
          }
          + li {
            margin-top: 8px;
          }
        }
        .mypage-icon-btn {
          display: inline-block;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #EBEEF4;
          margin-left: 0;
          padding-left: 0;
          overflow: hidden;
          img {
            width: 18px;
            height: 18px;
            object-fit: contain;
            display: block;
            image-rendering: auto;
          }
          .hi-ico {
            display: flex;
            align-items: center;
            justify-content: center;
            vertical-align: middle;
          }
        }
      }
    }
  }
  @media (max-width: 768px) {
    .mypage-wrap  {
      .user-name {
        .photo {
          margin-right: 4px;
        }
      }
    }
  }
</style>
