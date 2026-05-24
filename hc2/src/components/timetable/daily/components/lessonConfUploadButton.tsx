import React, { ChangeEvent, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { CourseBaseTitle } from '@/components/timetable/common/types';
import { TimetableCreateRequest } from '@/components/timetable/contexts/timetableGradeContext';
import { UploadLessonConfRequest } from '@/components/timetable/daily/main/lessonList';
import { UploadLessonConf } from '@/components/timetable/core/types';
import { ShowConfirm, CONFIRM_OPTIONS } from '@/components/uiux'
import { HiButton } from '@/components/uiux/hiButton';
import { Upload } from 'lucide-react';

type ExcelRow = Record<string, string>
interface CellIndex {
  standardTitleCellIdx: string;
  displayedTitleCellIdx: string;
  teacherNameCellIdx: string;
  gradeCellIdxes: string[];
}
interface ClassCell {
  cellIdx: string;
  gradeName: string;
  className: string;
  periodCount: number;
  isVirtual?: boolean;
}
interface LessonConfUploadButtonProps {
  setUploadLessonConfRequest: React.Dispatch<React.SetStateAction<UploadLessonConfRequest | null>>
}

export const LessonConfUploadButton = ({ setUploadLessonConfRequest }: LessonConfUploadButtonProps) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const uploadInput = useRef<HTMLInputElement | null>(null);

  const handleClickUploadLessonConf = () => {
    if (!uploadInput.current) return;
    uploadInput.current.click();
  }

  const uploadLessonConfs = (files: FileList) => {
    if (isProcessing) return;

    const file = files[0];
    uploadInput.current.value = '';

    if (!file) return;
    if (!(file.name.split('.').pop() === 'xlsx' || file.name.split('.').pop() === 'xls')) {
      showErrorAlert('업로드를 지원하지 않는 파일형식입니다.');
      return;
    }
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result;
      const workBook = XLSX.read(data, { type: 'binary' });
      const firstSheetName = workBook.SheetNames[0];
      const worksheet = workBook.Sheets[firstSheetName];
      const rows: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
      if (rows.length === 0) return;
      const parsingData = parsingExcel(rows, worksheet['!merges'], worksheet);
      setIsProcessing(false);
      if (!parsingData) return;
      setUploadLessonConfRequest(parsingData);
      setFileName(file.name);
    };
    reader.readAsBinaryString(file);
  }

  return (
    <>
      <HiButton type="button" variant='tertiaryBlue' style={{ minWidth: '130px' }} onClick={handleClickUploadLessonConf} disabled={isProcessing}>
        <Upload  color="var(--text-primary-base)" size="18"/>
        시수표 업로드
      </HiButton>
      <span style={{ fontSize: 'var(--b3-size)' }} className='text-text-primary-base'>{fileName}</span>
      <input
        ref={uploadInput}
        type="file"
        accept=".xls,.xlsx"
        style={{ display: 'none' }}
        onChange={(e: ChangeEvent<HTMLInputElement>) => uploadLessonConfs(e.target.files)}/>
    </>
  )
}

