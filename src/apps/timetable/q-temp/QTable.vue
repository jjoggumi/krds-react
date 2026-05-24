<template>
  <div class="q-table">
    <!-- 테이블 헤더 -->
    <table class="q-table__table">
      <thead>
        <tr>
          <th v-if="selection" class="q-table__selection">
            <input
              type="checkbox"
              :checked="allRowsSelected"
              @change="toggleSelectAll"
            />
          </th>
          <th
            v-for="col in columns"
            :key="col.name"
            :class="['q-table__header', col.align && `text-${col.align}`]"
            @click="col.sortable ? toggleSort(col) : null"
          >
            {{ col.label }}
            <span v-if="col.sortable" class="q-table__sort-icon">
              {{ getSortIcon(col) }}
            </span>
          </th>
        </tr>
      </thead>

      <!-- 테이블 바디 -->
      <tbody>
        <tr
          v-for="row in computedRows"
          :key="row[rowKey].id"
          @click="emitRowClick(row)"
          class="q-table__row"
        >
          <td v-if="selection" class="q-table__selection">
            <input
              type="checkbox"
              :checked="isRowSelected(row)"
              @change="toggleRowSelection(row)"
            />
          </td>
          <td
            v-for="col in columns"
            :key="col.name"
            :class="['q-table__cell', col.align || 'left']"
          >
            <slot :name="`body-${col.name}`" :row="row" :col="col">
              {{ row[col.name] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 빈 데이터 메시지 -->
    <div v-if="computedRows.length === 0" class="q-table__no-data">
      <slot name="no-data">No data available</slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QTable',
  props: {
    rows: {
      type: Array,
      required: true
    },
    columns: {
      type: Array,
      required: true
    },
    rowKey: {
      type: String,
      default: "id"
    },
    selection: {
      type: Boolean,
      default: false
    },
    selected: {
      type: Array,
      default: () => []
    },
    sortMethod: {
      type: Function,
      default: (a, b, col) => {
        if (a[col.field] < b[col.field]) return -1;
        if (a[col.field] > b[col.field]) return 1;
        return 0;
      }
    }
  },
  data() {
    return {
      sortBy: null,
      sortOrder: 'asc' // 'asc' or 'desc'
    };
  },
  computed: {
    computedRows() {
      let sortedRows = [...this.rows];
      
      if (this.sortBy) {
        sortedRows.sort((a, b) => {
          const result = this.sortMethod(a, b, this.sortBy);
          return this.sortOrder === 'asc' ? result : -result;
        });
      }
      return sortedRows;
    },
    allRowsSelected() {
      return (
        this.rows.length > 0 &&
        this.rows.every((row) => this.selected.includes(this.rowKey(row)))
      );
    }
  },
  methods: {
    toggleSort(col) {
      if (this.sortBy === col) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortBy = col;
        this.sortOrder = 'asc';
      }
    },
    getSortIcon(col) {
      if (this.sortBy !== col) return '';
      return this.sortOrder === 'asc' ? '▲' : '▼';
    },
    toggleSelectAll() {
      if (this.allRowsSelected) {
        this.$emit('update:selected', []);
      } else {
        const allKeys = this.rows.map(this.rowKey);
        this.$emit('update:selected', allKeys);
      }
    },
    toggleRowSelection(row) {
      const key = this.rowKey(row);
      const selected = [...this.selected];
      const index = selected.indexOf(key);
      if (index === -1) {
        selected.push(key);
      } else {
        selected.splice(index, 1);
      }
      this.$emit('update:selected', selected);
    },
    isRowSelected(row) {
      return this.selected.includes(this.rowKey(row));
    },
    emitRowClick(row) {
      this.$emit('row-click', row);
    }
  }
};
</script>

<style scoped>
.q-table {
  width: 100%;
  border-collapse: collapse;

}

.q-table__table {
  width: 100%;
  border-collapse: collapse;
  background-color: #fff;
}

.q-table--horizontal-separator thead th, .q-table--horizontal-separator tbody tr:not(:last-child) > td, .q-table--cell-separator thead th, .q-table--cell-separator tbody tr:not(:last-child) > td {
    border-bottom-width: 1px;
}

.q-table__table th, .q-table__table td {
    padding: 7px 16px;
    background-color: inherit;
}


.q-table__table thead, .q-table__table tr, .q-table__table th, .q-table__table td {
    border-color: rgba(0, 0, 0, 0.12);
}

.q-table__table thead tr, .q-table__table tbody td {
    height: 48px;
}

.q-table__table thead, .q-table__table td, .q-table__table th {
    border-style: solid;
    border-width: 0;
}

.q-table__header {
  cursor: pointer;
  /* text-align: left; */
  padding: 8px;
  border-bottom: 1px solid #eee !important;
}

.q-table__row {
  cursor: pointer;
  border-bottom: 1px solid #eee;
}

.q-table__cell {
  padding: 8px;
  border-bottom: 1px solid #eee;
}

.q-table__selection {
  text-align: center !important;
  width: 40px;
}

.q-table__no-data {
  text-align: center;
  padding: 16px;
  color: #999;
}

.q-table__sort-icon {
  margin-left: 8px;
  font-size: 12px;
}
</style>