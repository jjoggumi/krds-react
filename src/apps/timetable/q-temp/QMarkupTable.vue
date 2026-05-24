<template>
  <div class="q-markup-table-wrapper">
    <table class="q-markup-table" :class="tableClasses">
      <thead>
        <tr>
          <slot name="header">
            <th
              v-for="(header, index) in headers"
              :key="index"
              :class="['q-markup-table__header', header.align || 'left']"
            >
              {{ header.label }}
            </th>
          </slot>
        </tr>
      </thead>
      <tbody>
        <slot name="body">
          <tr
            v-for="(row, rowIndex) in rows"
            :key="rowKey(row, rowIndex)"
            :class="['q-markup-table__row', rowClass(row, rowIndex)]"
          >
            <td
              v-for="(header, colIndex) in headers"
              :key="colIndex"
              :class="['q-markup-table__cell', header.align || 'left']"
            >
              {{ row[header.field] }}
            </td>
          </tr>
        </slot>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'QMarkupTable',
  props: {
    rows: {
      type: Array,
      required: true
    },
    headers: {
      type: Array,
      required: true
    },
    dense: {
      type: Boolean,
      default: false
    },
    flat: {
      type: Boolean,
      default: false
    },
    bordered: {
      type: Boolean,
      default: false
    },
    square: {
      type: Boolean,
      default: false
    },
    separator: {
      type: String,
      default: 'horizontal', // 'horizontal', 'vertical', 'cell', 'none'
      validator: (value) =>
        ['horizontal', 'vertical', 'cell', 'none'].includes(value)
    },
    rowKey: {
      type: Function,
      default: (row, index) => index
    },
    rowClass: {
      type: Function,
      default: () => ''
    }
  },
  computed: {
    tableClasses() {
      return {
        'q-markup-table--dense': this.dense,
        'q-markup-table--flat': this.flat,
        'q-markup-table--bordered': this.bordered,
        'q-markup-table--square': this.square,
        [`q-markup-table--separator-${this.separator}`]: true
      };
    }
  }
};
</script>

<style scoped>
.q-markup-table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.q-markup-table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  font-size: 14px;
  text-align: left;
}

.q-markup-table th,
.q-markup-table td {
  padding: 8px;
  border: 1px solid #e0e0e0;
}

.q-markup-table th {
  background-color: #f5f5f5;
  font-weight: bold;
}

.q-markup-table--dense th,
.q-markup-table--dense td {
  padding: 4px;
}

.q-markup-table--flat th,
.q-markup-table--flat td {
  border: none;
}

.q-markup-table--bordered th,
.q-markup-table--bordered td {
  border: 1px solid #ccc;
}

.q-markup-table--square th,
.q-markup-table--square td {
  border-radius: 0;
}

.q-markup-table--separator-horizontal th,
.q-markup-table--separator-horizontal td {
  border-bottom: 1px solid #ccc;
}

.q-markup-table--separator-vertical th,
.q-markup-table--separator-vertical td {
  border-right: 1px solid #ccc;
}

.q-markup-table--separator-cell th,
.q-markup-table--separator-cell td {
  border: 1px solid #ccc;
}

.q-markup-table--separator-none th,
.q-markup-table--separator-none td {
  border: none;
}
</style>