const parsingExcel = (rows: ExcelRow[], mergedCells: XLSX.Range[], worksheet: XLSX.WorkSheet) => {
  const lastHeaderCellValue = Object.values(rows[0]).pop();
  if (!validateExcelFile(mergedCells, worksheet, lastHeaderCellValue)) {
    showErrorAlert('업로드한 파일이 제공된 양식과 일치하지 않습니다.\n양식을 확인한 후 다시 업로드해주세요.')
    return null;
  }
  
  const a = Object.entries(rows[0]).filter(([key, value]) => value !== '');
  const gradeIndexes = [];
  for (let i = 4; i < a.length - 1; i++) {
    const key = a[i][0].replace('__EMPTY_', '');
    const gradeIndex = parseInt(key) + 1;
    gradeIndexes.push(gradeIndex);
  }

  // 마지막 학년의 마지막 반 인덱스
  const lastClassIndex = parseInt(Object.keys(rows[0]).pop().replace('__EMPTY_', ''));

  // 키, empty row 정리
  const newRows: ExcelRow[] = rows.map(row => {
    let newRow = {};
    for (let i = 0; i < Object.values(row).length; i++) {
      // No, 계 제외
      if (i > 0 && i <= lastClassIndex) {
        newRow[i] = Object.values(row)[i];
      }
    }
    return newRow;
  });

  const headerRow = newRows[0];
  const classRow = newRows[1];

  // 항목별 셀 인덱스 구하기
  const cellIndex = getCellIndex(headerRow);
  const { standardTitleCellIdx, displayedTitleCellIdx, teacherNameCellIdx, gradeCellIdxes } = cellIndex;

  if (!validateEmptyGradeAndClass(gradeIndexes, lastClassIndex, worksheet)) {
    showErrorAlert('필수 입력값이 누락되었습니다.\n확인 후 다시 업로드해주세요.\n(학년명, 반명)');
    return null;
  }
  
  // row 중 정식과목명, 표기과목명, 교사명 있는 것만 필터링
  const lessonConfRows = newRows.filter((row: ExcelRow, idx: number) =>
    idx > 1 &&
    (
      row[standardTitleCellIdx] !== '' ||
      row[displayedTitleCellIdx] !== '' ||
      row[teacherNameCellIdx] !== ''
    )
  );

  if (!validateExcelEmptyCells(lessonConfRows, cellIndex)) {
    showErrorAlert('필수 입력값이 누락되었습니다.\n확인 후 다시 업로드해주세요.\n(정식과목명, 표기과목명, 교사명)');
    return null;
  }

  if (!validateEmptyPeriodCount(lessonConfRows, cellIndex)) {
    showErrorAlert('필수 입력값이 누락되었습니다.\n확인 후 다시 업로드해주세요.\n(시수 미입력)');
    return null;
  }

  const gradeClassesMap = generateGradeClassesMap(gradeCellIdxes, classRow, lessonConfRows);

  checkIsVirtual(gradeClassesMap);

  const timetableConfig = generateTimetableConfig(gradeClassesMap);
  const { titles, teacherNames } = generateTitlesAndTeacherNames(lessonConfRows, cellIndex);
  const lessonConfs = generateLessonConfs(gradeClassesMap, lessonConfRows, cellIndex);

  if (!validateCourseTitle(titles)) {
    showErrorAlert('정식 과목명이 다르지만 표기 과목명이 동일한 과목이 있어 등록할 수 없습니다.\n표기 과목명을 구분하여 입력해 주세요.');
    return null;
  }

  if (hasDuplicateLessonConf(lessonConfs)) {
    showErrorAlert('한 교사에게 동일 과목·동일 학년의 동일 시수를 중복으로 입력할 수 없습니다.\n표기 과목명을 구분하여 입력해 주세요.');
    return null;
  }

  return { timetableConfig, titles, teacherNames, lessonConfs };
}

const validateExcelFile = (mergedCells: XLSX.Range[], worksheet: XLSX.WorkSheet, lastHeaderCellValue: string): boolean => {
  const standardCourseTitleCellValue = worksheet[getCellAddress({ c: 1, r: 1 })]?.v || '';
  const displayedTitleCellValue = worksheet[getCellAddress({ c: 2, r: 1 })]?.v || '';
  const teacherNameCellValue = worksheet[getCellAddress({ c: 3, r: 1 })]?.v || '';

  const hasFirstRow = mergedCells.find(m => m.s.r === 0 && m.e.r === 0 && m.s.c === 0 && m.e.c > 3);
  const hasNoCell = mergedCells.find(m => m.s.r === 1 && m.e.r === 2 && m.s.c === 0 && m.e.c === 0);
  const hasStandardCourseTitleCell = standardCourseTitleCellValue === '정식과목명';
  const hasDisplayedTitleCell = displayedTitleCellValue === '표기과목명' || displayedTitleCellValue === '단축과목명';
  const hasTeacherNameCell = teacherNameCellValue === '교사명';
  const hasTotalCell = lastHeaderCellValue === '계';

  return hasFirstRow && hasNoCell && hasStandardCourseTitleCell && hasDisplayedTitleCell && hasTeacherNameCell && hasTotalCell;
}

const getCellAddress = ({ c, r }) => {
  return XLSX.utils.encode_cell({ c, r }); // 'AC2' 문자열 생성
}

const validateEmptyGradeAndClass = (gradeIndexes: number[], lastClassIndex: number, worksheet: XLSX.WorkSheet) => {
  const hasEmptyGrade = gradeIndexes.some(mergedGradeIndex => !worksheet[getCellAddress({ r: 1, c: mergedGradeIndex })]?.v);
  if (hasEmptyGrade) {
    return false;
  }

  const classIndexes = Array.from({ length: lastClassIndex - gradeIndexes[0] + 1 }, (_, i) => gradeIndexes[0] + i);
  const hasEmptyClass = classIndexes.some(idx => !worksheet[getCellAddress({ r: 2, c: idx })]?.v);
  if (hasEmptyClass) {
    return false;
  }

  return true;
}

