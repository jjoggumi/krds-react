<template>
  <article class="formSys type01">
    <div class="sections">
      <section>
        <h2>Selectbox Type</h2>
        <div class="hi-row sm-gutters">
          <div class="col-sm-4">
            <HiSelectBox
              class="mr-10"
              :value="defaultSelect.selectedValue"
              :items="defaultSelect.items"
              @update:value="defaultSelect.selectedValue = $event"
              :empty-title="defaultSelect.selectedValue || 'Default Type'"
            />
          </div>
          <div class="col-sm-4">
            <HiSelectBox class="mr-10" 
              :value="multiSelect.selectedValues"              
              :items="multiSelect.items" 
              :empty-title="multiSelect.selectedValues.join(', ') || 'Multiple Option'"            
            >
              <template #custom-option>
                <div class="option-list">
                  <ul>
                    <li v-for="item in multiSelect.items" :key="item.value">
                      <input type="checkbox" :id="`check-${item.value}`" :value="item.value" v-model="multiSelect.selectedValues" />
                      <label :for="`check-${item.value}`"
                        ><span>{{ item.title }}</span></label
                      >
                    </li>
                  </ul>
                </div>
              </template>
            </HiSelectBox>
          </div>
          <div class="col-sm-4">
            <HiSelectBox :items="defaultSelect.items" :value="defaultSelect.selectedValue" @update:value="defaultSelect.selectedValue = $event" selectBoxType="dropdown">
              <template #btnType> <HiIcon name="ico-chart" color="black" size="18" /> DropDown </template>
            </HiSelectBox>
          </div>
        </div>
      </section>
      <section>
        <h2>Selectbox Position</h2>
        <div class="hi-row sm-gutters">
          <div class="col-sm-3">
            <HiSelectBox
              class="mr-10"
              :value="defaultSelect.selectedValue"
              :items="defaultSelect.items"
              @update:value="defaultSelect.selectedValue = $event"
              :empty-title="defaultSelect.selectedValue || 'Option Default'"
            />
          </div>
          <div class="col-sm-3">
            <HiSelectBox
              class="mr-10 opt-top"
              :value="defaultSelect.selectedValue"
              :items="defaultSelect.items"
              @update:value="defaultSelect.selectedValue = $event"
              :empty-title="defaultSelect.selectedValue || 'Option Top'"
            />
          </div>
          <div class="col-sm-3">
            <HiSelectBox
              class="mr-10 opt-left"
              :value="defaultSelect.selectedValue"
              :items="defaultSelect.items"
              @update:value="defaultSelect.selectedValue = $event"
              :empty-title="defaultSelect.selectedValue || 'Option Left'"
            />
          </div>
          <div class="col-sm-3">
            <HiSelectBox
              class="mr-10 opt-right"
              :value="defaultSelect.selectedValue"
              :items="defaultSelect.items"
              @update:value="defaultSelect.selectedValue = $event"
              :empty-title="defaultSelect.selectedValue || 'Option Right'"
            />
          </div>
        </div>
      </section>
      <!-- <section>
        <h2>Usage</h2>
        <div class="hi-row sm-gutters">
          <div class="col-sm-4">
            <HiSelectBox
              class="mr-10"
              :value="editSelect.selectedValue"
              :items="editSelect.items"
              
              @update:value="editSelect.selectedValue = $event"
              @delete-item="handleDeleteItem"
              @add-item="handleAddItem"
              :empty-title="editSelect.selectedValue || '자리배치도 옵션'"
            >
              <template #custom-option="{ value, selectItem }">
                <div class="option-list type01">
                  <ul class="custom-scr">
                    <li v-for="item in editSelect.items" :key="item.value">
                      <HiButton color="link" class="item" :class="{ 'is-selected': item.value === value }" @click="selectItem(item)">
                        {{ item.title }}
                      </HiButton>
                      <HiButton color="link" class="append" @click="handleDeleteItem(item)">
                        <HiIcon name="ico-delete" color="disabled" size="20"></HiIcon>
                      </HiButton>
                    </li>
                  </ul>
                  <HiButton color="link" class="add" @click="handleAddItem">
                    <HiIcon name="ico-plus" color="orange" size="20"></HiIcon>
                    <span>추가</span>
                  </HiButton>
                </div>
              </template>
            </HiSelectBox>
          </div>
          <div class="col-sm-4">
            <HiSelectBox
              class="mr-10"
              :value="editSelect.selectedValue"
              :items="editSelect.items"
              
              @update:value="editSelect.selectedValue = $event"
              @delete-item="handleDeleteItem"
              @add-item="handleAddItem"
              :empty-title="editSelect.selectedValue || '그룹 불러오기'"
            >
              <template #custom-option="{ value, selectItem }">
                <div class="option-list type01">
                  <ul class="custom-scr">
                    <li v-for="item in editSelect.items" :key="item.value" class="pl-30">
                      <HiButton color="link" class="prepend" @click="handleDeleteItem(item)">
                        <HiIcon name="ico-minus3" color="white" bgColor="info" size="10" rounded="rounded"></HiIcon>
                      </HiButton>
                      <HiButton color="link" class="item" :class="{ 'is-selected': item.value === value }" @click="selectItem(item)">
                        {{ item.title }}
                      </HiButton>
                      <HiButton color="link" class="append" @click="handleDeleteItem(item)">
                        <HiIcon name="ico-delete" color="disabled" size="20"></HiIcon>
                      </HiButton>
                    </li>
                  </ul>
                </div>
              </template>
            </HiSelectBox>
          </div>
          <div class="col-sm-4">
            <HiSelectBox
              class="mr-10"
              :value="formattedSelectedValues"
              :items="usage01.item"
              
              @delete-item="handleDeleteItem"
              @add-item="handleAddItem"
              :empty-title="formattedSelectedValues || '게시판 리스트 옵션'"
            >
              <template #custom-option>
                <div class="board-list">
                  <div class="board" v-for="item of usage01.item" :key="`board-list-${item.boardId}`">
                    <p
                      class="board-name"
                      :class="{
                        on: usage01.chkMoveObj.boardId.includes(item.boardId),
                      }"
                    >
                      <span class="title" v-if="item.folderCount > 0">{{ item.boardName }}</span>
                      <span class="title" v-else>
                        <input type="checkbox" name="move-board-chk" :id="`chk-board-${item.boardId}`" :value="item.boardId" v-model="usage01.chkMoveObj.boardId" />
                        <label :for="`chk-board-${item.boardId}`">
                          <span class="chk-title">{{ item.boardName }}</span>
                        </label>
                      </span>
                      <span class="auth">읽기({{ getAuth(item) }})</span>
                    </p>
                    <ul v-if="item.folderCount > 0">
                      <li
                        v-for="folderItem of item.folderList"
                        :key="`folder-list-${folderItem.folderId}`"
                        :class="{
                          on: usage01.chkMoveObj.folderId.includes(folderItem.folderId),
                        }"
                      >
                        <span class="check">
                          <input type="checkbox" name="move-board-chk" :id="`chk-folder-${folderItem.folderId}`" :value="folderItem.folderId" v-model="usage01.chkMoveObj.folderId" />
                          <label :for="`chk-folder-${folderItem.folderId}`">
                            <span class="chk-title"><i :style="`background: ${folderItem.color};`"></i>{{ folderItem.folderName }}</span>
                          </label>
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </template>
            </HiSelectBox>
          </div>
        </div>
      </section> -->
    </div>
    <div class="ctrArea">
      <div class="optArea">
        <div class="elArea">
          <HiSelectBox
            v-if="propsVal.type === 'default'"
            class="w100"
            :class="propsVal.position === '' ? '' : 'opt-' + propsVal.position "
            :value="defaultSelect.selectedValue"
            :items="defaultSelect.items"
            @update:value="defaultSelect.selectedValue = $event"
            :empty-title="defaultSelect.selectedValue || 'Default Type'"
            :disabled="propsVal.disabled === true"
          />
          <HiSelectBox 
            v-if="propsVal.type === 'multiple'"
            class="w100" 
            :class="propsVal.position === '' ? '' : 'opt-' + propsVal.position "
            :value="multiSelect.selectedValues" 
            :items="multiSelect.items" 
             
            :empty-title="multiSelect.selectedValues.join(', ') || 'Multiple Option'"            
            :disabled="propsVal.disabled === true"
            >
            <template #custom-option>
              <div class="option-list">
                <ul>
                  <li v-for="item in multiSelect.items" :key="item.value">
                    <input type="checkbox" :id="`check-${item.value}`" :value="item.value" v-model="multiSelect.selectedValues" />
                    <label :for="`check-${item.value}`"
                      ><span>{{ item.title }}</span></label
                    >
                  </li>
                </ul>
              </div>
            </template>
          </HiSelectBox>          
          <HiSelectBox 
            v-if="propsVal.type === 'dropdown'"
            class="w100" 
            :class="propsVal.position === '' ? '' : 'opt-' + propsVal.position "
            :value="defaultSelect.selectedValue" 
            :items="defaultSelect.items" 
            @update:value="defaultSelect.selectedValue = $event" 
            selectBoxType="dropdown" 
            :disabled="propsVal.disabled === true">
            <template #btnType> <HiIcon name="ico-chart" color="black" size="18" /> DropDown </template>
          </HiSelectBox>
        </div>
        <ul class="propArea">
          <li>
            <label>TYPE</label>
            <hi-select-box :value="propsVal.type" @update:value="propsVal.type = $event" :items="propsOpt.type" empty-title="Default" />
          </li>
          <li>
            <label>OPT POSITION</label>
            <hi-select-box :value="propsVal.position" @update:value="propsVal.position = $event" :items="propsOpt.position" empty-title="OPT POSITION" />
          </li>
          <li>
            <label>DISABLED</label>
            <hi-switch v-model="propsVal.disabled" @update:model="propsVal.disabled = $event" />
          </li>
        </ul>
      </div>
      <div class="codeArea">
        <pre>
          <code v-html="generatedCode"></code>
        </pre>
      </div>
    </div>
  </article>
