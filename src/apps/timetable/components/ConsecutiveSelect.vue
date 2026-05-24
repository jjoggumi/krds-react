<template>        
  <HiSelectBox 
    class="mr-10 selectbox-wrap sm"
    :class="{'error': false, 'has-selected': !(consecutivePeriod?.label === '') }"
    :value="consecutivePeriod?.label"
    :items="getConsecutiveOptions(maxPeriodCount).map(opt => ({
      title: opt?.label,
      value: opt?.value,
    }))"
    :disabled="disabled"
    @update:value="handleChangeConsucutivePeriod($event)"
    :empty-title="consecutivePeriod?.label === '' ? '선택' : consecutivePeriod?.label" 
  />
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, PropType } from 'vue';
import { TimetableDataUtils } from '@/apps/timetable/core/mod/utils';
import { ConsecutivePeriodOption } from '@/apps/timetable/core/types';

// defineOptions({  name: 'ConsecutiveSelect',});

// const props = defineProps<{
//   initValue: string;
//   periodCount: number;
//   disabled?: {
//     type: boolean;
//     default: false;
//   };
//   onChange: (value: string) => void;
// }>();

const props = defineProps({
  initValue:    { type: String,  required: true },
  periodCount:  { type: Number,  required: true },
  disabled:     { type: Boolean, default: false },
  isConsecutiveTab: { type: Boolean, default: false },
  onChange:     { type: Function as PropType<(v: string) => void>, required: true },
} as const)

const consecutivePeriod = ref<ConsecutivePeriodOption>({
  label: '',
  value: '',
  numbers: [],
});

onMounted(() => {
  init();
});

/*
watch(consecutivePeriod, (newVal) => {
  console.log('consecutivePeriod --->', newVal.value);

  props.onChange && props.onChange(newVal.value);
});
*/

watch(
  () => props.initValue,
  (newVal) => {
    if (newVal === consecutivePeriod.value.value) {
      return;
    }
    resetWithInitValue();
  }
);

const init = () => {
  const foundOpt = getConsecutiveOptions(maxPeriodCount.value).find(
      (opt) => opt.value === props.initValue
    );
  consecutivePeriod.value = 
    foundOpt ? foundOpt : {label: '', value: '', numbers: []};
}

const handleChangeConsucutivePeriod = (
  newVal: string
) => {
  props.onChange && props.onChange(newVal);
};

const maxPeriodCount = computed(() => {
  return props.periodCount ? props.periodCount : 1;
});

const resetWithInitValue = () => {
  const opts = getConsecutiveOptions(maxPeriodCount.value).find(
      (opt) => opt.value === props.initValue
    );

  consecutivePeriod.value =
    opts ? opts : consecutivePeriod.value;
};

const getConsecutiveOptions = (
  periodCount: number
): ConsecutivePeriodOption[] => {
  const options =
    TimetableDataUtils.getConsecutivePeriodsWithMaxPeriod(periodCount);
  return !props.isConsecutiveTab ? [
    { label: '없음', value: '', numbers: [] } as ConsecutivePeriodOption,
    ...options,
  ] : options;
};
</script>
<style scoped lang="scss">
.hi-selectbox{
  ::v-deep .option__layer{
    width: 120px;
  }
}
</style>