import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

const ExcelJsUtils = {
  // 엑셀 컬럼 인덱스를 A, B, ..., Z, AA, AB, ... 형식으로 변환
  columnIndexToLetter: (index: number): string => {
    // index는 1부터 시작
    index -= 1;
    
    let letter = '';
    while (index >= 0) {
      letter = String.fromCharCode((index % 26) + 65) + letter;
      index = Math.floor(index / 26) - 1;
    }
    return letter;
  },

  middleCenterAlignment (): ExcelJS.Alignment {
    return { vertical: 'middle', horizontal: 'center' } as ExcelJS.Alignment;
  },

  middleRightAlignment (): ExcelJS.Alignment {
    return { vertical: 'middle', horizontal: 'right' } as ExcelJS.Alignment;
  },

  borderThin (argb: string = 'FF000000'): ExcelJS.Border {
    return { style: 'thin', color: { argb } } as ExcelJS.Border;
  },

  borderThick (argb: string = 'FF000000'): ExcelJS.Border {
    return { style: 'thick', color: { argb } } as ExcelJS.Border;
  },

  borderThinTBRL(argb: string = 'FF000000'): ExcelJS.Borders {
    return {
      top: this.borderThin(argb),
      right: this.borderThin(argb),
      bottom: this.borderThin(argb),
      left: this.borderThin(argb),
    } as ExcelJS.Borders;
  },

  borderThinT_RL(argb: string = 'FF000000'): ExcelJS.Borders {
    return {
      top: this.borderThin(argb),
      right: this.borderThin(argb),
      left: this.borderThin(argb),
    } as ExcelJS.Borders;
  },

  borderThin_BRL(argb: string = 'FF000000'): ExcelJS.Borders {
    return {
      right: this.borderThin(argb),
      bottom: this.borderThin(argb),
      left: this.borderThin(argb),
    } as ExcelJS.Borders;
  },

  borderThin__RL(argb: string = 'FF000000'): ExcelJS.Borders {
    return {
      right: this.borderThin(argb),
      left: this.borderThin(argb),
    } as ExcelJS.Borders;
  },

  setBorderLeftThickByCells (cells: ExcelJS.Cell[]): void {
    cells.forEach(cell => {
      if (!cell.border) {
        cell.border = {};
      }
      cell.border.left = this.borderThick();
    });
  },

  setBorderRightThickByCells (cells: ExcelJS.Cell[]): void {
    cells.forEach(cell => {
      if (!cell.border) {
        cell.border = {};
      }
      cell.border.right = this.borderThick();
    });
  },

  setBorderTopThickByCells(cells: ExcelJS.Cell[]): void {
    cells.forEach(cell => {
      if (!cell.border) {
        cell.border = {};
      }
      cell.border.top = this.borderThick();
    });
  },

  setBorderBottomThickByCells(cells: ExcelJS.Cell[]): void {
    cells.forEach(cell => {
      if (!cell.border) {
        cell.border = {};
      }
      cell.border.bottom = this.borderThick();
    });
  },

  setBorderLeftThinByCells (cells: ExcelJS.Cell[]): void {
    cells.forEach(cell => {
      if (!cell.border) {
        cell.border = {};
      }
      cell.border.left = this.borderThin();
    });
  },

  setBorderRightThinByCells (cells: ExcelJS.Cell[]): void {
    cells.forEach(cell => {
      if (!cell.border) {
        cell.border = {};
      }
      cell.border.right = this.borderThin();
    });
  },

  setBorderTopThinByCells(cells: ExcelJS.Cell[]): void {
    cells.forEach(cell => {
      if (!cell.border) {
        cell.border = {};
      }
      cell.border.top = this.borderThin();
    });
  },

  setBorderBottomThinByCells(cells: ExcelJS.Cell[]): void {
    cells.forEach(cell => {
      if (!cell.border) {
        cell.border = {};
      }
      cell.border.bottom = this.borderThin();
    });
  },

  setBoldFontByCells(cells: ExcelJS.Cell[]): void {
    cells.forEach(cell => {
      cell.font = {
        ...cell.font,
        bold: true,
      } as ExcelJS.Font;
    });
  },

  fillForConcurrentLessonByCells(cells: ExcelJS.Cell[]): void {
    cells.forEach(cell => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFF7CC' }
      } as ExcelJS.Fill;
    });
  },

  setMiddleCenterAlignmentByCells(cells: ExcelJS.Cell[]): void {
    cells.forEach(cell => {
      cell.alignment = { vertical: 'middle', horizontal: 'center' } as ExcelJS.Alignment;
    });
  },

  cellWithDefault(value: any, cellAddress: string, worksheet: ExcelJS.Worksheet, fontSize: number = 8, fontName: string | undefined = undefined): ExcelJS.Cell {
    const cell = worksheet.getCell(cellAddress);
    cell.alignment = this.middleCenterAlignment();
    cell.value = value;
    cell.font = fontName ? 
      { name: fontName, size: fontSize } as ExcelJS.Font :
      { size: fontSize } as ExcelJS.Font;
    return cell;
  },  

  async saveWorkbookToFile (workbook: ExcelJS.Workbook, filename: string, extension = 'xlsx') {
    try {
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `${filename}.${extension}`);
    } catch (error) {
      console.error('엑셀 파일 저장 중 오류 발생:', error);
    }
  },

  async saveWorkbooksToZipFile(workbooks: {excelFilename: string, workbook: ExcelJS.Workbook}[], filename: string, workbookExtension: 'xlsx' | 'csv' = 'xlsx') {
    try {
      const zip = new JSZip();

      for (let workBookItem of workbooks) {
        const { excelFilename, workbook } = workBookItem;

        const bufferGenerators = {
          'xlsx': () => workbook.xlsx.writeBuffer(),
          'csv': () => workbook.csv.writeBuffer({ formatterOptions: { writeBOM: true } })
        };
        const generateBuffer = bufferGenerators[workbookExtension];
        const buffer = await generateBuffer();

        zip.file(`${excelFilename}.${workbookExtension}`, buffer);
      }

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${filename}.zip`);
    } catch (error) {
      console.error('엑셀 파일 저장 중 오류 발생:', error);
    }
  },
};


class ExcelCellHelper {
  _worksheet: ExcelJS.Worksheet
  _fontSize: number
  _fontName: string

  constructor(worksheet: ExcelJS.Worksheet) {
    this._worksheet = worksheet;
    this._fontSize = 10;
    this._fontName = '바탕체';

    this._worksheet.properties.defaultColWidth = 12;
    this._worksheet.properties.defaultRowHeight = 22;
  }

  set fontSize(size: number) {
    this._fontSize = size;
  }

  defaultStyleCell(value: any, cellAddress: string, fontSize: number | undefined = undefined): ExcelJS.Cell {
    fontSize = fontSize ?? this._fontSize;
    return ExcelJsUtils.cellWithDefault(value, cellAddress, this._worksheet, fontSize, this._fontName);
  }

  defaultStyleAndLineCell(value: any, cellAddress: string, fontSize: number | undefined = undefined): ExcelJS.Cell {
    const cell = this.defaultStyleCell(value, cellAddress, fontSize);
    cell.border = ExcelJsUtils.borderThinTBRL();
    return cell;
  }
}

export { ExcelJsUtils, ExcelCellHelper };