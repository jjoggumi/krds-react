<template>
  <div class="point-card-warp" :class="[{ bad: point.isNegative }, { best: bestPoint }]">
    <span class="image" :style="{ background: point.pointColor }">
      <img :src="`https://download.hiclass.net/static/classroom/point/${point.pointImage}.png`" />
      <span class="score" :class="{ bad: point.isNegative }">{{ point.point }}</span>
    </span>
    <p class="point-name">{{ point.pointName }}</p>
    <span class="total-wrap">
      <p class="point-total" :class="{ bad: point.isNegative }">{{ point.totalPoint }}</p>
      <i
        v-if="params.studentId === null"
        @click="openStudent(point.isNegative)"
        class="cursor-pointer"
        :class="{ down: !isOpenStudent, up: isOpenStudent }"
      ></i>
    </span>
    <div :style="{ display: isOpenStudent ? 'block' : 'none' }" class="student-list-wrap" v-click-outside="closeStudent" ref="scrollContArea">
      <ul>
        <li v-for="student of students" :key="student.id">
          <span class="num">{{ student.studentNo }}</span>
          <span class="name" :class="{ hidden: student.isHidden }">
            {{ student.isHidden ? `(숨김) ${student.studentName}` : student.studentName }}
          </span>
          <span class="point" :class="{ bad: point.isNegative }">{{ student.displayPoint }}</span>
        </li>
        <div ref="scrollAccess"></div>
      </ul>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
export default {
  name: 'point-total-card',
  props: {
    point: Object,
    classroomId: String,
    params: Object,
    bestPoint: Boolean,
  },
  data() {
    return {
      isOpenStudent: false,
      student: {
        list: [],
        page: {},
      },
      observer: null,
      obsRef: null,
      sort: null,
    };
  },
  computed: {
    students: function () {
      return this.student.list.map((o) => {
        return { ...o, displayPoint: this.point.isNegative ? o.negativePoint : o.positivePoint };
      });
    },
  },
  methods: {
    ...mapActions('storeBehavior', {
      getClassroomStudentByTotal: 'getClassroomStudentByTotal',
    }),
    removeEmptyValue: function (params) {
      if (!params) return {};

      const returnParams = {};

      Object.keys(params).forEach((key) => {
        if (params[key] !== '' && params[key] !== null) {
          returnParams[key] = params[key];
        }
      });

      return returnParams;
    },
    openStudent: async function (isNegative) {
      if (!this.isOpenStudent) {
        this.sort = isNegative ? 'negative' : 'positive';
        this.setStudent(
          await this.getClassroomStudentByTotal({
            ...this.removeEmptyValue(this.params),
            pointId: this.point.pointId,
            classroomId: this.classroomId,
            isAllStudents: false,
            sort: this.sort,
          })
        );
        this.isOpenStudent = !this.isOpenStudent;
      }
    },
    closeStudent: function () {
      this.isOpenStudent = false;
    },
    setStudent: function (response) {
      const { _embedded, page } = response;
      const list = _embedded ? _embedded.studentPoints : [];
      if (page.number === 0) {
        this.student.page = page;
      } else {
        if (list.length > 0) {
          this.student.page = page;
        }
      }
      const orgIds = this.student.list.map((p) => p.studentId);
      this.student.list = page.number === 0 ? list : [...this.student.list, ...list.filter((o) => !orgIds.includes(o.studentId))];
    },
    scrollObserver: function () {
      this.$nextTick(function () {
        const option = {
          root: this.$refs.scrollContArea,
          rootMargin: '40px',
          threshold: 1,
        };

        const callback = async ([entry]) => {
          if (entry.isIntersecting && this.isOpenStudent) {
            const params = {
              ...this.removeEmptyValue(this.params),
              pointId: this.point.pointId,
              classroomId: this.classroomId,
              isAllStudents: false,
              page: this.student.page.number + 1,
              sort: this.sort,
            };
            this.setStudent(await this.getClassroomStudentByTotal(params));
          }
        };

        this.observer = new IntersectionObserver(callback, option);
        this.observer.observe(this.obsRef);
      });
    },
  },
  created() {
    this.$nextTick(() => this.scrollObserver());
  },
  mounted() {
    this.obsRef = this.$refs.scrollAccess;
  },
};
</script>

