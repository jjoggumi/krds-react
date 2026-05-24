import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  HiTable, HiTableHead, HiTableBody,
  HiTableRow, HiTableTh, HiTableTd,
  type TableVariant,
} from '@/components/uiux/hiTable';
import { HiBadge } from '@/components/uiux/hiBadge';

const meta: Meta<typeof HiTable> = {
  title: 'ui/HiTable',
  component: HiTable,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    variant:     { control: 'radio',  options: ['primary', 'secondary', 'tertiary'] },
    size:        { control: 'radio',  options: ['xxl', 'xl', 'md', 'xs'] },
    innerScroll: { control: 'text' },
  },
};
export default meta;
type Story = StoryObj<typeof HiTable>;

// ── 샘플 데이터 ───────────────────────────────────────────────────
const ROWS = [
  { id: 1, name: '김민준', role: '프론트엔드 개발자', team: '플랫폼팀',    status: '활성'   },
  { id: 2, name: '이서연', role: 'UI 디자이너',       team: '디자인팀',   status: '활성'   },
  { id: 3, name: '박지호', role: '백엔드 개발자',     team: '서버팀',     status: '비활성' },
  { id: 4, name: '최유진', role: '데이터 분석가',     team: '데이터팀',   status: '활성'   },
  { id: 5, name: '정하은', role: '프로덕트 매니저',   team: '프로덕트팀', status: '활성'   },
];

const LONG_ROWS = Array.from({ length: 20 }, (_, i) => ({
  id:     i + 1,
  name:   `사용자 ${i + 1}`,
  role:   ['개발자', '디자이너', '기획자', '분석가'][i % 4],
  team:   ['플랫폼팀', '디자인팀', '프로덕트팀', '데이터팀'][i % 4],
  status: i % 3 === 2 ? '비활성' : '활성',
}));

// ── 공통 헤더/바디 렌더 ───────────────────────────────────────────
const TableContent = ({ rows = ROWS, variant = 'primary' }: { rows?: typeof ROWS, variant?: TableVariant }) => {
  if (variant === 'tertiary') {
    return (
      <HiTableBody>
        {rows.map((row) => (
          <HiTableRow key={row.id}>
            <HiTableTh scope="row">{row.name}</HiTableTh>
            <HiTableTd>{row.role}</HiTableTd>
          </HiTableRow>
        ))}
      </HiTableBody>
    );
  }

  return (
    <>
      <HiTableHead>
        <HiTableRow hoverable={false}>
          <HiTableTh width="60px" align="center">#</HiTableTh>
          <HiTableTh>이름</HiTableTh>
          <HiTableTh>역할</HiTableTh>
          <HiTableTh>팀</HiTableTh>
          <HiTableTh align="center">상태</HiTableTh>
        </HiTableRow>
      </HiTableHead>
      <HiTableBody>
        {rows.map((row) => (
          <HiTableRow key={row.id}>
            <HiTableTd align="center">{row.id}</HiTableTd>
            <HiTableTd>{row.name}</HiTableTd>
            <HiTableTd>{row.role}</HiTableTd>
            <HiTableTd>{row.team}</HiTableTd>
            <HiTableTd align="center">
              <HiBadge type="solid" color={row.status === '활성' ? 'primary' : 'gray'}>{row.status}</HiBadge>
            </HiTableTd>
          </HiTableRow>
        ))}
      </HiTableBody>
    </>
  );
};

// ── Primary ───────────────────────────────────────────────────────
export const PrimaryXXL: Story = {
  name: 'Primary / xxl',
  args: { variant: 'primary', size: 'xxl' },
  render: (args) => <HiTable {...args}><TableContent variant={args.variant} /></HiTable>,
};

export const PrimaryMD: Story = {
  name: 'Primary / md',
  args: { variant: 'primary', size: 'md' },
  render: (args) => <HiTable {...args}><TableContent variant={args.variant} /></HiTable>,
};

// ── Secondary ─────────────────────────────────────────────────────
export const SecondaryXS: Story = {
  name: 'Secondary / xs',
  args: { variant: 'secondary', size: 'xs' },
  render: (args) => <HiTable {...args}><TableContent variant={args.variant} /></HiTable>,
};

