import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

import { Contact } from '@/components/text/types/contact';
import { generatePasswordEncryptedExcelBlob } from '@/components/text/utils';

export const useExcelDownloadContact = () => {
  const generateElContactExcel = async (lists: Contact[], fileName: string, password: string) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet();

    worksheet.columns = [
      { header: '대분류', key: 'depth1GroupName', width: 10 },
      { header: '소분류', key: 'depth2GroupName', width: 10 },
      { header: '번호', key: 'studentNumber', width: 10 },
      { header: '이름', key: 'contactName', width: 10 },
      { header: '휴대폰번호', key: 'phoneNumber', width: 15 },
      { header: '학부모1', key: 'phoneNumberParent1', width: 15 },
      { header: '학부모2', key: 'phoneNumberParent2', width: 15 },
    ];

    setHeaderStyle(worksheet.getRow(1));

    lists.forEach((li) => {
      worksheet.addRow(li);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = await generatePasswordEncryptedExcelBlob(buffer, password);
      // ? 
      // : new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    saveAs(blob as Blob, fileName);
  };

  const setHeaderStyle = (headerRow: ExcelJS.Row) => {
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF7CC' } };
    });
  };

  return { generateElContactExcel };
}
