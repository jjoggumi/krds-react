<template>
    <!-- <table style="visibility:hidden;" ref="recordExcelTable">
        <colgroup>
            <col style="width: 168px;" />
            <col style="width: 232px;" />
            <col style="width: 232px;" />
            <col />
        </colgroup>
        <thead>
            <tr>
                <th colspan="4">{{ data.params.targetName }}</th>
            </tr>
            <tr>
                <th colspan="4">{{ data.params.date }}</th>
            </tr>
            <tr>
                <th>일자</th>
                <th>태그</th>
                <th>대상</th>
                <th>기록내용</th>
            </tr>
        </thead>
        <tbody>
            <template v-for="(item, index) of data.list">
                <tr :key="item.recordId">
                    <td>{{ $moment(item.recordTimestamp).format('YYYY년 M월 D일') }}</td>
                    <td>{{ tagNames(index) }}</td>
                    <td>{{ targetNames(index) }}</td>
                    <td>{{ note(item.recordContent) }}</td>
                </tr>
            </template>
        </tbody>
    </table>     -->
    <div></div>
</template>

<script>
import XLSX from "xlsx";
export default {
    name: 'record-excel-table',
    props: {
        data: Object
    },
    methods: {
        tagNames: function(idx) {
            if(!this.data.list[idx].tags || this.data.list[idx].tags.length  === 0) {
                return '-'
            }
            return this.data.list[idx].tags.map(t => t.tagName).join(', ')
        },
        targetNames: function(idx) {
            if(!this.data.list[idx].targetNames || this.data.list[idx].targetNames.length  === 0) {
                return '-'
            }
            return this.data.list[idx].targetNames.join(', ')
        },
        download() {
            const all = this.data.params.isAll ? '전체_' : ''
            const ele = this.$refs.recordExcelTable
            const workBook = XLSX.utils.book_new()
            const workSheet = XLSX.utils.table_to_sheet(ele, {raw: true});
            XLSX.utils.book_append_sheet(workBook, workSheet)
            XLSX.writeFile(workBook, `${this.data.params.targetName}_${all}${this.$moment().format('YYYYMMDD')}.xlsx`)
            this.$nextTick(() => this.$emit('complete'))      
        },
        excelDownload() {
            const all = this.data.params.isAll ? '전체_' : ''

            // this.headerKeyList = [
            //     {
            //         key: 'recordTimestamp',
            //         name: '일자'
            //     },
            //     {
            //         key: 'tagNames',
            //         name: '태그'
            //     },
            //     {
            //         key: 'targetNames',
            //         name: '대상'
            //     },
            //     {
            //         key: 'recordContent',
            //         name: '기록내용'
            //     },
            // ]

            // 항목용 배열 
            let headerNameList = ['일자', '태그', '대상', '기록내용', '작성일시']
            // this.headerKeyList.forEach(headerItem => {
            //     Object.keys(headerItem).forEach(item => {
            //         if (item === 'name') {
            //             headerNameList.push(headerItem[item])
            //         }
            //     })
            // })

            // 응답데이터로 엑셀데이터
            let excelData = []
            excelData.push([this.data.params.targetName])
            excelData.push([this.data.params.date])
            excelData.push(headerNameList)

            // 내용 배열 
            this.data.list.map((item, index) => {
                let row = Array.from({
                    length: 5,
                    0: this.$moment(item.recordTimestamp).format('YYYY년 M월 D일'),
                    1: this.tagNames(index),
                    2: this.targetNames(index),
                    3: item.recordContent,
                    4: this.$moment(item.insertedTimestamp).format('YY.MM.DD HH:mm')
                })
                excelData.push(row)
            })

            const workSheet = XLSX.utils.aoa_to_sheet(excelData)
            const workBook = XLSX.utils.book_new()
            workSheet['!merges'] = [
                { s: {c: 0, r:0}, e: { c:4, r:0 } },
                { s: {c: 0, r:1}, e: { c:4, r:1 } }
            ]
            XLSX.utils.book_append_sheet(workBook, workSheet)
            XLSX.writeFile(workBook, `${this.data.params.targetName}_${all}${this.$moment().format('YYYYMMDD')}.xlsx`)
            this.$nextTick(() => this.$emit('complete'))   
        }
    },
    mounted() {
        // this.download()
        this.excelDownload()
    }
}
</script>

<style>

</style>