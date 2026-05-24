<template>
  <div class="side-navi-menu" :class="{ 'is-collapsed': isCollapsed }">
    <!-- 메뉴 축소/확대 버튼 -->
    <div class="menu-btn" @click="toggleCollapse">
      <HiIcon :name="isCollapsed ? 'ico-menu-expand' : 'ico-menu-collapse'" size="20" />
    </div>
    <!-- 상단 고정 배너 -->
    <!-- <div v-if="isTimetableAvailable" class="floating-banner-wrap">
      <div class="floating-banner" @click="showUpdateNoticeModal = true">
        <div class="banner-content">
          <span class="banner-icon">🎉</span>
          <div class="banner-text">
            <span class="text">무료 시간표 프로그램 출시</span>
            <span class="date">12/1 오픈!</span>
          </div>
          <span class="banner-arrow">
            <HiIcon name="ico-next" color="white" size="16" />
          </span>
        </div>
      </div>
    </div> -->
    <!-- 학교 정보 -->
    <div class="class-img">
      <div class="img-wrap" ref="schoolTrigger">
        <HiAvatar
          class="image"
          :class="{ 'cursor-pointer': isCollapsed, active: isAvatarActive }"
          :img="curSchoolImagePath"
          type="school"
          size="lg"
          alt="학교 이미지"
          @click="toggleSchoolPopup"
        />
        <div
          class="class-name"
          ref="container"
          @click.stop="toggleSchoolPopup"
          @mouseenter="isSchoolNameHovered = true"
          @mouseleave="isSchoolNameHovered = false"
          :class="{ open: showSchoolPopup }"
          v-if="!isCollapsed"
        >
          <span class="txt">{{ selectedSchool?.schoolName }}</span>
          <HiIcon
            :name="(isSchoolNameHovered || showSchoolPopup) ? 'ico-down-circle-fill' : 'ico-down-circle'"
            color="black"
            size="20"
            class="ico-down-circle"
          />
        </div>
        <div class="school-popup" v-show="showSchoolPopup" :class="{ 'popup-right': isCollapsed, 'popup-below': !isCollapsed, 'open': schoolPopupOpen, 'noTransition': noTransition }" ref="schoolPopup">
          <ul class="school-list">
            <li v-for="(school, index) in alarmPlusSchools" :key="`school-${school.schoolId}-${index}`" class="school-name-item" @click="onSelectSchool(school)">
              <span class="school-name-text">{{ school.schoolName }}</span>
            </li>
          </ul>
          <div class="school-add-wrap">
            <HiButton color="primary" class="school-add-btn" size="sm" bitrounded @click="onClickAppendSchool">
              <HiIcon name="ico-plus" color="white" size="16" />
              학교 추가하기
            </HiButton>
          </div>
        </div>
      </div>
    </div>

    <!-- 메뉴 목록 -->
    <ul class="menu-list">
      <li
        v-for="(key, index) in Object.keys(openMenu).filter((k) => k !== 'more' && !hiddenMenus.includes(k))"
        :key="key"
        class="menu-item"
        :class="{
          'is-open': isCollapsed && collapsedSubmenuKey === key,
          'active': isCollapsed && !isSettingActive && getSubmenuItems(key).some(item => item.name === activeSubmenu || item.value === activeSubmenu)
        }"
      >
        <div class="menu-title" @click="isCollapsed ? toggleCollapsedSubmenu(key, index, $event) : toggleMenu(key)">
          <div class="menu-text">
            <img class="menu-icon" :src="getMenuIconSrc(key)" :alt="getMenuLabel(key)" />
            <span>{{ getMenuLabel(key) }}</span>
          </div>
          <div class="menu-arrow-wrap" v-if="!isCollapsed">
            <HiIcon name="ico-down" size="24" class="menu-arrow" :class="{ rotated: openMenu[key] }" />
          </div>
        </div>

        <ul v-if="openMenu[key] && !isCollapsed" class="submenu">
          <li
            v-for="item in getSubmenuItems(key)"
            v-show="!item.masterOnly || (item.masterOnly && isMaster)"
            :key="item.name"
            class="submenu-item"
            :class="{ active: activeSubmenu === item.name || activeSubmenu === item.value }"
            @click="setActiveSubmenu(item.value)"
          >
            <span>{{ item.label }}</span>
            <div
              v-if="item.badge"
              class="new-badge"
              :ref="'badgeLottie_' + item.name"
            />
            <!-- 뱃지 추가 -->
            <div
              v-if="getNumberBadgeCount(key, item) > 0"
              class="number-badge"
            >{{ getNumberBadgeCount(key, item) }}</div>
          </li>
        </ul>
      </li>      
    </ul>
    <!-- 축소 상태에서 클릭해서 나타나는 우측 팝업 서브메뉴 -->
    <div v-if="isCollapsed && collapsedSubmenuKey" class="submenu-popup" :class="{ open: submenuOpen }" :style="{ top: submenuPopupTop + 'px' }">
      <ul class="submenu category" v-if="collapsedSubmenuKey === 'more'">
        <li v-for="category in getSubmenuItems('more')" :key="category.category">
          <div class="submenu-category">
            <img
              :src="getStaticIcon(category.icon)"
              alt=""
            />
            <span>{{ category.category }}</span>
          </div>
          <ul>
            <li
              v-for="item in category.items"
              :key="item.name"
              class="submenu-item"
              :class="{ active: activeSubmenu === item.name }"
              v-show="!item.masterOnly || (item.masterOnly && isMaster)"
              @click="
                setActiveSubmenu(item.value);
                closeCollapsedSubmenu();
              "
            >
              <span>{{ getTrimmedLabel(item.label) }}</span>
            </li>
          </ul>
        </li>
      </ul>
      <ul class="submenu" v-else>
        <li
          v-for="item in getSubmenuItems(collapsedSubmenuKey)"
          v-show="!item.masterOnly || (item.masterOnly && isMaster)"
          :key="item.name"
          class="submenu-item"          
          :class="{ active: activeSubmenu === item.name }"
          @click="
            setActiveSubmenu(item.value);
            closeCollapsedSubmenu();
          "
        >
          <span>{{ item.label }}</span>
        </li>
      </ul>
    </div>
    <!-- 하단 카드 -->
    <div class="side-bottom-cards" v-if="!isCollapsed">
      <!-- 기존 카드 (펼침 상태) -->
      <div v-if="isTimetableAvailable" class="bottom-card timetable" @click="showUpdateNoticeModal = true">
        <div class="timetable-content">
          <span class="badge-free">무료</span>
          <span class="main-text">시간표 주요 기능</span>
        </div>
        <span class="arrow-btn"><HiIcon name="ico-next" size="14" /></span>
      </div>
      <router-link to="/help/question?isWrite=true&category=학교알리미">
        <div class="bottom-card consult">
          <div class="consult-content">
            <div class="main-row">
              <span class="main-text">학교알리미 문의</span>
            </div>
            <div class="sub-row">
              <HiIcon name="ico-tel" color="primary" size="18" />
              <span class="tel">1811-0919</span>
            </div>
          </div>
          <span class="arrow-btn"><HiIcon name="ico-next" size="14" /></span>
        </div>
      </router-link>
    </div>
    <!-- collapsed 상태: 아이콘+텍스트만 세로 중앙 정렬 -->
    <div class="side-bottom-cards collapsed" v-else>
      <div
        v-if="isTimetableAvailable"
        class="collapsed-bottom-card"
        @mouseenter="isTimetableHovered = true"
        @mouseleave="isTimetableHovered = false"
        @click="showUpdateNoticeModal = true"
      >
        <img
          :src="getStaticIcon(isTimetableHovered ? 'ico-calendar-week-active' : 'ico-calendar-week')"
          alt="시간표 주요 기능"
          width="30"
          height="30"
        />
        <div class="collapsed-label">시간표<br />주요 기능</div>
      </div>
      <router-link to="/help/question?isWrite=true&category=학교알리미">
        <div class="collapsed-bottom-card">
          <div class="inquiry-btn">
            <HiIcon name="ico-contact-fill" color="white" size="20" />
          </div>
          <div class="collapsed-label inquiry">문의</div>
        </div>
      </router-link>
    </div>
    <!-- <div class="bottom-menu">       -->
      <!-- 설정하기 -->
      <!-- <div class="menu setting-menu" :class="{ active: isSettingActive && (isCollapsed || !isCollapsed) }" @click="onClickSetting">
        <div class="menu-area">
          <img class="menu-icon" :src="getStaticIcon('ico-setting3-fill')" alt="설정하기" />
          <span>설정하기</span>
        </div>
      </div> -->
      <!-- 더보기 (collapsed 상태에서만 표시) -->
      <!-- <div
        class="menu more-menu"
        v-if="isCollapsed"
        @click="toggleMoreMenu"
        :class="{ active: isMoreMenuOpen }"
      >
        <div class="menu-area">
          <HiIcon name="ico-more-fill" size="24" />
          <span>더보기</span>
        </div>
      </div> -->

      <!-- 더보기 메뉴 -->
      <!-- <div class="more-menu-popup" v-if="isMoreMenuOpen">
        <ul class="more-menu-list">
          <li
            v-for="category in categories"
            :key="category.name"
            class="more-menu-category"
          >
            <div class="more-menu-txt">
              <HiIcon name="ico-school-mng-fill" color="default" :size="isCollapsed ? '24' : '18'" />
              <span class="more-menu-category-label">{{ category.label }}</span>
            </div>
            <ul class="more-menu-sublist">
              <li
                v-for="item in category.items"
                :key="item.name"
                class="more-menu-subitem"
                :class="{ active: activeSubmenu === item.name }"
                @click="activeSubmenu = item.name"
              >
                <span class="more-menu-subitem-label">{{ item.label }}</span>
              </li>
            </ul>
          </li>
        </ul>
      </div> -->
    <!-- </div> -->
    <!-- 학교알리미 상담 -->
    <!-- <div class="teacher-list-wrap">
      <div class="teacher-list" v-if="!isCollapsed">
        <div class="faq-wrap">
          <span class="title">학교알리미 상담</span>
          <span class="sub">궁금한 점은 바로 문의해 보세요!</span>
          <router-link to="/help/question?isWrite=true&category=학교알리미">
            <HiButton color="primary" class="faq-btn" size="sm">
              <span>문의하기</span>
              <HiIcon name="ico-next" color="white" size="16" />
            </HiButton>
          </router-link>
        </div>
        <div class="tel-wrap">
          <div class="tel-num">
            <HiIcon name="ico-tel" color="primary" size="20" />
            <span class="tel">1811-0910</span>
          </div>
          <ul class="time-list">
            <li class="time-item">평일 09:00 ~ 18:00</li>
            <li class="time-item">점심시간 12:00 ~ 13:00</li>
          </ul>
        </div>
      </div>
    </div> -->
    <!-- 작아졌을때 문의 -->
    <!-- <router-link to="/help/question?isWrite=true&category=학교알리미">
      <div class="inquiry" v-if="isCollapsed">
        <div class="inquiry-wrap">
          <div class="inquiry-btn">
            <HiIcon name="ico-contact-fill" color="white" size="48" />
          </div>
          <span class="inquiry-tit">문의</span>
        </div>
      </div>
    </router-link> -->
    <UpdateNoticeModal
      v-if="isTimetableAvailable && showUpdateNoticeModal"
      :isOpen="showUpdateNoticeModal"
      :isMaster="isMaster"
      @close="showUpdateNoticeModal = false"
      @goSchoolTimetable="setActiveSubmenu('school-timetable')"
    />
  </div>
