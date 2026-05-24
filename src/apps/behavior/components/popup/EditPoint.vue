<template>
  <div class="modal normal-modal slick-modal view-main-detail-modal ofy" id="whoWriteModal" style="display: block">
    <div class="modal-cont-wrap">
      <div class="modal-cont">
        <div class="modal-cont-inner">
          <div class="behavior-modal-point-edit" :class="{ add: editMode !== 'update' }">
            <div class="title-wrap">
              <p>{{ modalTitle }}</p>
            </div>
            <div
              class="point-edit-wrap"
              :class="{
                add: editMode !== 'update',
              }"
            >
              <div class="point-form">
                <div class="preview-icon">
                  <div
                    class="icon"
                    :class="{ 'no-line': pointItem.pointColor.toUpperCase() !== '#FFFFFF' }"
                    :style="{
                      'background-image': `url('https://download.hiclass.net/static/classroom/point/${pointItem.pointImage}.png')`,
                      'background-color': pointItem.pointColor,
                    }"
                  />
                </div>
                <div class="form-group">
                  <div class="type">
                    <p>
                      구분
                      <span v-if="editMode === 'update'">* 포인트 구분은 변경 불가합니다.</span>
                    </p>
                    <div class="btn-group">
                      <button class="btn-good" :class="{ on: !pointItem.isNegative }" @click="setIsNegative(false)" :disabled="editMode === 'update'">
                        <i class="good"></i>
                        <span>좋음</span>
                      </button>
                      <button class="btn-bad" :class="{ on: pointItem.isNegative }" @click="setIsNegative(true)" :disabled="editMode === 'update'">
                        <i class="bad"></i>
                        <span>노력</span>
                      </button>
                    </div>
                  </div>
                  <div class="point-name">
                    <p>포인트명</p>
                    <input
                      type="text"
                      class="input-point-name"
                      :value="pointItem.pointName"
                      placeholder="포인트명을 입력하세요."
                      @input="checkLength($event.target)"
                      @focusout="trimPointName()"
                    />
                  </div>
                  <div class="point-score">
                    <p>포인트 점수</p>
                    <input
                      type="text"
                      class="input-point-score"
                      :class="{
                        error: isInputPointError === true,
                      }"
                      placeholder="0~100"
                      maxlength="3"
                      v-model="pointItem.point"
                      @input="inputOnlyNumber"
                    />
                    <span v-if="isInputPointError === true" class="err-message"> 0~100 사이의 점수를 입력하세요. </span>
                  </div>
                </div>
              </div>
              <div class="point-make">
                <div class="tab-group">
                  <button class="tab-img" :class="{ on: currentTab === 'img' }" @click="changeTab('img')">이미지</button>
                  <button class="tab-color" :class="{ on: currentTab === 'color' }" @click="changeTab('color')">배경</button>
                </div>
                <div class="select-group">
                  <!-- 이미지 선택 영역 start -->
                  <div class="palette image" v-if="currentTab === 'img'">
                    <div class="row" v-for="imagerRow of defaultPointImageArr">
                      <template v-if="imagerRow.length === 5">
                        <button
                          v-for="(imageName, idx) of imagerRow"
                          :key="`${idx}-${imageName}`"
                          class="option"
                          :class="{ select: imageName === pointItem.pointImage }"
                          :style="{ 'background-image': `url('https://download.hiclass.net/static/classroom/point/${imageName}.png')` }"
                          @click="setPointImage(imageName)"
                        >
                          <span class="inner-circle"></span>
                        </button>
                      </template>
                      <template v-else>
                        <button
                          v-for="i in 5"
                          :key="`${i}-${imagerRow[i - 1]}`"
                          class="option"
                          :class="{
                            select: imagerRow[i - 1] === pointItem.pointImage,
                          }"
                          :style="{ 'background-image': `url('https://download.hiclass.net/static/classroom/point/${imagerRow[i - 1]}.png')` }"
                          @click="setPointImage(imagerRow[i - 1])"
                          v-if="imagerRow[i - 1]"
                        >
                          <span class="inner-circle"></span>
                        </button>
                        <button class="option empty" v-else></button>
                      </template>
                    </div>
                  </div>
                  <!-- 이미지 선택 영역  end -->

                  <!-- 배경 선택 영역 start -->
                  <div class="palette background" v-if="currentTab === 'color'">
                    <div class="row" v-for="colorRow of defaultPointColorArr">
                      <template v-if="colorRow.length === 5">
                        <button
                          v-for="(colorCode, idx) of colorRow"
                          :key="`${idx}-${colorCode}`"
                          class="option"
                          :class="{
                            line: colorCode.toUpperCase() === '#FFFFFF',
                            select: colorCode.toUpperCase() === pointItem.pointColor.toUpperCase(),
                          }"
                          :style="{ 'background-color': colorCode }"
                          @click="setPointColor(colorCode.toUpperCase())"
                        >
                          <span class="inner-circle"></span>
                        </button>
                      </template>
                      <template v-else>
                        <button
                          v-for="i in 5"
                          :key="`${i}-${colorRow[i - 1]}`"
                          class="option"
                          :class="{
                            select: colorRow[i - 1].toUpperCase() === pointItem.pointColor.toUpperCase(),
                          }"
                          :style="{ 'background-color': colorRow[i - 1] }"
                          @click="setPointColor(colorRow[i - 1].toUpperCase())"
                          v-if="colorRow[i - 1]"
                        >
                          <span class="inner-circle"></span>
                        </button>
                        <button class="option empty" v-else></button>
                      </template>
                    </div>
                  </div>
                  <!-- 배경 선택 영역 end -->
                </div>
              </div>
            </div>
            <div
              class="point-info-message"
              :class="{
                add: editMode !== 'update',
              }"
            >
              * 포인트 점수는 최대 100점까지 설정할 수 있습니다.
              <template v-if="editMode === 'update'"><br />* 포인트 점수 변경 시, 저장 이후부터 변경된 점수로 지급됩니다.</template>
            </div>
            <div class="btn-wrap">
              <button class="cancel" @click="$emit('closePointEditModal')">취소</button>
              <button class="add" @click="editMode === 'save' ? savePoint() : updatePointCheck()" :disabled="isSubmit === false">
                {{ editMode === 'save' ? '추가' : '완료' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <confirm-modal
      v-if="confirmModal.isOpen"
      :title="confirmModal.title"
      :description="confirmModal.description"
      :cancelButtonText="confirmModal.cancelButtonText"
      :confirmButtonText="confirmModal.confirmButtonText"
      :confirmButtonColor="confirmModal.confirmButtonColor"
      :isAlert="confirmModal.isAlert"
      @closeConfirmDialog="closeConfirmDialog"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import ConfirmModal from '@/apps/behavior/components/popup/ConfirmModal';

export default {
  name: 'edit-point',
  components: {
    ConfirmModal,
  },
  data() {
    return {
      pointItem: {
        userId: '',
        pointName: '',
        isNegative: false,
        pointImage: 'hp0001',
        pointColor: '#FFE072',
        point: 1,
      },
      pointItemOri: {
        point: 1,
      },
      currentTab: 'img',
      editMode: 'save',
      defaultPointColorArr: {
        row1: ['#FFE072', '#4ECB71', '#4ECBB4', '#92BEFF', '#66A3FF'],
        row2: ['#FF766D', '#FF9B64', '#D187FF', '#B75BEF', '#6369F1'],
        row3: ['#DDDDDD', '#545454'],
      },
      defaultPointImageArr: {
        row1: ['hp0013', 'hp0004', 'hp0025', 'hp0023', 'hp0024'],
        row2: ['hp0012', 'hp0018', 'hp0019', 'hp0020', 'hp0021'],
        row3: ['hp0001', 'hp0014', 'hp0009', 'hp0027', 'hp0026'],
        row4: ['hp0003', 'hp0002', 'hp0007', 'hp0015', 'hp0005'],
        row5: ['hp0010', 'hp0006', 'hp0017', 'hp0011', 'hp0008'],
        row6: ['hp0022', 'hp0016', 'hp0028', 'hp0029'],
      },
      confirmModal: {
        isOpen: false,
        title: '포인트 점수를 수정하시겠습니까?',
        description: '점수 수정 이후 지급되는 포인트부터<br/>변경된 점수가 반영됩니다.',
        confirmButtonText: '확인',
        confirmButtonColor: '#FF8737',
        isAlert: false,
      },
      isInputPointError: false,
    };
  },
  props: {
    updatePointItem: {
      type: Object,
      default: () => {
        return {};
      },
    },
    popupPointType: {
      type: String,
      default: 'good',
    },
  },
  computed: {
    ...mapState('storeBehavior', {
      curClassroom: 'curClassroom',
    }),
    modalTitle: function () {
      return this.editMode === 'update' ? '포인트 수정' : '포인트 추가';
    },
    isSubmit() {
      return (this.pointItem.pointName.trim().length === 0) === false && this.isInputPointError === false;
    },
  },
  methods: {
    setIsNegative(flag) {
      this.pointItem.isNegative = flag;
    },
    setPointImage(imageName) {
      this.pointItem.pointImage = imageName;
    },
    setPointColor(colorCode) {
      this.pointItem.pointColor = colorCode;
    },
    trimPointName() {
      this.pointItem.pointName = this.pointItem.pointName.trim();
    },
    changeTab(tab) {
      this.currentTab = tab;
    },
    async savePoint() {
      try {
        const res = await this.$axios({
          method: 'POST',
          url: `/classroom/${this.curClassroom.classroomId}/points`,
          data: this.pointItem,
        });

        this.$emit('savePoint', {
          item: res.data,
          flag: false,
        });
      } catch (e) {}
    },
    async updatePoint() {
      const { pointId, isNegative, sortNo, ...updateItem } = this.pointItem;

      try {
        const res = await this.$axios({
          method: 'PATCH',
          url: `/classroom/${this.curClassroom.classroomId}/point/${this.pointItem.pointId}`,
          data: updateItem,
        });

        this.$emit('updatePoint', {
          item: { ...res.data, checked: false, issueCount: 1 },
          flag: false,
        });
      } catch (e) {}
    },
    updatePointCheck() {
      if (Number(this.pointItem.point) === Number(this.pointItemOri.point)) {
        this.updatePoint();
      } else {
        this.openConfirmDialog();
      }
    },
    openConfirmDialog() {
      this.confirmModal.isOpen = true;
    },
    closeConfirmDialog(flag) {
      if (flag) {
        // 확인
        this.updatePoint();
      }
      this.confirmModal.isOpen = false;
    },
    checkLength(target) {
      if (target.value.length > 50) {
        target.value = target.value.substring(0, 50);
      }
      this.pointItem.pointName = target.value;
    },
    inputOnlyNumber: function (e) {
      e.target.value = e.target.value.replace(/[^0-9]/g, '');
      this.pointItem.point = e.target.value;

      if (Number(this.pointItem.point) > 100 || !this.pointItem.point === true) {
        this.isInputPointError = true;
      } else {
        this.isInputPointError = false;
      }
    },
  },
  created() {
    if (this.updatePointItem.pointId) {
      for (const [key, value] of Object.entries(this.updatePointItem)) {
        this.pointItem[key] = value;

        if (key === 'point') {
          this.pointItemOri.point = value;
        }
      }
      this.editMode = 'update';
    }

    this.pointItem.userId = this.$store.state.user.currentId;
    this.pointItem.isNegative = this.popupPointType !== 'good';
  },
};
</script>

<style scoped></style>