const validateExcelEmptyCells = (rows: ExcelRow[], cellIndex: CellIndex): boolean => {
  const { standardTitleCellIdx, displayedTitleCellIdx, teacherNameCellIdx } = cellIndex;
  return rows.every((row: ExcelRow) =>
    row[standardTitleCellIdx] !== '' &&
    row[displayedTitleCellIdx] !== '' &&
    row[teacherNameCellIdx] !== ''
  )
}

const validateEmptyPeriodCount = (rows: ExcelRow[], cellIndex: CellIndex): boolean => {
  const { gradeCellIdxes } = cellIndex;
  const startGradeIndex = parseInt(gradeCellIdxes[0]);
  return rows.every((row: ExcelRow) => {
    return Object.entries(row)
      .filter(([key, value]) => parseInt(key) >= startGradeIndex)
      .some(([, value]) => value !== '')
  });
}

const validateCourseTitle = (titles: CourseBaseTitle[]): boolean => {
  for (const title of titles) {
    const hasDuplicateDisplayedTitle = titles.some(t =>
      t.displayedTitle === title.displayedTitle &&
      t.standardCourseTitle !== title.standardCourseTitle
    );
    if (hasDuplicateDisplayedTitle) return false;
  }
  return true;
}

const hasDuplicateLessonConf = (lessonConfs: UploadLessonConf[]): boolean => {
  const isEqual = (lessonConfA: UploadLessonConf, lessonConfB: UploadLessonConf) => {
    return Object.keys(lessonConfA).every(key => lessonConfA[key] === lessonConfB[key]);
  }

  for (let i = 0; i < lessonConfs.length; i++) {
    const currentLessonConf = lessonConfs[i];
    const hasDuplicate = lessonConfs.some((compareLessonConf, index) => {
      if (i === index) return false;
      return isEqual(currentLessonConf, compareLessonConf);
    })

    if (hasDuplicate) {
      return true;
    }
  }

  return false;
}

const getCellIndex = (headerRow: ExcelRow): CellIndex => {
  const findCellIndex = (...columnNames: string[]) => {
    return Object.entries(headerRow).find(([, value]) => columnNames.includes(value))?.[0]
  }

  const standardTitleCellIdx = findCellIndex('정식과목명');
  const displayedTitleCellIdx = findCellIndex('표기과목명', '단축과목명');
  const teacherNameCellIdx = findCellIndex('교사명');
  const gradeCellIdxes = Object.keys(headerRow).filter((cellIdx: string) => {
    return headerRow[cellIdx] !== ''
  }).filter((cellIdx: string) => {
    return ![
      standardTitleCellIdx,
      displayedTitleCellIdx,
      teacherNameCellIdx
    ].includes(cellIdx)
  }).map((cellIdx: string) => cellIdx);

  return {
    standardTitleCellIdx, displayedTitleCellIdx, teacherNameCellIdx, gradeCellIdxes
  }
}

const generateGradeClassesMap = (gradeCellIdxes: string[], classRow: ExcelRow, lessonConfRows: ExcelRow[]) => {
 return gradeCellIdxes.reduce((acc: Record<string, ClassCell[]>, curVal: string, gradeIdx: number) => {
    acc[curVal] = Object.keys(classRow)
      .filter((classCellIdx) => {
        const currentGradeCellIdx = parseInt(curVal);
        const currentClassCellIdx = parseInt(classCellIdx);
        const nextGradeCellIdx = gradeCellIdxes[gradeIdx + 1] ? parseInt(gradeCellIdxes[gradeIdx + 1]) : Infinity;

        return currentClassCellIdx >= currentGradeCellIdx && currentClassCellIdx < nextGradeCellIdx;
      })
      .map((classCellIdx: string, classIdx: number) => {
        const periodCount = lessonConfRows
          .filter(lessonConf => lessonConf[classCellIdx])
          .reduce((acc, cur) => acc + parseInt(cur[classCellIdx]), 0);

        return {
          cellIdx: classCellIdx,
          gradeName: (gradeIdx + 1).toString(),
          className: (classIdx + 1).toString(),
          periodCount: periodCount
        }
      });
    return acc;
  }, {});
}