</template>

<script>
import { Timetables } from '@/apis/Timetables';
import UpdateNoticeModal from '../popup/UpdateNoticeModal.vue';
import { useHiClassApi } from '../timetable/composables/hiClassApi';
import lottie from 'lottie-web';
import badgeNew from '@/assets/img/lottie/badge_new.json';
import { mapState } from 'vuex';
import { TimetableLessonChangeType } from '../timetable/core/types';
import { TIMETABLE_EVENTS } from '@/apps/timetable/common/events';

export default {
  name: 'MainNavigationMenu',
  props: {
    isCollapsed: {
      type: Boolean,
      default: false,
    },
    selectedSchoolId: {
      type: String,
      default: null
    },
    activeSubmenu: {
      type: String,
      default: 'school-post'
    }
  },
  setup() {
    const hiClassApi = useHiClassApi();
    return { hiClassApi };
  },
  watch: {
    alarmPlusSchools: {
      handler(newSchools) {
        this.setSelectedSchool();
      },
      immediate: true,
    },
    selectedSchoolId(newVal) {
      this.setSelectedSchool();
      this.checkTimetableAccess();
      this.fetchLessonChangeRequestCount();
    },
    isCollapsed(val) {
      if (!val) {
        this.isMoreMenuOpen = false;
        this.activeMoreMenuItem = null;
        Object.keys(this.badgeLottieInstances).forEach((key) => {
          this.badgeLottieInstances[key].destroy();
          delete this.badgeLottieInstances[key];
        });
        // 두 번의 nextTick으로 DOM 완전 렌더 후 Lottie 재생성
        this.$nextTick(() => {
          this.$nextTick(() => {
            Object.keys(this.openMenu).forEach((key) => {
              this.getSubmenuItems(key).forEach((item) => {
                if (item.badge) {
                  if (this.badgeLottieInstances[item.name]) {
                    this.badgeLottieInstances[item.name].destroy();
                    delete this.badgeLottieInstances[item.name];
                  }
                  this.renderBadgeLottie(item.name);
                }
              });
            });
          });
        });
      }
    }
  },
  computed: {
    ...mapState('storeSchool', ['alarmPlusSchools', 'textAuthorities']),
    curSchoolImagePath() {
      return this.selectedSchool && this.selectedSchool.schoolImagePath
        ? this.selectedSchool.schoolImagePath
        : null;
    },
    isTimetableAvailable() {
      if(!this.selectedSchool) {
        return false;
      }

      // 유치원, 초등학교 제한
      const { schoolType } = this.selectedSchool || {};
      const deniedTypes = ['KINDERGARTEN', 'ELEMENTARY'];

      if(!schoolType || deniedTypes.includes(schoolType)) {
        return false;
      }
      return true;

      /*
      // ----------------------------------------------
      // 2025.11.28 금요일 배포시 이하 코드 제거
      const allowedHostnames = [
        'devui.hiclass.net',
        'stage.hiclass.net',
        'localhost',
      ];

      const hostname = window.location.hostname;
      if(allowedHostnames.includes(hostname)) {
        // dev/stage/localhost 환경에서는 모든 학교 허용
        return true;
      }
      
      //  dev/stage는 모든 학교 오픈, 유치/초등 제한 설정
      // 허용학교가 없으면 전체 허용: 허용학교에 포함되어있으면 타입과 상관없이 허용
      const allowdSchoolIds = [
        '028c5bcb-d43a-11e9-86da-98be94437cd2', // 경기시공초등학교
        '0ddbc7d9-d43a-11e9-86da-98be94437cd2', // 서울시공초등분교
        '3e6ec4d2-65fc-413e-adc3-232aaec36fc9', // 시범고등학교
        'cdaf4a3d-5426-4994-9cf2-65cfd8c97323', // 시범중학교
        // '0a51c6a0-d43a-11e9-86da-98be94437cd2', // 시공기술학교: 테스트
      ];

      const isAllowedSchool = allowdSchoolIds.includes(this.selectedSchool.schoolId);
      if(isAllowedSchool === true) {
        return true;
      }

      return false;
      // ----------------------------------------------
      */
    },
  },
  components: { 
    UpdateNoticeModal
  },
  data() {
    return {
      badgeLottieInstances: {},
      submenuOpen: false,
      submenuCloseTimeout: null,
      hiddenMenus: ['admin'], // 시간표 메뉴 숨김
      isSettingActive: false,
      openMenu: {
        members: true,
        school: true,
        admin: true,
        text: true,
        setting: true,
        more: true
      },
      showSchoolPopup: false,
      noTransition: false,
      schoolPopupOpen: false,
      showUpdateNoticeModal: false,
      collapsedSubmenuKey: 'school',
      submenuPopupTop: 0,
      isMoreMenuOpen: false,
      activeMoreMenuItem: null,
      activeMoreMenuIndex: null,
      isAvatarActive: false,
      isMaster: false,
      selectedSchool: null,
      isTimetableHovered: false,
      isSchoolNameHovered: false,
      numberBadgeCounts: {
        'admin': {
          'school-timetable': 0,
        },
      },
    };
  },
  mounted() {
    this.$nextTick(() => {
      Object.keys(this.openMenu).forEach((key) => {
        this.getSubmenuItems(key).forEach((item) => {
          if (item.badge) {
            this.renderBadgeLottie(item.name);
          }
        });
      });
    });
    window.addEventListener('message', this.handleIframeMessage);
    window.addEventListener(TIMETABLE_EVENTS.LESSON_CHANGE_REQUEST_COUNT_REFRESH, this.handleLessonChangeRequestCountRefresh);
    document.addEventListener('click', this.handleClickOutside);
    this.handleWindowBlur = () => {
      this.closeSchoolPopup();
      this.closeCollapsedSubmenu();
    };
    window.addEventListener('blur', this.handleWindowBlur);
    document.addEventListener('click', this.handleClickOutsideMoreMenu);

    if (this.isiPad()) {
      document.body.classList.add('ios');
    }

    this.setSelectedSchool();
    this.checkTimetableAccess();

    this.showUpdateNoticeIfNeeded();
    this.fetchLessonChangeRequestCount();
  },
  updated() {
    this.$nextTick(() => {
      this.$nextTick(() => {
        Object.keys(this.openMenu).forEach((key) => {
          this.getSubmenuItems(key).forEach((item) => {
            if (item.badge) {
              if (this.badgeLottieInstances[item.name]) {
                this.badgeLottieInstances[item.name].destroy();
                delete this.badgeLottieInstances[item.name];
              }
              this.renderBadgeLottie(item.name);
            }
          });
        });
      });
    });
  },
  beforeDestroy() {
    window.removeEventListener('message', this.handleIframeMessage);
    window.removeEventListener(TIMETABLE_EVENTS.LESSON_CHANGE_REQUEST_COUNT_REFRESH, this.handleLessonChangeRequestCountRefresh);
    document.removeEventListener('click', this.handleClickOutside);
    window.removeEventListener('blur', this.handleWindowBlur);
    document.removeEventListener('click', this.handleClickOutsideMoreMenu);
  },
  methods: {
    getNumberBadgeKey(item) {
      return item.value || item.name;
    },
    getNumberBadgeCount(menuKey, item) {
      const badgeKey = this.getNumberBadgeKey(item);
      return this.numberBadgeCounts?.[menuKey]?.[badgeKey] || 0;
    },
    getBadgeLottieRef(name) {
      return `badgeLottie_${name}`;
    },
    renderBadgeLottie(name) {
      // 이미 렌더링된 경우 중복 방지
      if (this.badgeLottieInstances[name]) return;
      const container = this.$refs[`badgeLottie_${name}`];
      if (container && container.length) {
        this.badgeLottieInstances[name] = lottie.loadAnimation({
          container: container[0],
          renderer: 'svg',
          loop: false, // 반복 X
          autoplay: true,
          animationData: badgeNew,
        });
      } else if (container) {
        this.badgeLottieInstances[name] = lottie.loadAnimation({
          container,
          renderer: 'svg',
          loop: false, // 반복 X
          autoplay: true,
          animationData: badgeNew,
        });
      }
    },
    getStaticIcon(name) {
      try {
        return require(`@/assets/img/svg/${name}.svg`);
      } catch (e) {
        return '';
      }
    },
    getMenuIconSrc(key) {
      const name = (
        {
          members: 'ico-member-mng-fill',
          school: 'ico-school-mng-fill',
          admin: 'ico-admin-mng-fill',
          text: 'ico-text-mng-fill',
          setting: 'ico-setting3-fill',
          more: 'ico-more-fill-color',
        }[key] || 'ico-menu'
      );
      return this.getStaticIcon(name);
    },
    isActiveSubmenuInMenu(menuKey) {
      const submenuItems = this.getSubmenuItems(menuKey);
      return submenuItems.some((item) => item.name === this.activeSubmenu || item.value === this.activeSubmenu);
    },
    toggleMenu(menuKey) {
      this.openMenu[menuKey] = !this.openMenu[menuKey];
    },
    toggleCollapse() {
      this.noTransition = true;
      window.setTimeout(() => { this.noTransition = false; }, 360);

      this.$emit('update:isCollapsed', !this.isCollapsed);
      this.collapsedSubmenuKey = null;
    },
    setActiveSubmenu(value, schoolId = null) {
      if (value === 'text-send') {
        const textAuthority = this.textAuthorities.find(t => t.schoolId === this.selectedSchool.schoolId);
        if (textAuthority) {
          this.$router.push(`/main/text/school/${textAuthority.schoolId}/send`);
          return;
        }
        this.$hiClass.alert(`'${this.selectedSchool.schoolName}' 문자서비스 사용 권한이 없습니다.<br>관리자에게 문의해주세요.`)
        return;
      }

      if (value === 'school-timetable') {
        this.fetchLessonChangeRequestCount();
      }

      console.log(`setActiveSubmenu called with value: ${value}, schoolId: ${schoolId}`);

      const route = value === 'append-school' ?
        `/main/alarmplus/append-school` :
        `/main/alarmplus/schools/${schoolId || this.selectedSchool.schoolId}/${value}`;
      this.$router.push(route);
    },
    closeSchoolPopup() {
      if (!this.showSchoolPopup) return;
      this.schoolPopupOpen = false;
      setTimeout(() => {
        this.showSchoolPopup = false;
        this.isAvatarActive = false;
      }, 300);
    },
    toggleSchoolPopup() {
      if (this.showSchoolPopup) {
        this.closeSchoolPopup();
      } else {
        // 열기
        this.showSchoolPopup = true;
        this.isAvatarActive = true;
        this.$nextTick(() => {
          setTimeout(() => {
            this.schoolPopupOpen = true;
          }, 10);
        });
      }
    },
    toggleCollapsedSubmenu(key, index, $event) {
      // 설정 메뉴가 활성화된 상태면 해제
      if (this.isSettingActive) {
        this.isSettingActive = false;
      }

      // 같은 메뉴 클릭 시: 닫기
      if (this.collapsedSubmenuKey === key && this.submenuOpen) {
        this.closeCollapsedSubmenu();
        return;
      }

      if (this.submenuOpen && this.collapsedSubmenuKey !== key) {
        this.submenuOpen = false;
        clearTimeout(this.submenuCloseTimeout);
        let menuItem = $event?.currentTarget?.closest('.menu-item');
        if (!menuItem) return;
        const rect = menuItem.getBoundingClientRect();
        // 변경: .side-navi-menu 기준으로 위치 계산
        const sidebarRect = this.$el.getBoundingClientRect();
        let top = rect.top - sidebarRect.top;
        this.submenuCloseTimeout = setTimeout(() => {
          this.collapsedSubmenuKey = key;
          this.submenuPopupTop = top;
          this.$nextTick(() => {
            this.submenuOpen = true;
          });
        }, 300);
      } else {
        this.openSubmenuAtKey(key, $event);
      }
    },
    openSubmenuAtKey(key, $event) {
      let menuItem = $event?.currentTarget?.closest('.menu-item');
      if (!menuItem) return;
      const rect = menuItem.getBoundingClientRect();
      // 변경: .side-navi-menu 기준으로 위치 계산
      const sidebarRect = this.$el.getBoundingClientRect();
      let top = rect.top - sidebarRect.top;

      this.collapsedSubmenuKey = key;
      this.submenuPopupTop = top;
      this.$nextTick(() => {
        setTimeout(() => {
          this.submenuOpen = true;
        }, 10);
      });
    },
    closeCollapsedSubmenu() {
      this.submenuOpen = false;
      clearTimeout(this.submenuCloseTimeout);
      this.submenuCloseTimeout = setTimeout(() => {
        this.collapsedSubmenuKey = null;
      }, 200);
    },
    getSubmenuItems(menuKey) {
      const submenuMap = {
        members: [
          { name: '교직원 관리', label: '교직원 관리', value: 'teacher-list' },
          { name: '학급 관리', label: '학급 관리', value: 'student-list' },
        ],
        school: [{ name: '게시물 발행', label: '게시물 발행', value: 'school-post' }],
        admin: [
          { name: '전체 시간표 관리', label: '전체 시간표 관리', value: 'school-timetable', masterOnly: true },
          { name: '내 시간표 관리', label: '내 시간표 관리', value: 'my-timetable', masterOnly: false },
        ],
        text: [
          { name: '문자 발송', label: '문자 발송', value: 'text-send', badge: 'NEW'}
        ],
        setting: [
          { name: '게시물 연동 여부', label: '게시물 연동 여부', value: 'post-link' }
        ],
        more: [
          {
            category: '카테고리명',
            icon: 'ico-school-mng-fill',
            items: [
              { name: 'cat1-item1', label: '메뉴명 메뉴명', value: 'cat1-item1' },
              { name: 'cat1-item2', label: '메뉴명 메뉴명', value: 'cat1-item2' }
            ]
          },
          {
            category: '카테고리명',
            icon: 'ico-school-mng-fill',
            items: [
              { name: 'cat2-item1', label: '메뉴명 메뉴명', value: 'cat2-item1' },
              { name: 'cat2-item2', label: '메뉴명 메뉴명', value: 'cat2-item2' }
            ]
          }
        ],
      };
      return submenuMap[menuKey] || [];
    },
    getMenuLabel(key) {
      return (
        {
          members: '구성원',
          school: '게시물',
          admin: '시간표',
          text: '문자',
          setting: '설정',
          more: '더보기'
        }[key] || key
      );
    },
    getTrimmedLabel(label) {
      // 한글, 영문, 숫자만 카운트
      let count = 0;
      let result = '';
      for (let char of label) {
        if (/[A-Za-z0-9가-힣]/.test(char)) {
          count++;
        }
        result += char;
        if (count >= 9) break;
      }
      // 9글자 초과면 ... 붙이기
      // (공백/특수문자 제외 9글자 이후에도 원본 문자열이 남아있으면)
      const pure = label.replace(/[^A-Za-z0-9가-힣]/g, '');
      if (pure.length > 9) {
        return result + '…';
      }
      return result;
    },
    handleClickOutsideMoreMenu(e) {
      const popup = this.$el.querySelector('.more-menu-popup');
      const moreMenuBtn = this.$el.querySelector('.more-menu');
      if (this.isMoreMenuOpen && popup && !popup.contains(e.target) && !moreMenuBtn.contains(e.target)) {
        this.closeMoreMenu();
      }
    },
    handleIframeMessage(event) {
      if (event.data?.type === 'iframeClick') {
        this.closeSchoolPopup();
        
        // submenu-popup도 닫기
        if (this.submenuOpen) {
          this.closeCollapsedSubmenu();
        }
      }
    },
    handleLessonChangeRequestCountRefresh() {
      this.fetchLessonChangeRequestCount();
    },
    handleClickOutside(e) {
      const popup = this.$refs.schoolPopup;
      const trigger = this.$refs.schoolTrigger;
      const menuBtn = this.$el.querySelector('.menu-btn');

      if (this.showSchoolPopup && popup && !popup.contains(e.target) && trigger && !trigger.contains(e.target)) {
        // 접기/펴기 버튼 클릭 시엔 팝업 유지
        if (menuBtn && menuBtn.contains(e.target)) return;
        this.closeSchoolPopup();
      }
      
      // submenu-popup 외부 클릭 시 닫기
      if (this.submenuOpen) {
        const submenuPopup = this.$el.querySelector('.submenu-popup');
        // submenu-popup 내부 클릭이면 무시
        if (submenuPopup && submenuPopup.contains(e.target)) {
          return;
        }
        // 그 외 모든 외부 클릭 시 닫기
        this.closeCollapsedSubmenu();
      }
      // if (this.isSettingActive) {
      //   const settingMenuArea = this.$el.querySelector('.setting-menu .menu-area');
      //   if (settingMenuArea && !settingMenuArea.contains(e.target)) {
      //     this.isSettingActive = false;
      //   }
      // }
    },
    toggleMoreMenu() {
      this.isMoreMenuOpen = !this.isMoreMenuOpen;
      if (this.isMoreMenuOpen) {
        this.collapsedSubmenuKey = null;
      }
    },
    closeMoreMenu() {
      this.isMoreMenuOpen = false;
    },
    setActiveMoreMenu(index) {
      this.activeMoreMenuIndex = index;
    },
    onClickMoreMenu() {
      this.isMoreMenuOpen = !this.isMoreMenuOpen;
    },
    handleMenuResize(newWidth) {
      if (newWidth > 100) {
        this.isMoreMenuOpen = false;
        this.activeMoreMenuItem = null;
      }
    },
    isiPad() {
      const ua = navigator.userAgent;
      const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
      const isMacTouchDevice = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
      return (isIOS && /iPad/.test(ua)) || isMacTouchDevice;
    },
    removeTimetableMenu() {
      if (!this.hiddenMenus.includes('admin')) {
        this.hiddenMenus.push('admin');
      }
    },
    addTimetableMenu() {
      const index = this.hiddenMenus.indexOf('admin');
      if (index !== -1) {
        this.hiddenMenus.splice(index, 1);
      }
    },

    async checkTimetableAccess() {
      if(!this.selectedSchool || !this.selectedSchool.schoolId) {
        this.removeTimetableMenu();
        return;
      }

      try {
        const api = new Timetables();
        const result = await api.getTimetableSchoolRoleRole(this.selectedSchool.schoolId);

        const { isEditor, isTeacher } = result.data || {};
        this.isMaster = isEditor;

        if ((isEditor || isTeacher) && 
          this.isTimetableAvailable) {
          this.addTimetableMenu(this.isMaster);
          this.fetchLessonChangeRequestCount();
          return;
        }

        this.removeTimetableMenu();
      }
      catch (error) {
        console.error('Error checking timetable access:', error);
        this.removeTimetableMenu();
        return false;
      }
    },
    onSelectSchool(school) {
      this.showSchoolPopup = false;
      this.isAvatarActive = false;
      this.setActiveSubmenu('school-post', school.schoolId);
    },
    onClickAppendSchool() {
      this.showSchoolPopup = false;
      this.isAvatarActive = false;
      this.setActiveSubmenu('append-school');
    },
    setSelectedSchool() {
      this.selectedSchool = this.alarmPlusSchools.find(s => s.schoolId === this.selectedSchoolId) || null;
    },
    showUpdateNoticeIfNeeded() {
      const lastShownDate = parseInt(localStorage.getItem('alarmPlusUpdateModal') || '0', 10);
      const today = this.$moment().startOf('day').valueOf();

      if (today > lastShownDate) {
        this.showUpdateNoticeModal = true;
        localStorage.setItem('alarmPlusUpdateModal', today);
      }
    },
    async fetchLessonChangeRequestCount() {
      if (!this.selectedSchool || !this.isMaster) {
        return;
      }

      try {
        const api = new Timetables();
        const response = await api.getRequestedLessonChangesCountOfSchoolPending(this.selectedSchool.schoolId, { changeType: TimetableLessonChangeType.Lesson});

        const { requestCount } = response.data;
        const adminBadgeCounts = {
          ...(this.numberBadgeCounts.admin || {}),
          'school-timetable': requestCount || 0,
        };
        this.$set(this.numberBadgeCounts, 'admin', adminBadgeCounts);
      } catch (error) {
        console.error('시간표 변경 요청 수 불러오기 실패:', error);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.side-navi-menu {
  position: relative;
  width: 240px;
  height: calc(100vh - 65px);
  border-right: 1px solid rgba(0, 0, 0, 0.10);
  background-color: #EBEEF4;
  color: #000;
  transition: width 0.3s ease;
  flex: 0 0 auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-height: 0;
  .hi-ico {
    border: 0;
    padding: 0;
  }
  // @media (min-width: 1340px) {
  //   .is-collapsed {
  //     .inquiry {
  //       .inquiry-wrap {
  //         height: 55px;
  //       }
  //     }
  //   }
  // }
  &.is-collapsed {
    width: 80px;
    .class-name {
      display: none;
    }
    .class-img {
      display: flex;
      height: 148px;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      box-sizing: border-box;
      .img-wrap {
        padding: 60px 0 22px 0;
        .avatar-img {
          padding: 7px;
          &.lg {
            min-width: 64px;
            min-height: 64px;
            width: 64px;
            height: 64px;
            ::v-deep .img-area {
              width: 50px;
              height: 50px;
              transition: transform 0.18s cubic-bezier(0.4,0,0.2,1);
            }
            &:hover {
              ::v-deep .img-area {
                transform: scale(1.08);
              }
            }
            &:active {
              ::v-deep .img-area {
                transform: scale(1);
              }
            }
          }
        }
        .image {
          &.active {
            border-radius: 8px;
            background: rgba(143, 167, 219, 0.2);
            &:active {
              ::v-deep .img-area {
                transform: scale(1);
              }
            }
          }
        }
      }
    }
    .menu-list {
      position: relative;
      display: flex;
      padding: 10px 8px;
      flex-direction: column;
      align-items: center;
      gap: 15px 0;
      .menu-item {
        display: flex;
        min-height: 64px;
        min-width: 64px;
        height: 64px;
        width: 64px;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding-left: 0;
        .menu-title {
          display: flex;
          justify-content: center;
          gap: 4px 0;
          .menu-text {
            gap: 3px;
            flex-direction: column;
            display: flex;
            align-items: center;
            transition: transform 0.15s ease-in-out;
            transform: translateZ(0);
            transform-origin: center center;
            > span {
              color: #000;
              font-size: 13px;
              line-height: 150%;
              font-weight: 500;
              white-space: nowrap;
            }
            img {
              width: 24px;
              height: 24px;
            }
          }
          .menu-arrow {
            display: none;
          }
        }
        &:hover{
          background: rgba(99, 131, 202, 0.15);
          .menu-title {
            .menu-text {
              transform: translateZ(0) scale(1.08);
              span{
                font-weight: var(--font-weight-medium);
              }
            }
          }
        }
        &.active {
          border-radius: 8px;
          background: rgba(99, 131, 202, 0.15);
          &:active {  
            .menu-title {
              .menu-text {
                transform: translateZ(0) scale(1);
                span {
                  font-weight: var(--font-weight-medium);
                  font-size: 13px;
                  line-height: 150%;
                }
                img {
                  width: 24px;
                  height: 24px;
                }
              }
            }
          }
          .menu-text {
            span {
              font-size: 13px;
              line-height: 150%;
              font-weight: var(--font-weight-medium);
            }
            img {
              width: 24px;
              height: 24px;
            }
          }
        }
        &.is-open {
          border-radius: 8px;
          background: rgba(99, 131, 202, 0.15);
        }
      }
    }
    
    .floating-banner-wrap {
      padding: 10px 8px 0 8px;
      .floating-banner {
        padding: 19px 10px;
        .banner-content {
          gap: 0;
          justify-content: center;
          .banner-icon {
            font-size: 24px;
          }
          .banner-text {
            display: none;
          }
          .banner-arrow {
            display: none;
          }
        }   
      }         
    }
    .menu-btn {
      right: -8px;
      top: 10px;
    }
  }
  .menu-btn {
    position: absolute;    
    display: flex;
    width: 28px;
    height: 28px;
    right: 10px;
    top: 10px;
    justify-content: center;
    align-items: center;
    aspect-ratio: 1/1;
    border-radius: 8px;
    border: 1px solid #4267B2;
    background: #fff;
    z-index: 1;
    transition: background 0.18s cubic-bezier(0.4,0,0.2,1), border 0.18s cubic-bezier(0.4,0,0.2,1);
    cursor: pointer;
    &:hover {
      background: #4778DE;
      .hi-ico {
        &::after {
          background-color: #fff !important;
        }
      }
    }
    .hi-ico {
      &::after {
        background-color: #4778DE !important;
      }
    }
  }
  .class-img {
    height: 146px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    box-sizing: border-box;
    .img-wrap {
      position: relative;
      display: flex;
      align-items: center;
      flex-direction: column;
      padding: 40px 0 14px 0;
      gap: 10px;
      ::v-deep .avatar-img {
        &.lg {
          min-width: 56px;
          min-height: 56px;
          width: 56px;
          height: 56px;
        }
      }
      .image {
        cursor: default;
        &.cursor-pointer {
          cursor: pointer;
        }
      }
      .class-name {
        display: flex;
        align-items: center;
        gap: 4px;
        cursor: pointer;
        .txt {
          font-family: var(--font-body);
          font-size: 18px;
          font-weight: 600;
          padding-left: 8px;
          line-height: 144%;
          letter-spacing: -0.5px;
        }
        .hi-ico {
          transition: transform 0.3s ease;
        }
        .ico-down-circle {
          width: 20px;
          height: 20px;
        }
        &.open {
          .hi-ico {
            transform: rotate(180deg);
          }
        }
      }
      .school-popup {
        position: absolute;
        /* 팝업이 뷰포트를 넘지 않도록 전체 최대 높이 지정 */
        max-height: calc(100vh - 32px);
        top: 142px;
        width: 210px;
        padding: 12px 6px 12px 12px;
        border-radius: 12px;
        border: 1px solid #ccd0d7;
        background: #fff;
        box-shadow:
          1px 1px 2px 0px rgba(0, 0, 0, 0.08),
          0px 0px 30px 0px rgba(0, 0, 0, 0.08);
        z-index: 7;
        .school-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
          max-height: 329px;
          overflow-y: auto;
          padding-right: 6px;
          flex: 1 1 auto;
          min-height: 0;
          box-sizing: content-box;
          &::-webkit-scrollbar {
            width: 4px;
            height: 10px;
          }
          &::-webkit-scrollbar-thumb {
            background: rgba(0, 0, 0, 0.20);
            border-radius: 10px;
          }
          &::-webkit-scrollbar-track {
            background-color: transparent;
          }
          .school-name-item {
            /* 항목이 줄어들지 않도록 축소 금지 */
            flex: 0 0 auto;
            display: flex;
            width: 100%;
            box-sizing: border-box;
            max-width: 100%;
            height: 34px;
            padding: 0px 10px 0px 15px;
            border-radius: 8px;
            align-items: center;
            color: #1d1d1d;
            font-family: var(--font-body);
            font-size: 14px;
            font-weight: 400;
            line-height: 22px;
            cursor: pointer;
            &:hover {
              font-weight: 500;
              background: #ebeef4;
            }
            &.active {
              font-weight: 500;
              background: #ebeef4;
            }
            .school-name-text {
              flex: 1;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
          }
        }
        .school-add-wrap {
          display: flex;
          gap: 4px;
          width: 100%;
          margin-top: 8px;
          padding-right: 6px;
          .school-add-btn {
            display: flex;
            align-items: center;
            height: 32px;
            width: 100%;
            padding: 0px 16px 0px 14px;
            justify-content: center;
            align-items: center;
            border-radius: 8px;
            border: 1px solid rgba(71, 120, 222, 0.4);
            background: var(--primary);
            gap: 4px;
            &:hover,
            &:active {
              background: linear-gradient(0deg, rgba(0, 0, 0, 0.16) 0%, rgba(0, 0, 0, 0.16) 100%), var(--primary);
            }
          }
        }
        &.popup-right {
          top: 60px;
          left: 75px;
          opacity: 0 !important;
          pointer-events: none !important;
          transform: translateX(-10px) !important;
          transition:
            opacity 0.3s ease,
            transform 0.3s ease;
          &.open {
            opacity: 1 !important;
            pointer-events: auto !important;
            transform: translateX(0) !important;
          }
        }
        &.popup-below {
          top: calc(100% - 6px);
          left: 50%;
          transform: translateX(-50%);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.25s ease;
          &.open {
            opacity: 1;
            pointer-events: auto;
          }
        }
      }
    }
  }
  .menu-list {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    flex-direction: column;
    list-style: none;
    padding: 16px 16px 16px 24px;
    margin: 0;
    white-space: nowrap;
    flex: 1 1 auto;
    overflow-y: auto;
    overflow-x: hidden;
    min-height: 0;
    &::-webkit-scrollbar {
      height: 4px;
      width: 4px;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(99, 131, 202, 0.2);
      border-radius: 2px;
    }
    &::-webkit-scrollbar-track {
      background: transparent;
      border-radius: 2px;
    }
    /* 상하 화살표 버튼 숨기기 */
    &::-webkit-scrollbar-button {
      display: none;
      height: 0;
      width: 0;
    }
    .menu-item {
      position: relative;
      width: 100%;
      cursor: pointer;
      user-select: none;
      border-radius: 8px;
      .menu-title {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #2F4D8B;
        justify-content: space-between;
        height: 30px;
        padding: 4px 0;
        margin-bottom: 2px;
        flex-grow: 1;
        user-select: none;        
        .menu-text {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-grow: 1;
          user-select: none;
          i {
            opacity: 0.8;
          }
          img {
            width: 20px;
            height: 20px;
          }
          > span {
            display: inline-block;
            font-family: #1d304b;
            flex-grow: 1;
            font-size: 14px;
            line-height: 160%;
            font-weight: 500;
            user-select: none;
          }
        }
        .menu-arrow-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 8px;
          border: 1px solid transparent;
          transition:
            background 0.18s cubic-bezier(0.4,0,0.2,1),
            border-color 0.18s cubic-bezier(0.4,0,0.2,1);
          .menu-arrow {            
            transition: transform 0.2s ease;
            &.rotated {
              transform: rotate(180deg);
            }
          }
        }        
        &:hover,
        &:active {
          .menu-arrow-wrap {
            background: rgba(99, 131, 202, 0.15);
          }
        }
      }
      &.active {
        background: rgba(99, 131, 202, 0.15);
      }
      .submenu {
        list-style: none;
        .submenu-item {
          display: flex;
          align-items: center;
          // height: 32px;
          padding: 4px 6px 4px 25px;
          transition: background 0.18s cubic-bezier(0.4,0,0.2,1);
          span {
            display: inline-block;
            font-family: var(--font-body);
            font-size: 16px;
            line-height: 150%;
            font-weight: 500;
            flex-grow: 1;
          }
          &.active {
            position: relative;
            &::after {
              content: '';
              left: 0;
              display: inline-block;
              height: 32px;
              width: 100%;
              position: absolute;
              border-radius: 8px;
              background: rgba(99, 131, 202, 0.15);
              box-sizing: border-box;
            }
            span {
              color: #000;
            }
            &:hover {
              &::after {
                background: rgba(99, 131, 202, 0.20);
              }
            }
          }
          &:hover,
          &:active {
            position: relative;
            &::after {
              content: '';
              left: 0;
              display: inline-block;
              height: 32px;
              width: 100%;
              position: absolute;
              border-radius: 8px;
              background: rgba(99, 131, 202, 0.15);
              box-sizing: border-box;
            }
          }
          + .submenu-item {
            margin-top: 3px;
          }
          .new-badge {
            display: inline-block;
            height: 24px;
          }
          .number-badge {
            display: inline-flex;
            height: 22px;
            background: #FF4848;
            width: 22px;
            justify-content: center;
            align-items: center;
            border-radius: 50px;
            color: #fff;
            font-size: 13px;
            margin-left: 4px;
          }
        }
      }
    }
  }
  .side-bottom-cards {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 16px;
    position: static;
    margin-top: auto;
    width: 100%;
    flex-shrink: 0;
    box-sizing: border-box;
    z-index: 10;
    transition: padding 0.3s ease, gap 0.3s ease;
    .bottom-card {
      display: flex;
      align-items: center;
      gap: 8px;
      min-height: 56px;
      border-radius: 12px;      
      cursor: pointer;
      position: relative;
      height: 70px;
      transition: box-shadow 0.2s;
      &.timetable {
        padding: 12px 8px 12px 16px;
        border: 1px solid rgba(141, 113, 243, 0.34);
        background: rgba(255, 255, 255, 0.70);
        box-shadow: 0 0 2px 0 rgba(130, 102, 255, 0.12);
        .timetable-content {
          display: flex;
          align-items: flex-start;
          flex-direction: column;
          gap: 3px;
          flex: 1;
        }
        .badge-free {
          display: flex;
          align-items: center;
          background: linear-gradient(97deg, #5F72EB 0%, #8461ED 100%);
          color: #fff;
          font-size: 12px;
          font-weight: 500;
          line-height: 20px;
          border-radius: 12px;
          height: 20px;
          padding: 0 12px;
        }
        .main-text {
          text-shadow: 0 0 4px rgba(126, 71, 222, 0.12);
          background: linear-gradient(94deg, #1F54C2 0%, #8727DB 100%);
          background-clip: text;
          color: transparent;
          font-size: 14px;
          font-weight: 700;
          line-height: 160%;
          flex: 1;
          margin-left: 0;
        }
        &:hover {
          border: 1px solid #8D71F3;
          background: #FFF;
          box-shadow: 0 0 0 4px rgba(130, 102, 255, 0.08);
        }
      }

      &.consult {
        padding: 12px 8px 12px 16px;
        border-radius: 12px;
        border: 1px solid rgba(0, 73, 224, 0.25);
        background: rgba(255, 255, 255, 0.70);
        box-shadow: 0 0 2px 0 rgba(96, 173, 255, 0.12);
        .consult-content {
          display: flex;
          align-items: flex-start;
          flex-direction: column;    
          flex: 1;
          gap: 3px;      
        }
        .main-row {
          display: flex;
          align-items: center;
          width: 100%;
          .main-text {
            color: #1546AC;
            font-size: 14px;
            font-weight: 700;
            line-height: 160%;
            flex: 1;
          }
          .arrow-btn {
            margin-left: 8px;
          }
        }
        .sub-row {
          display: flex;
          align-items: center;
          .hi-ico {
            margin-right: 4px;
          }
          .tel {
            color: var(--primary);
            font-size: var(--font-text-b3);
            font-weight: 500;
            line-height: var(--font-leading-b3);
          }
        }
        &:hover {
          border: 1px solid rgba(0, 73, 224, 0.70);
          background: #FFF;
          box-shadow: 0 0 0 4px rgba(96, 173, 255, 0.08);
        }
      }

      .arrow-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-left: auto;
        .ico-next {
          &::after {
            background-color: var(--secondary);
          }
        }
      }
    }
    &.collapsed {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 12px 8px 20px 8px;
      border-top: 1px solid rgba(0, 0, 0, 0.10);
      background: transparent;
      box-shadow: none;
      transition: padding 0.3s ease, gap 0.3s ease;
      .collapsed-bottom-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;
        background: transparent;
        width: 64px;
        height: 64px;
        justify-content: center;
        box-shadow: none;
        transition: transform 0.15s ease-in-out;
        transform: translateZ(0);
        transform-origin: center center;
        .collapsed-label {
          color: #000;
          font-size: 13px;
          font-weight: 500;
          text-align: center;
          line-height: 130%;
          white-space: pre-line;
          &.inquiry {
            line-height: 150%;
          }
        }
        .inquiry-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 52px;
          border: 1px solid rgba(0, 0, 0, 0.05);
          background: #768AA8;
          transition: background 0.15s ease-in-out, border 0.15s ease-in-out;
        }
        img {
          width: 30px;
          height: 30px;
        }
        &:hover {
          cursor: pointer;
          transform: translateZ(0) scale(1.08);
          .inquiry-btn {
            background: var(--primary);
          }
        }
        &:active {
          transform: translateZ(0) scale(1);
        }
      }
    }
  }
  .submenu-popup {
    position: absolute;
    left: 100%;
    min-width: 180px;
    margin-left: 4px;
    border-radius: 12px;
    border: 1px solid #ccd0d7;
    background: #fff;
    box-shadow:
      1px 1px 2px 0px rgba(0, 0, 0, 0.08),
      0px 0px 30px 0px rgba(0, 0, 0, 0.08);
    padding: 12px;
    opacity: 0;
    pointer-events: none;
    transform: translateX(-10px);
    transition:
      opacity 0.3s ease,
      transform 0.3s ease;
    z-index: 10;
    &.open {
      opacity: 1;
      pointer-events: auto;
      transform: translateX(0);
    }
    .submenu {
      .submenu-item {
        display: flex;
        align-items: center;
        padding: 5px 0 5px 22px;
        border: 1px solid transparent;
        white-space: nowrap;
        cursor: pointer;
        
        &:not(:last-child) {
          margin-bottom: 1px;
        }
        &:hover,
        &:active,
        &.active {
          background: rgba(99, 131, 202, 0.15);
          border-radius: 8px;
        }
        span {
          font-size: 15px;
          color: #000;
          line-height: 160%;
          font-weight: 400;
          font-family: var(--font-body);
        }
      }
      &.category {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .submenu-category {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px 0;
        img {
          width: 20px;
          height: 20px;
        }
        span {
          color: #000;
          font-size: 15px;
          font-weight: 700;
          line-height: 160%;
        }
        .submenu-item {
          font-size: 15px;
          font-weight: 400;
          line-height: 160%;
          padding: 5px 0 5px 22px;
        }
      }
    }
  }
  .more-menu {
    padding: 16px;
    display: flex;
    justify-content: center;
    align-items: center;
    i {
      opacity: 0.8;
    }
  }
  .teacher-list-wrap {
    position: fixed;
    display: flex;
    bottom: 0;
    width: 240px;
    padding: 15px;
    box-sizing: border-box;
    .teacher-list {
      width: 100%;
      border: 1px solid #323742;
      border-radius: 14px;
      padding: 12px 20px 15px 12px;
      background: #fff;
      .faq-wrap {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        white-space: nowrap;
        .title {
          color: #000;
          font-family: var(--font-body);
          font-size: 16px;
          font-weight: 700;
          line-height: 24px;
        }
        .sub {
          color: #616161;
          font-family: var(--font-body);
          font-size: 12px;
          font-weight: 400;
          line-height: 18px;
        }
        .faq-btn {
          display: flex;
          height: 30px;
          padding: 0px 20px;
          gap: 4px;
          justify-content: center;
          align-items: center;
          margin: 8px 0;
          span {
            color: #fff;
            display: inline-block;
            font-family: var(--font-body);
            font-size: 14px;
            font-weight: 500;
            line-height: 23px;
          }
        }
      }
      .tel-wrap {
        display: flex;
        flex-direction: column;
        align-items: center;
        .tel-num {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          .tel {
            color: var(--primary);
            font-family: var(--font-body);
            font-size: 14px;
            font-weight: 500;
            line-height: 23px;
          }
        }
        .time-list {
          list-style: none;
          .time-item {
            color: #9E9E9E;
            font-family: var(--font-body);
            font-size: 11px;
            font-weight: 500;
            line-height: 14px;
            + .time-item {
              margin-top: 2px;
            }
          }
        }
      }
    }
  }
  // .floating-banner-wrap {
  //   padding: 16px 16px 0 16px;
  //   .floating-banner {
  //     position: relative;
  //     box-shadow: rgba(255, 107, 107, 0.3) 0px 2px 8px;    
  //     background: linear-gradient(135deg, rgb(255, 107, 107) 0%, rgb(255, 142, 83) 100%);
  //     border-radius: 8px;
  //     padding: 16px 10px;
  //     animation: 2s ease-in-out 0s infinite normal none running bannerPulse;
  //     transition: 0.3s;
  //     border-width: 1px;
  //     border: 1px solid rgba(255, 255, 255, 0.15);
  //     border-image: initial;      
  //     overflow: hidden;
  //     cursor: pointer;
  //     &:hover {
  //       transform: translateY(-2px);
  //       box-shadow: 0 4px 16px rgba(255, 107, 107, 0.5);
  //       ::before {
  //         background: rgba(255, 255, 255, 0.15);
  //       }
  //       .banner-arrow {          
  //         transform: translateX(3px);
  //         .hi-ico {
  //           &::after {
  //             opacity: 1;
  //           }
  //         }
  //       }
  //     }
  //     &:active {
  //       transform: translateY(0);
  //     }
  //     @keyframes bannerPulse {
  //       0%, 100% { box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3); }
  //       50% { box-shadow: 0 3px 12px rgba(255, 107, 107, 0.45); }
  //     }
  //     &::before {
  //       content: '';
  //       position: absolute;
  //       top: 0px;
  //       left: 0px;
  //       right: 0px;
  //       bottom: 0px;
  //       pointer-events: none;
  //       background: rgba(255, 255, 255, 0);
  //       transition: 0.3s;
  //     }
  //     .banner-content {
  //       display: flex;
  //       align-items: center;
  //       gap: 6px;
  //       .banner-icon {
  //         font-size: 20px;
  //         font-family: 'Segoe UI';
  //         animation: 1.5s ease-in-out 0s infinite normal none running iconBounce;
  //       }
  //       @keyframes iconBounce {
  //         0%, 100% { transform: scale(1); }
  //         50% { transform: scale(1.2); }
  //       }
  //       .banner-text {
  //         display: flex;
  //         flex-direction: column;
  //         flex: 1 1 0%;
  //         gap: 8px;
  //         .text {
  //           font-size: 13px;
  //           font-weight: 700;
  //           color: #fff;
  //           display: block;
  //           text-overflow: ellipsis;
  //           white-space: nowrap;
  //           overflow: hidden;
  //         }
  //         .date {
  //           font-size: 12px;
  //           font-weight: 500;
  //           color: rgba(255, 255, 255, 0.85);
  //         }
  //       }
  //       .banner-arrow {
  //         font-size: 12px;
  //         color: rgba(255, 255, 255, 0.8);
  //         font-weight: 300;
  //         line-height: 1;
  //         transition: all 0.3s ease;
  //         align-self: center;
  //         .hi-ico {
  //           &::after {
  //             opacity: 0.8;
  //           }
  //         }
  //       }
  //     }
  //   }
  // }
}
.ios {
  .side-navi-menu {
    &.is-collapsed {
      max-height: 100dvh;
      height: 100dvh;
      .class-img {
        height: 120px;
      }
      .menu-list {
        gap: 10px;
      }
      // .bottom-menu {
      //   gap: 10px;
      // }
      .inquiry {
        padding-bottom: 12px;
        bottom: 127px;
      }
      .menu-btn {
        z-index: 99;
      }
    }
  }
}

.noTransition {
  transition: none !important;
  * {
    transition: none !important;
  }
}
</style>
