<!--
@File(Method): TimeTableModal.vue
@Date Created: 2025-05-12
@Description: 타임테이블 공통 모달 컴포넌트
-->
<template>
  <div :class="classList">
    <div class="modal__dim " @click="dimClose && closeModal()"></div>
    <div class="modal__layer">
      <div class="modal__header">
        <h2 class="heading" v-if="$scopedSlots['heading']">
          <slot name="heading"></slot>
        </h2>
        <button class="btn-close" @click="closeModal"></button>
      </div>
      <div class="modal__content"  v-if="$scopedSlots['content']"> 
        <slot name="content"></slot>
      </div>
      <template v-if="$scopedSlots['footer']">
        <div class="modal__footer">
          <slot name="footer"></slot>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: "TimeTableModal",
  props: {
    size: { type: String, default: null },
    closeSkip: { type: Boolean, default: false },
    dimClose: { type: Boolean, default: false }
  },
  data() {
    return {};
  },
  computed: {
    classList() {
      const className = ["timetable-modal-common"];
      this.size ? className.push(`modal-${this.size}`) : null;
      this.closeSkip ? className.push("title-close-skip") : null;
      return className.join(" ");
    }
  },
  methods: {
    closeModal() {
      this.$emit('close');
    },
    updateBodyClass() {
      const modalElements = document.querySelectorAll('.timetable-modal-common');
      if (modalElements.length > 0) {
        // 하나 이상의 'timetable-modal-common'이 있는 경우에만 'hidden' 클래스를 추가
        document.body.classList.add('hidden');
      } else {
        // 'timetable-modal-common' 클래스가 더 이상 없다면 'hidden' 클래스를 제거
        document.body.classList.remove('hidden');
      }
    }
  },
  mounted() {
    if (this.type !== 'main') {
      this.updateBodyClass(); // 모달이 열릴 때 'hidden' 클래스 적용
    }
  },
  beforeDestroy() {    
    if (this.type !== 'main') {
      this.updateBodyClass(); // 모달이 닫힐 때 'hidden' 클래스 제거
    }
  }
};
</script>
<style scoped lang="scss">
.timetable-modal-common {
	display: grid;
  place-items: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.4);
  overflow: auto;

	& ::-webkit-scrollbar {
    background-color: transparent;
    width: 10px;
		height: 10px;
  }
  & ::-webkit-scrollbar-thumb {
		background-color: #cfd3db;
		background-clip: padding-box;
		min-height:40px;
		border: 2px solid transparent;
		border-radius: 10px;
  }
  & ::-webkit-scrollbar-track { background-color: transparent; }
  
	.modal__dim {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0);
	}
	.modal__layer {
		position: relative;
		overflow: auto;
		display: inline-flex;
    flex-flow: column;
		width: 400px;
		max-height: calc(100% - 60px);
		padding: 44px 32px 24px 32px;	
		//padding: 44px 40px 40px 40px;	
		vertical-align: middle;
		background-color: #fff;
		border-radius: 12px;
		box-shadow: 0 10px 40px 0 rgba(0, 0, 0, 0.3);
		border: 1px solid transparent; // 렌더링 안정화
		will-change: transform, opacity; // GPU 힌트
	} 
	.modal__header { 
		.heading {
			color: var(--font-color);
			font-size: 20px; 
			line-height: 144%;
			letter-spacing: -0.5px; 
			text-align: left;
			font-weight: 700;
			.smr{
				color: var(--gray-09);
				font-size: 15px;    
				font-weight: var(--font-normal);
				line-height: 160%;
				margin-top: 4px;
			}
		}
		.btn-close {
			position: absolute;
			top: 24px;
			right: 24px;
			width: 20px;
			height: 20px;
			background-color: var(--gray-09);
			mask-image: url(~@/assets/img/timetable/ico-close.svg);
			mask-size: cover;

		}
	}
	.modal__content {
		margin-top: 16px;
		flex-grow: 1;
    overflow-y: auto;
    overflow-x: hidden;
	}
	.modal__header + .modal__footer {
		margin-top: 16px;
	}
	.modal__content + .modal__footer {
		margin-top: 20px;  
	}
	.modal__footer{  
		display: flex;
		justify-content: flex-end;
		button + button{margin-left:8px;}
	}    
	&.modal-xxs .modal__layer{width:100%;max-width:360px;}
	&.modal-xs .modal__layer{width:100%;max-width:488px;}
	&.modal-sm .modal__layer{width:100%;max-width:760px;}
	&.modal-md .modal__layer{
		width:100%;max-width:952px;	
		padding: 44px 40px 32px 40px;	
	}
	&.modal-lg .modal__layer{
		width:100%;max-width:1220px;	
		padding: 44px 40px 32px 40px;	
	}
	&.modal-xl .modal__layer{
		width:100%;max-width:1662px;	
		padding: 44px 40px 32px 40px;	
	}
	&.modal-xxl .modal__layer{
		width:100%;max-width:1848px;	
		padding: 44px 40px 32px 40px;	
	}
	&.modal-full .modal__layer{
		width: 100%;
		height: 100%;
		border-radius: 0;
		.modal__content{ 
			min-height: calc(100% - 140px);
		}
	}

	// 상단 닫기버튼 스킵
	&.title-close-skip{
		.modal__header .btn-close{display:none;}
	}
}
</style>