const checkIsVirtual = (gradeClassesMap: Record<string, ClassCell[]>) => {
  const maxPeriodCountByGrade = Object.fromEntries(
    Object.entries(gradeClassesMap).map(([key, value]) => {
      return [key, Math.max(...value.map(v => v.periodCount))]
    })
  )
  Object.keys(gradeClassesMap).forEach((gradeKey) => {
    const classes = gradeClassesMap[gradeKey];
    const maxPeriod = maxPeriodCountByGrade[gradeKey];

    classes.forEach((v) => {
      v.isVirtual = v.periodCount === 0 ? false : v.periodCount < maxPeriod * 0.3;
    });

    const realClasses = classes.filter(v => !v.isVirtual);
    const virtualClasses = classes.filter(v => v.isVirtual);

    realClasses.forEach((v, idx) => {
      v.className = String(idx + 1);
    });
    virtualClasses.forEach((v, idx) => {
      v.className = String(idx + 1);
    });

    gradeClassesMap[gradeKey] = [...realClasses, ...virtualClasses];
  });
}

const generateTimetableConfig = (gradeClassesMap: Record<string, ClassCell[]>): TimetableCreateRequest => {
  const maxGrade = Object.keys(gradeClassesMap).length;
  const maxClassCountList = Object.values(gradeClassesMap).map(v => v.filter(c => !c.isVirtual).length);
  const maxVirtualClassCountList = Object.values(gradeClassesMap).map(v => v.filter(c => c.isVirtual).length);
  const gradeNames = Object.values(gradeClassesMap).map((value, idx) => (idx + 1).toString());
  const classNames = Object.values(gradeClassesMap).map(v => v.filter(c => !c.isVirtual).map(d => d.className));
  const virtualClassNames = Object.values(gradeClassesMap).map(v => v.filter(c => c.isVirtual).map(d => d.className));

  return {
    maxGrade,
    classDays: '0111110',
    startPeriod: 1,
    maxPeriod: 7,
    maxClassCountList,
    maxVirtualClassCountList,
    gradeNames,
    classNames,
    virtualClassNames
  }
}

const generateTitlesAndTeacherNames = (
  lessonConfRows: ExcelRow[],
  cellIndex: CellIndex
): { titles: CourseBaseTitle[], teacherNames: string[] } => {
  const { standardTitleCellIdx, displayedTitleCellIdx, teacherNameCellIdx } = cellIndex;

  return lessonConfRows.reduce((acc, cur) => {
    const standardCourseTitle = cur[standardTitleCellIdx];
    const displayedTitle = cur[displayedTitleCellIdx].substring(0, 5);
    const hasTitle = acc.titles.find((title: CourseBaseTitle) =>
      title.standardCourseTitle === standardCourseTitle && title.displayedTitle.substring(0, 5) === displayedTitle
    );
    if (!hasTitle) {
      acc.titles.push({ standardCourseTitle, displayedTitle });
    }

    const hasTeacherName = acc.teacherNames.find((teacherName: string) => teacherName === cur[teacherNameCellIdx]);
    if (!hasTeacherName) {
      acc.teacherNames.push(cur[teacherNameCellIdx]);
    }

    return acc;
  }, { titles: [], teacherNames: [] })
}

const generateLessonConfs = (
  gradeClassesMap: Record<string, ClassCell[]>,
  lessonConfRows: ExcelRow[],
  cellIndex: CellIndex
): UploadLessonConf[] => {
  const { standardTitleCellIdx, displayedTitleCellIdx, teacherNameCellIdx } = cellIndex;
  const classList = Object.values(gradeClassesMap).flatMap(classes => classes);

  return lessonConfRows.flatMap(lessonConf => {
    const lessonConfEntries = Object.entries(lessonConf).filter(([key, value]) => {
      return value !== '' && key !== standardTitleCellIdx && key !== displayedTitleCellIdx && key !== teacherNameCellIdx
    });

    return lessonConfEntries.length === 0 ?
      {
        standardCourseTitle: lessonConf[standardTitleCellIdx],
        displayedTitle: lessonConf[displayedTitleCellIdx].substring(0, 5),
        teacherName: lessonConf[teacherNameCellIdx]
      } :
      lessonConfEntries.map(([cellKey, cellValue]) => {
        const findClass = classList.find(gradeClass => gradeClass.cellIdx === cellKey);
        if (!findClass) return;
        return {
          standardCourseTitle: lessonConf[standardTitleCellIdx],
          displayedTitle: lessonConf[displayedTitleCellIdx].substring(0, 5),
          teacherName: lessonConf[teacherNameCellIdx],
          grade: parseInt(findClass.gradeName),
          className: findClass.className,
          periodCount: parseInt(cellValue),
          isVirtual: findClass.isVirtual
        }
      })
  })
}

const showErrorAlert = (msg: string) => {
  ShowConfirm(msg, {
    ...CONFIRM_OPTIONS.TIME_TABLE,
    confirmLabel: '확인',
    hideCancel: true
  });
}