<style scoped lang="scss">
.name {
  max-width: calc(100% - 80px);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.name.hidden {
  color: #9e9e9e;
}
.best::after {
  content: 'BEST';
  position: absolute;
  top: 0px;
  right: 0px;
  background: #ff658a;
  width: 42px;
  height: 20px;
  border-radius: 0 6px 0 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
}

// 포인트 카드 리스트
.point-card-warp {
  position: relative;
  width: 100%;
  /*max-width: 310px;*/
  height: 74px;
  border-radius: 6px;
  background: rgba(57, 135, 248, 0.06);
  display: flex;
  align-items: center;
  min-width: 0;

  .student-list-wrap {
    width: 230px;
    height: 218px;
    overflow-y: auto;
    position: absolute;
    top: 50px;
    right: 0px;
    z-index: 99;
    box-shadow: 0px 5px 10px 0px #0000001f;
    background: #fff;
    border-radius: 10px;
    border: 1px solid #d6d6d6;
    &::-webkit-scrollbar {
      width: 14px;
    }
    &::-webkit-scrollbar-track {
      background: transparent;
    }
    &::-webkit-scrollbar-thumb {
      background: #d3d1cb;
      background-clip: padding-box;
      border: 2px solid transparent;
      border-radius: 50px;
      border-top: 0;
      border-bottom: 0;
    }
    ul {
      width: 100%;
      background: #fff;
      border-radius: 10px;
      height: 100%;
    }
    ul li {
      font-size: 14px;
      font-weight: 400;
      line-height: 14px;
      width: 100%;
      height: 40px;
      padding: 11px 0px 11px 19px;
      display: flex;
      align-items: center;
    }
    ul li:hover {
      background: #f6f6f6;
    }
    ul li .num {
      display: inline-block;
      width: auto;
      min-width: 28px;
      max-width: 58px;
      height: 18px;
      border-radius: 20px;
      border: 1px solid #9e9e9e;
      font-size: 12px;
      font-weight: 500;
      color: #616161;
      text-align: center;
      line-height: 16px;
      margin-right: 6px;
      padding-left: 2px;
      padding-right: 2px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    ul li .point {
      font-size: 14px;
      font-weight: 400;
      line-height: 14px;
      color: #3987f8;
      position: absolute;
      right: 19px;
    }
    ul li .point.bad {
      color: #f95f6e;
    }
  }
  span.image {
    width: 46px;
    height: 46px;
    position: relative;
    margin-left: 15px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    img {
      width: 70%;
      height: 70%;
      -o-object-fit: cover;
      object-fit: cover;
      image-rendering: auto;
    }
    .score {
      width: 36px;
      height: 26px;
      display: flex;
      align-items: center;
      justify-content: center;
      /*background: url('../img/bg/bg_point_ellipse.png') 0/15px;*/
      background: #3987f8;
      border-radius: 24px;
      object-fit: cover;
      position: absolute;
      top: 29px;
      left: 23px;
      color: #fff;
      font-weight: 700;
      font-size: 13px;
      line-height: 20px;
      font-family: var(--font-body);
      border: 3px solid #f3f8ff;
    }
    .score.bad {
      background: #f95f6e;
      border: 3px solid #fff6f7;
    }
  }

  .total-wrap {
    display: flex;
    position: absolute;
    right: 10px;
  }

  p.point-name {
    color: #222;
    width: calc(100% - 130px);
    max-width: 170px;
    font-size: 15px;
    line-height: 15px;
    font-weight: 400;
    margin-left: 15px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
    white-space: nowrap;
    margin-left: 13px;
  }
  p.point-total {
    width: 100%;
    max-width: 40px;
    overflow: hidden;
    text-align: right;
    text-overflow: ellipsis;
    display: inline-block;
    white-space: nowrap;
    color: #3987f8;
    font-size: 15px;
    line-height: 15px;
    font-weight: 500;
    padding: 0px 1px 0px 1px;
  }
  p.point-total.bad {
    color: #f95f6e;
  }

  i.down {
    width: 16px;
    height: 16px;
    content: url('~@/assets/img/icon/ic_arrowdown_16_gray.svg');
    margin-left: 4px;
  }
  i.up {
    width: 16px;
    height: 16px;
    content: url('~@/assets/img/icon/ic_arrowup_16_gray.svg');
    margin-left: 4px;
  }

  &.bad {
    background: #f95f6e0f;
  }
}
</style>