// ── Tertiary ──────────────────────────────────
export const TertiaryXL: Story = {
  name: 'Tertiary / xl - noBackground',
  args: { variant: 'tertiary', size: 'xl' },
  render: (args) => (
    <HiTable {...args} className="w-150">
      <HiTableBody>
        {[
          { label: '유형', value: 'SMS (단문)'},
          { label: '발신번호', value: '02-000-0000'},
          { label: '발송일시', value: '2026.04.02 09:55:00 (명단이름)'},
          { label: '진행 상황', value: '예약'},
          { label: '발송 요청 건수', value: '1건'},
          { label: '성공 건수', value: '0건'},
          { label: '실패 건수', value: '0건'},
        ].map(({ label, value }) => (
          <HiTableRow key={label}>
            <HiTableTh noBackground scope="row">{label}</HiTableTh>
            <HiTableTd>{value}</HiTableTd>
          </HiTableRow>
        ))}
      </HiTableBody>
    </HiTable>
  ),
};

export const TertiaryMD: Story = {
  name: 'Tertiary / md',
  args: { variant: 'tertiary', size: 'md' },
  render: (args) => (
    <HiTable {...args} className="w-150">
      <HiTableBody>
        {['항목 1', '항목 2', '항목 3', '항목 4'].map((label) => (
          <HiTableRow key={label}>
            <HiTableTh scope="row">{label}</HiTableTh>
            <HiTableTd>아이콘/버튼 등 자유롭게 구성 가능</HiTableTd>
          </HiTableRow>
        ))}
      </HiTableBody>
    </HiTable>
  ),
};

export const TertiaryXS: Story = {
  name: 'Tertiary / xs',
  args: { variant: 'tertiary', size: 'xs' },
  render: (args) => (
    <HiTable {...args} className="w-150">
      <HiTableBody>
        {['항목 1', '항목 2', '항목 3', '항목 4'].map((label) => (
          <HiTableRow key={label}>
            <HiTableTh scope="row">{label}</HiTableTh>
            <HiTableTd>아이콘/버튼 등 자유롭게 구성 가능</HiTableTd>
          </HiTableRow>
        ))}
      </HiTableBody>
    </HiTable>
  ),
};

// ── Sticky Header ─────────────────────────────────────────────────
export const StickyHeader: Story = {
  name: 'Sticky Header',
  args: { variant: 'primary', size: 'md', innerScroll: '320px' },
  render: (args) => (
    <HiTable {...args} useScrollbar>
      <HiTableHead sticky>
        <HiTableRow hoverable={false}>
          <HiTableTh width="60px" align="center">#</HiTableTh>
          <HiTableTh>이름</HiTableTh>
          <HiTableTh>역할</HiTableTh>
          <HiTableTh>팀</HiTableTh>
          <HiTableTh align="center">상태</HiTableTh>
          <HiTableTh>메모</HiTableTh>
        </HiTableRow>
      </HiTableHead>
      <HiTableBody>
        {LONG_ROWS.map((row) => (
          <HiTableRow key={row.id}>
            <HiTableTd align="center">{row.id}</HiTableTd>
            <HiTableTd>{row.name}</HiTableTd>
            <HiTableTd>{row.role}</HiTableTd>
            <HiTableTd>{row.team}</HiTableTd>
            <HiTableTd align="center">
              <HiBadge type="solid" color={row.status === '활성' ? 'primary' : 'gray'}>{row.status}</HiBadge>
            </HiTableTd>
            <HiTableTd>{row.team} - 상세 메모 내용이 길게 표시됩니다.</HiTableTd>
          </HiTableRow>
        ))}
      </HiTableBody>
    </HiTable>
  ),
};

export const StickyHeaderSecondary: Story = {
  name: 'Sticky Header / Secondary',
  args: { variant: 'secondary', size: 'md', innerScroll: '320px' },
  render: (args) => (
    <HiTable {...args} useScrollbar>
      <HiTableHead sticky>
        <HiTableRow hoverable={false}>
          <HiTableTh width="60px" align="center">#</HiTableTh>
          <HiTableTh>이름</HiTableTh>
          <HiTableTh>역할</HiTableTh>
          <HiTableTh>팀</HiTableTh>
          <HiTableTh align="center">상태</HiTableTh>
        </HiTableRow>
      </HiTableHead>
      <HiTableBody>
        {LONG_ROWS.map((row) => (
          <HiTableRow key={row.id}>
            <HiTableTd align="center">{row.id}</HiTableTd>
            <HiTableTd>{row.name}</HiTableTd>
            <HiTableTd>{row.role}</HiTableTd>
            <HiTableTd>{row.team}</HiTableTd>
            <HiTableTd align="center">
              <HiBadge type="solid" color={row.status === '활성' ? 'primary' : 'gray'}>{row.status}</HiBadge>
            </HiTableTd>
          </HiTableRow>
        ))}
      </HiTableBody>
    </HiTable>
  ),
};

