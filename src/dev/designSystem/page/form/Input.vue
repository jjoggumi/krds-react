<template>
  <article class="formSys">
    <div class="sections">
      <section>      
        <h2>Date Picker</h2>
        <HiDatePicker
          placeholder="시작일 선택"
          :format="'YYYY년 M월 D일'"
          :valueType="'YYYY-MM-DD'"
          v-model="dateStart"
          @change="onChangeDateStart"
        />
        <HiDatePicker
          placeholder="종료일 선택"
          :format="'YYYY년 M월 D일'"
          :valueType="'YYYY-MM-DD'"
          v-model="dateEnd"
          @change="onChangeDateEnd"
        />
      </section>
      <section >
        <h2>Time Picker</h2>
        <HiDatePicker
          type="time"
          placeholder="시간 선택"
          format="HH:mm"
          value-type="format"
          :class-name="['hi-timepicker']"
          :range="true"
          :minute-step="5"
          v-model="time"
          @change="time = $event"
        />
      </section>
      <!-- 
      <section>
        <strong class="guide-heading">검색</strong>
        <div class="hi-searchbox">
          <div class="searchbox__input">
            <input type="text" placeholder="게시글 검색">
            <button class="btn-delete" style="display: none;"></button>
            <button class="btn-search"></button>
          </div>
        </div>
        <br>
      </section> -->
    </div>
  </article>
</template>
  
<script>
export default {
  name : 'Input',
  components: { HiDatePicker, HiSelectBox},
  data(){
    return{

      time : ['13:00', '17:00'],
      dateStart: null,
      dateEnd: null,
    }
  },
  methods:{
     onChangeDateStart(value) {
      this.dateStart = value
    },
    onChangeDateEnd(value) {
      this.dateEnd = value
    },

    handleUpdateValue(value) {
      this.selectedValue = value; // 선택된 값 업데이트
      console.log(`선택된 값: ${value}`);
    },
    handleDeleteItem(item) {
      this.items = this.items.filter((i) => i.value !== item.value);
      console.log(`삭제된 아이템: ${item.title}`);
    },
    handleAddItem() {
      const newValue = this.items.length * 5 + 10; // 새로운 값을 계산하여 추가
      const newItem = { value: newValue, title: `${newValue}시` };
      this.items.push(newItem);
      console.log(`추가된 아이템: ${newItem.title}`);
    },
  }
}
</script>