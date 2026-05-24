<template>
  <button v-on:click="generate">
    <slot>
      다운로드(CSV)
    </slot>
  </button>
</template>

<script>
import XLSX from 'xlsx'
import download from 'downloadjs'

export default {
  name: 'HcJsonDown',
  props: {
    type: {
      type: String,
      default: 'xlsx'
    },
    data: {
      type: Array,
      required: true
    },
    cols: {
      type: Array,
      required: true
    },
    name: {
      type: String
    },
    isSkipHeader: {
      type: Boolean,
      default: false
    },
    rowNum: {
      type: Boolean,
      default: true
    },
    isCellTextFomat: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    downloadCols() {
      if (this.cols !== undefined)
        return this.cols
      else
        return null
    },
    downloadData() {
      if (this.data !== undefined)
        return this.data
      else
        return null
    }
  },
  methods: {
    generate() {
      // if (!this.downloadData.length) {
      //   alert('조회 결과가 없습니다.')
      //   return
      // }

      const datas = this.getProcessedJson(this.downloadData, this.downloadCols)
      const wscols = []
      if (this.rowNum) {
        wscols.push({
          wpx: 50
        })
      }
      Object.keys(datas.wscols).forEach(key => {
        wscols.push({
          wch: datas.wscols[key] + 5
        })
      })
      var ws = XLSX.utils.json_to_sheet(datas.data, {
        skipHeader: this.isSkipHeader
      })
      ws['!cols'] = wscols

      if (this.isCellTextFomat) {
        var range = XLSX.utils.decode_range(ws['!ref'])
        for (var r = range.s.r; r <= range.e.r; r++) {
          for (var c = range.s.c; c <= range.e.c; c++) {
            var cellName = XLSX.utils.encode_cell({c: c, r: r})
            ws[cellName].z = '@'
          }
        }
      }
      
      var wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
      var wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' })
      download(
        new Blob([this.s2ab(wbout)], { type: 'application/octet-stream' }),
        `${this.name}.${this.type}`
      )
    },
    s2ab(s) {
      var buf = new ArrayBuffer(s.length)
      var view = new Uint8Array(buf)
      for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xff
      return buf
    },
    getProcessedJson(data, cols) {
      let newData = {
        data: [],
        wscols: {}
      }

      data.map(item => {
        let newItem = {}

        if (this.rowNum) {
          newItem['No.'] = this.downloadData.length - data.indexOf(item)
        }

        cols.map(col => {
          let val = item[col.prop]
          let label = col.label
          if (typeof val === undefined || val === null) {
            val = ''
          }
          newItem[label] = val + ''

          // width
          if (typeof val !== 'undefined' && val !== null) {
            if (val.length > (newData.wscols[label] || 0)) {
              newData.wscols[label] = val.length
            }
          }
        }, {})
        newData.data.push(newItem)
      })

      return newData
    }
  }
}
</script>