// ── ColSpan / RowSpan ─────────────────────────────────────────────
export const ColAndRowSpan: Story = {
  name: 'ColSpan / RowSpan',
  args: { variant: 'primary', size: 'md' },
  render: (args) => (
    <HiTable {...args}>
      <HiTableHead>
        <HiTableRow hoverable={false}>
          <HiTableTh>팀</HiTableTh>
          <HiTableTh>이름</HiTableTh>
          <HiTableTh>역할</HiTableTh>
          <HiTableTh align="center">상태</HiTableTh>
        </HiTableRow>
      </HiTableHead>
      <HiTableBody>
        <HiTableRow>
          <HiTableTd rowSpan={2}>플랫폼팀</HiTableTd>
          <HiTableTd>김민준</HiTableTd>
          <HiTableTd>프론트엔드 개발자</HiTableTd>
          <HiTableTd align="center"><HiBadge type="solid" color="primary">활성</HiBadge></HiTableTd>
        </HiTableRow>
        <HiTableRow>
          <HiTableTd>박지호</HiTableTd>
          <HiTableTd>백엔드 개발자</HiTableTd>
          <HiTableTd align="center"><HiBadge type="solid" color="gray">비활성</HiBadge></HiTableTd>
        </HiTableRow>
        <HiTableRow>
          <HiTableTd colSpan={3}>디자인팀 (팀원 없음)</HiTableTd>
          <HiTableTd align="center"><HiBadge type="solid" color="gray">비활성</HiBadge></HiTableTd>
        </HiTableRow>
      </HiTableBody>
    </HiTable>
  ),
};

// ── Form Table ────────────────────────────────────────────────────
const FormTableRender = () => {
  const [form, setForm] = useState({
    name:  '김민준',
    role:  '프론트엔드 개발자',
    team:  '플랫폼팀',
    email: 'minjun@example.com',
  });
  const handleChange = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <HiTable variant="primary" size="md">
      <HiTableBody>
        
      </HiTableBody>
    </HiTable>
  );
};

export const FormTable: Story = {
  name: 'Form Table (HiInput)',
  render: () => <FormTableRender />,
};
// ── All Variants & Sizes ──────────────────────────────────────────
export const AllVariantsAndSizes: Story = {
  name: 'All Variants & Sizes',
  render: () => (
    <div className="flex flex-col gap-8">
      {(['primary', 'secondary'] as const).flatMap((variant) =>
        (['xxl', 'xl', 'md', 'xs'] as const).map((size) => (
          <div key={`${variant}-${size}`}>
            <p className="mb-2 text-d1 font-bold text-text-neutral-stronger">
              variant="{variant}" / size="{size}"
            </p>
            <HiTable variant={variant} size={size}>
              <HiTableHead>
                <HiTableRow hoverable={false}>
                  <HiTableTh>이름</HiTableTh>
                  <HiTableTh>팀</HiTableTh>
                  <HiTableTh align="center">상태</HiTableTh>
                </HiTableRow>
              </HiTableHead>
              <HiTableBody>
                {ROWS.slice(0, 3).map((row) => (
                  <HiTableRow key={row.id}>
                    <HiTableTd>{row.name}</HiTableTd>
                    <HiTableTd>{row.team}</HiTableTd>
                    <HiTableTd align="center">
                      <HiBadge type="solid" color={row.status === '활성' ? 'primary' : 'gray'}>{row.status}</HiBadge>
                    </HiTableTd>
                  </HiTableRow>
                ))}
              </HiTableBody>
            </HiTable>
          </div>
        ))
      )}
      {/* Tertiary */}
      {(['xl', 'md', 'xs'] as const).map((size) => (
        <div key={`tertiary-${size}`}>
          <p className="mb-2 text-d1 font-bold text-text-neutral-stronger">
            variant="tertiary" / size="{size}"
          </p>
          <HiTable variant="tertiary" size={size} className="w-150">
            <HiTableBody>
              {['항목 1', '항목 2', '항목 3'].map((label) => (
                <HiTableRow key={label}>
                  <HiTableTh scope="row">{label}</HiTableTh>
                  <HiTableTd>아이콘/버튼 등 자유롭게 구성 가능</HiTableTd>
                </HiTableRow>
              ))}
            </HiTableBody>
          </HiTable>
        </div>
      ))}
    </div>
  ),
};