</template>

<script>
import board from "@/dev/designSystem/assets/js/board.js"
export default {
  name: "FormSys",
  data() {
    return {
      //기본 선택박스 데이터
      defaultSelect: {
        selectedValue: "",
        items: [
          { value: "기본옵션1", title: "기본옵션1" },
          { value: "기본옵션2", title: "기본옵션2" },
          { value: "기본옵션3", title: "기본옵션3" },
          { value: "기본옵션4", title: "기본옵션4" },
        ],
      },
      //다중 옵션 데이터
      multiSelect: {
        selectedValues: [],
        items: [
          { value: "다중옵션1", title: "다중옵션1" },
          { value: "다중옵션2", title: "다중옵션2" },
          { value: "다중옵션3", title: "다중옵션3" },
          { value: "다중옵션4", title: "다중옵션4" },
        ],
      },
      //옵션 편집 데이터
      editSelect: {
        selectedValue: "",
        items: [
          { value: "옵션1", title: "옵션1" },
          { value: "옵션2", title: "옵션2" },
          { value: "옵션3", title: "옵션3" },
          { value: "옵션4", title: "옵션4" },
        ],
      },
      usage01: {
        chkMoveObj: {
          boardId: [], // 체크박스 선택된 항목을 저장하기 위한 배열
          folderId: [], // 폴더 항목을 저장하기 위한 배열
        },
        item: board.list,
      },

      propsVal: {
        type: "default",
        position: "default",
        disabled: false,
      },
      propsOpt: {
        type: [
          { value: "default", title: "default" },
          { value: "multiple", title: "multiple" },
          { value: "dropdown", title: "dropdown" },
        ],
        position: [
          { value: "default", title: "default" },
          { value: "top", title: "top" },
          { value: "left", title: "left" },
          { value: "right", title: "right" },
        ],
      },
    };
  },
  methods: {
    //옵션 삭제
    handleDeleteItem(item) {
      this.editSelect.items = this.editSelect.items.filter((i) => i.value !== item.value);
    },

    //옵션 추가
    handleAddItem() {
      const newValue = this.editSelect.items.length * 5 + 10; // 새로운 값을 계산하여 추가
      const newItem = { value: newValue, title: `${newValue}시` };
      this.editSelect.items.push(newItem);
      console.log(`추가된 아이템: ${newItem.title}`);
    },

    getAuth(item) {
      if (!item.isReadParents && !item.isReadStudent) {
        return "권한없음";
      } else if (item.isReadParents && item.isReadStudent) {
        return "학부모, 학생";
      } else if (item.isReadParents) {
        return "학부모";
      } else if (item.isReadStudent) {
        return "학생";
      }
    },
  },
  computed: {
    formattedSelectedValues() {
      const selectedBoards = this.usage01.item.filter((board) => this.usage01.chkMoveObj.boardId.includes(board.boardId)).map((board) => board.boardName);
      const selectedFolders = this.usage01.item.flatMap((board) =>
        board.folderList.filter((folder) => this.usage01.chkMoveObj.folderId.includes(folder.folderId)).map((folder) => `${board.boardName} > ${folder.folderName}`)
      );
      const combinedValues = [...selectedBoards, ...selectedFolders].join(", ");
      return combinedValues;
    },

    generatedCode() {
      // Generate class list for the button element
      const classes = [
        this.propsVal.position === '' || this.propsVal.position === 'default' ? '' : `class="opt-${this.propsVal.position}"`,
      ].filter(Boolean).join(" ");
      const selectDisabled = [this.propsVal.disabled ? `disabled` : ""].filter(Boolean).join(" ");

      const defaultType = `
        &lt;HiSelectBox  ${classes}
          :value="defaultSelect.selectedValue"
          :items="defaultSelect.items"
          @update:value="defaultSelect.selectedValue = $event"
          :empty-title="defaultSelect.selectedValue || 'Default Type'"
          ${selectDisabled}
        /&gt;

        data() {
          return {
            defaultSelect: {
              selectedValue: "",
              items: [
                { value: "기본옵션1", title: "기본옵션1" },
                { value: "기본옵션2", title: "기본옵션2" },
                { value: "기본옵션3", title: "기본옵션3" },
                { value: "기본옵션4", title: "기본옵션4" },
              ],
            }
          }
        }
      `
      const customType = `        
        &lt;HiSelectBox ${classes}
          :value="defaultSelect.selectedValue"
          :items="defaultSelect.items"
          :empty-title="defaultSelect.selectedValue || 'Default Type'"
          ${selectDisabled}
          &gt;
          &lt;template #btnType&gt;
            &lt;HiIcon name="ico-chart" color="black" size="18" /&gt; DropDown 
          &lt;/template&gt;
          &lt;template #custom-option&gt;
            &lt;div class="option-list"&gt;
              &lt;ul&gt;
                &lt;li v-for="item in defaultSelect.items" :key="item.value"&gt;
                &lt;a :href="'http://abc.com/abc' + item.value" :alt="item.title";&gt;
                  {{ item.title }}
                &lt;/a&gt;
              &lt;/ul&gt;
            &lt;/div&gt;
          &lt;/template&gt;
        &lt;/HiSelectBox&gt;

        data() {
          return {
            defaultSelect: {
              selectedValue: "",
              items: [
                { value: "기본옵션1", title: "기본옵션1" },
                { value: "기본옵션2", title: "기본옵션2" },
                { value: "기본옵션3", title: "기본옵션3" },
                { value: "기본옵션4", title: "기본옵션4" },
              ],
            }
          }
        }
      `
      const multipleType = `        
        &lt;HiSelectBox ${classes}
          :value="multiSelect.selectedValues"             
          :items="multiSelect.items" 
          :empty-title="multiSelect.selectedValues.join(', ') || 'Multiple Option'"   
          ${selectDisabled}
          &gt;
          &lt;template #custom-option&gt;
            &lt;div class="option-list"&gt;
              &lt;ul&gt;
                &lt;li v-for="item in multiSelect.items" :key="item.value"&gt;
                  &lt;input 
                    type="checkbox" 
                    :id="'check-' + item.value" 
                    :value="item.value" 
                    v-model="multiSelect.selectedValues" 
                  /&gt;
                  &lt;label :for="'check-' + item.value"&gt;
                    &lt;span&gt;{{ item.title }}&lt;/span&gt;
                  &lt;/label&gt;
                &lt;/li&gt;
              &lt;/ul&gt;
            &lt;/div&gt;
          &lt;/template&gt;
        &lt;/HiSelectBox&gt;

        data() {
          return {
            multiSelect: {
              selectedValues: [],
              items: [
                { value: "다중옵션1", title: "다중옵션1" },
                { value: "다중옵션2", title: "다중옵션2" },
                { value: "다중옵션3", title: "다중옵션3" },
                { value: "다중옵션4", title: "다중옵션4" },
              ],
            },
          }
        }
      `
      return this.propsVal.type === 'multiple' ? multipleType 
      :this.propsVal.type === 'default' ? defaultType : customType ;
 
    },
  },
};
</script>
<style lang="scss" scoped>
.formSys {
  .hi-selectbox {
    width: 100%;
  }
}
</style>
