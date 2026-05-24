<template>
  <div class="time-table-wrap designSys">
    <div class="head">UI</div>
    <div class="con-wrap">
      <section>
        <div class="tit mb-30">Button Type</div>
        <div class="con">
          <div class="hi-row">
            <div class="col-sm-2">
              <button class="btn btn-primary btn-block">Primary</button>
            </div>
            <div class="col-sm-2">
              <button class="btn btn-primary btn-block" disabled>Disabled</button>
            </div>
            <div class="col-sm-2">
              <button class="btn btn-primary btn-block btn-ico-left">
                <i class="ico ico-arrow-left ico-size-20"></i>
                IconButton
              </button>
            </div>
            <div class="col-sm-6">
              <button class="btn btn-primary btn-xs mr-20">
                xs Size
              </button>
              <button class="btn btn-primary btn-sm mr-20 ">
                sm Size
              </button>
              <button class="btn btn-primary btn-md mr-20 ">
                md Size
              </button>
              <button class="btn btn-primary btn-lg mr-20">
                lg Size
              </button>
              <button class="btn btn-primary btn-xl mr-20">
                xl Size
              </button>
            </div>
          </div>
          <div class="hi-row mt-10 mb-10">
            <div class="col-sm-2">
              <button class="btn btn-secondary btn-block">Secondary</button>
            </div>
            <div class="col-sm-2">
              <button class="btn btn-secondary btn-block" disabled>Disabled</button>
            </div>
            <div class="col-sm-2">
              <button class="btn btn-secondary btn-block btn-ico-left">
                <i class="ico ico-arrow-left ico-size-20"></i>
                IconButton
              </button>
            </div>
            <div class="col-sm-6">
              <button class="btn btn-secondary btn-xs mr-20">
                xs Size
              </button>
              <button class="btn btn-secondary btn-sm mr-20 ">
                sm Size
              </button>
              <button class="btn btn-secondary btn-md mr-20 ">
                md Size
              </button>
              <button class="btn btn-secondary btn-lg mr-20">
                lg Size
              </button>
              <button class="btn btn-secondary btn-xl mr-20">
                xl Size
              </button>
            </div>
          </div>
          <div class="hi-row mt-10 mb-10">
            <div class="col-sm-2">
              <button class="btn btn-tertiary-blue btn-block">Tertiary Blue</button>
            </div>
            <div class="col-sm-2">
              <button class="btn btn-tertiary-blue btn-block" disabled>Disabled</button>
            </div>
            <div class="col-sm-2">
              <button class="btn btn-tertiary-blue btn-block btn-ico-left">
                <i class="ico ico-arrow-left ico-size-20"></i>
                IconButton
              </button>
            </div>
            <div class="col-sm-6">              
              <button class="btn btn-tertiary-blue btn-xs mr-20">
                xs Size
              </button>
              <button class="btn btn-tertiary-blue btn-sm mr-20 ">
                sm Size
              </button>
              <button class="btn btn-tertiary-blue btn-md mr-20 ">
                md Size
              </button>
              <button class="btn btn-tertiary-blue btn-lg mr-20">
                lg Size
              </button>
              <button class="btn btn-tertiary-blue btn-xl mr-20">
                xl Size
              </button>
            </div>
          </div>
          <div class="hi-row">
            <div class="col-sm-2">
              <button class="btn btn-tertiary btn-block">Tertiary</button>
            </div>
            <div class="col-sm-2">
              <button class="btn btn-tertiary btn-block" disabled>Disabled</button>
            </div>
            <div class="col-sm-2">
              <button class="btn btn-tertiary btn-block btn-ico-left">
                <i class="ico ico-arrow-left ico-size-20"></i>
                IconButton
              </button>
            </div>
            <div class="col-sm-6">
              <button class="btn btn-tertiary btn-xs mr-20">
                xs Size
              </button>
              <button class="btn btn-tertiary btn-sm mr-20 ">
                sm Size
              </button>
              <button class="btn btn-tertiary btn-md mr-20 ">
                md Size
              </button>
              <button class="btn btn-tertiary btn-lg mr-20">
                lg Size
              </button>
              <button class="btn btn-tertiary btn-xl mr-20">
                xl Size
              </button>
            </div>
          </div>          
        </div>
      </section>
      <section>
        <div class="tit mb-30">Input</div>
        <div class="con">
          <div class="hi-row">
            <div class="col-sm-2">
              <div class="input-wrap">
                <input type="text" value="default">
              </div>
            </div>
            <div class="col-sm-2">
              <div class="input-wrap">
                <input type="text" value="disabled" disabled />
              </div>
            </div>            
            <div class="col-sm-2">
              <div class="input-wrap">
                <input type="text" value="readonly" readonly />
              </div>
            </div>
            <div class="col-sm-2">
              <div class="input-wrap">
                <input type="text" class="error" value="error"/>
                <p class="msg">Error message</p>
              </div>
            </div>            
            <div class="col-sm-2">
              <div class="input-wrap">
                <input type="text" class="success" value="success" />
                <p class="msg">success message</p>
              </div>
            </div>            
          </div>
        </div>
        <div class="con mt-20">
          <div class="hi-row">
            <div class="col-sm-2">
              <div class="input-wrap">
                <input type="text" class="sm" value="sm">
              </div>
            </div>
            <div class="col-sm-2">
              <div class="input-wrap">
                <input type="text" class="md" value="md">
              </div>
            </div>
            <div class="col-sm-2">
              <div class="input-wrap">
                <input type="text" class="lg" value="lg">
              </div>
            </div>
            <div class="col-sm-2">
              <div class="input-wrap">
                <input type="text" class="xl" value="xl">
              </div>
            </div>
          </div>
        </div>
      </section>
      <section>
        <div class="tit mb-30">Selectbox</div>
        <div class="con">
          <div class="hi-row">
            <div class="col-sm-2">
              <HiSelectBox  
                class="w100"
                :value="selectval"
                :items="selectitem"
                @update:value="selectval = $event"
                :empty-title="selectval || 'default'"
              />
            </div>
            <div class="col-sm-2">
              <HiSelectBox  
                class="w100"
                :value="selectval"
                :items="selectitem"
                @update:value="selectval = $event"
                :empty-title="selectval || 'disabled'"
                disabled
              />
            </div>                      
            <div class="col-sm-2">
              <HiSelectBox  
                class="w100"
                :value="selectval"
                :items="selectitem"
                @update:value="selectval = $event"
                :empty-title="selectval || 'readonly'"
                readonly
              />
            </div>                      
            <div class="col-sm-2">
              <HiSelectBox  
                class="w100 error"
                :value="selectval"
                :items="selectitem"
                @update:value="selectval = $event"
                :empty-title="selectval || 'error'"
              />
              <p class="txt-warning mt-05"><small>Error message</small></p>
            </div>                      
          </div>
        </div>
        <div class="con mt-20">
          <div class="hi-row">
            <div class="col-sm-2">
              <HiSelectBox  
                class="w100 sm"
                :value="selectval"
                :items="selectitem"
                @update:value="selectval = $event"
                :empty-title="selectval || 'sm'"
              />
            </div>                                
            <div class="col-sm-2">
              <HiSelectBox  
                class="w100 md"
                :value="selectval"
                :items="selectitem"
                @update:value="selectval = $event"
                :empty-title="selectval || 'md'"
              />
            </div>                                
            <div class="col-sm-2">
              <HiSelectBox  
                class="w100 lg"
                :value="selectval"
                :items="selectitem"
                @update:value="selectval = $event"
                :empty-title="selectval || 'lg'"
              />
            </div>                                
            <div class="col-sm-2">
              <HiSelectBox  
                class="w100 xl"
                :value="selectval"
                :items="selectitem"
                @update:value="selectval = $event"
                :empty-title="selectval || 'xl'"
              />
            </div>                                
          </div>
        </div>        
      </section>
      <section>
        <div class="tit mb-30">DatePicker</div>
        <div class="con">
          <div class="hi-row">
            <div class="col-sm-6">              
              <div class="datepick">
                <HiDatePicker
                  placeholder="선택하세요"
                  :format="'YYYY년 M월 D일'"
                  :valueType="'YYYY-MM-DD'"
                  v-model="dateStart"
                  @change="onChangeDateStart"
                />
                <span class="wave">~</span>
                <HiDatePicker
                  placeholder="선택하세요"
                  :format="'YYYY년 M월 D일'"
                  :valueType="'YYYY-MM-DD'"
                  v-model="dateEnd"
                  @change="onChangeDateEnd"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>        
        <div class="tit mb-30">Checkbox</div>
        <div class="mb-30">          
          <div class="form-check">
            <input type="checkbox" id="check" />
            <label for="check"><span>체크박스</span></label>
          </div>          
          <div class="form-check">
            <input type="checkbox" id="checked" checked />
            <label for="checked"><span>체크박스 선택</span></label>
          </div>          
          <div class="form-check">
            <input type="checkbox" id="check-disabled" disabled />
            <label for="check-disabled"><span>체크박스 비활성화</span></label>
          </div>          
          <div class="form-check">
            <input type="checkbox" id="checked-disabled" checked disabled />
            <label for="checked-disabled"><span>체크박스 선택 비활성화</span></label>
          </div>
        </div>    
        <div class="mb-30">        
          <div class="form-check-inline">
            <input type="checkbox" id="check" />
            <label for="check"><span>체크박스</span></label>
          </div>          
          <div class="form-check-inline">
            <input type="checkbox" id="checked" checked />
            <label for="checked"><span>체크박스 선택</span></label>
          </div>          
          <div class="form-check-inline">
            <input type="checkbox" id="check-disabled" disabled />
            <label for="check-disabled"><span>체크박스 비활성화</span></label>
          </div>          
          <div class="form-check-inline">
            <input type="checkbox" id="checked-disabled" checked disabled />
            <label for="checked-disabled"><span>체크박스 선택 비활성화</span></label>
          </div>
        </div>    
        <div>
          <input type="checkbox" id="check-btn" class="btn-type"/>
          <label for="check-btn"><span>버튼형</span></label>      
          <input type="checkbox" id="checked-btn" checked class="btn-type"/>
          <label for="checked-btn"><span>버튼형 선택</span></label>  
          <input type="checkbox" id="check-btn" class="btn-type rounded"/>
          <label for="check-btn"><span>버튼형</span></label>      
          <input type="checkbox" id="checked-btn" checked class="btn-type rounded"/>
          <label for="checked-btn"><span>버튼형 선택</span></label>  
        </div>
      </section>
      <section>
        <div class="tit mb-30">Radio</div>
        <div class="mb-30">
          <div class="form-check">
            <input type="radio" id="radio" name="radio"/>
            <label for="radio"><span>라디오</span></label>
          </div>
          <div class="form-check">
            <input type="radio" id="radio-checked" name="radio" checked />
            <label for="radio-checked"><span>라디오 선택</span></label>
          </div>
          <div class="form-check">
            <input type="radio" id="radio-disabled" disabled />
            <label for="radio-disabled"><span>라디오 비활성화</span></label>
          </div>
          <div class="form-check">
            <input type="radio" id="radio-checked-disabled" checked disabled />
            <label for="radio-checked-disabled"><span>라디오 선택 비활성화</span></label>
          </div>
        </div>
        <div class="mb-30">
          <div class="form-check-inline">
            <input type="radio" id="radio" name="radio"/>
            <label for="radio"><span>라디오</span></label>
          </div>
          <div class="form-check-inline">
            <input type="radio" id="radio-checked" name="radio" checked />
            <label for="radio-checked"><span>라디오 선택</span></label>
          </div>
          <div class="form-check-inline">
            <input type="radio" id="radio-disabled" disabled />
            <label for="radio-disabled"><span>라디오 비활성화</span></label>
          </div>
          <div class="form-check-inline">
            <input type="radio" id="radio-checked-disabled" checked disabled />
            <label for="radio-checked-disabled"><span>라디오 선택 비활성화</span></label>
          </div>
        </div>
        <div>
          <input type="radio" id="radio1" name="radio1" class="btn-type"/>
          <label for="radio1"><span>버튼형</span></label>
          <input type="radio" id="radio-checked1" name="radio1" checked class="btn-type"/>
          <label for="radio-checked1"><span>버튼형 선택</span></label>
        </div>
      </section>
      
      <section> 
        <div class="tit mb-30">Switch</div>     
        <div>
          <!-- <hi-switch v-model="switchValue" @update:model="switchValue = $event" invert/> -->
          <hi-switch v-model="switchValue" invert />
          <hi-switch v-model="switchValue" />
          <hi-switch v-model="switchValue" disabled />
        </div>
      </section>


      <!-- <TimeTableModal size="sm">
        <template v-slot:heading>
          모달 제목 영역입니다.
          <p class="smr">모달 설명글입니다.</p>
        </template>
        <template v-slot:content> 모달 컨텐츠 영역입니다. </template>
        <template v-slot:footer>          
          <button type="button" class="btn btn-tertiary btn-lg" >취소</button>
          <button type="button" class="btn btn-primary btn-lg" >확인</button>        
        </template>       
      </TimeTableModal> -->

    </div>


  </div>
</template>

<script setup>
import { ref } from 'vue';
import HiDatePicker from "@/components/DatePicker/HiDatePicker.vue";
import "@/assets/css/timetable/common.scss"; // 공통 스타일

const switchValue = ref(false);
const selectval = ref('');
const selectitem = ref([
  { value: '1', title: '아이템1' },
  { value: '2', title: '아이템2' },
  { value: '3', title: '아이템3' },
]);
const dateStart = ref(null);
const dateEnd = ref(null);

const onChangeDateStart = (value) => {
  dateStart.value = value;
};

const onChangeDateEnd = (value) => {
  dateEnd.value = value;
};



</script>
<style lang="scss" scoped>
.designSys{
  width: 100%;
  min-height: 100%;
  * {font-family: 'pretendard', sans-serif;}
  .head{
    font-size: 30px;
    font-weight: 800;
    padding: 40px;
    background: #E1E9F9;
    border-radius: 10px 10px 0 0 ;
  }
  .con-wrap{
    background: #fff;
    border-radius: 0 0 10px 10px;
  }
  section{
    padding:60px;
    .tit{    
      font-size: 18px;
      font-weight: 800;
    }
    .con{}
    & + section{
      border-top:1px solid #ddd;
    }
  }


}
</style>
