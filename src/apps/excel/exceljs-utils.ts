import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { head } from 'lodash';


const ExcelSettingsBuilder = {
   with(): ExcelSettings {
      const workbook = new ExcelJS.Workbook();
      return new ExcelSettings(workbook);
   },
}

class ExcelSettings {
   workbook: ExcelJS.Workbook
   worksheet: ExcelJS.Worksheet | null

   constructor(wb: ExcelJS.Workbook) {
      this.workbook = wb;
      this.worksheet = null;
   }

   addSheet(sheetName: string): ExcelSettings {
      this.worksheet = this.workbook.addWorksheet(sheetName);
      return this
   }

   setHeaders(headers: string[]) {
      if(this.worksheet) {
         this.worksheet.addRow(headers);
         const headerRow = this.worksheet.getRow(1);
         headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'cccccc' }
        };
        headerRow.font = {
            bold: true,
            color: { argb: '000000' }
        };
        headerRow.height = 15;
        headerRow.alignment = { horizontal: "center", vertical: "middle"  };
      }
   }

   addRows(data: any[][]) {
      data.forEach(item => {
         this.worksheet?.addRow(item);
      });
   }

   applyAutoFitWithMax(rules: Record<number, { fixed?: number; max?: number }>) {
      if(this.worksheet) {
         const columnCount = this.worksheet.columnCount; 
    
         for (let col = 1; col <= columnCount; col++) {
            const column = this.worksheet.getColumn(col);

            const rule = rules[col];
        
            if (rule?.fixed !== undefined) {
              column.width = rule.fixed;
              continue;
            }
        
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, (cell) => {
              const value = cell.value ? cell.value.toString() : "";
              maxLength = Math.max(maxLength, value.length);
            });
        
            let width = maxLength + 2;
        
            if (rule?.max !== undefined) {
              width = Math.min(width, rule.max);
            }
            column.width = width;
         }
      }
   }

   withClassroomReport() {
      this.worksheet?.eachRow({ includeEmpty: true }, function(row, rowNumber) {
         if(rowNumber > 1) {
            let isGoodRow = false;
            row.eachCell({ includeEmpty: true }, function(cell, colNumber) {
               if(colNumber === 3 && cell.value === '좋음') {
                  isGoodRow = true;
               } else if(colNumber === 3 && cell.value === '노력') {
                  isGoodRow = false;
               }
   
               if(colNumber === 3 || colNumber === 4 || colNumber === 5) {
                  if(isGoodRow) {
                     cell.font = { color: { argb: 'FF3987f8' } };
                  } else {
                     cell.font = { color: { argb: 'FFf95f6e' } };
                  }
               }
            });
            row.height = 17;
         }
      });
   }
   
   async export(filename: string) {
      const buffer = await this.workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `${filename}.xlsx`);
   }
}

export { 
   ExcelSettingsBuilder, ExcelSettings
};
