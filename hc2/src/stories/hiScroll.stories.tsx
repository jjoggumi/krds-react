import type { Meta, StoryObj } from '@storybook/react-vite';
import { HiScrollbar } from '@/components/uiux/hiScrollbar';

const meta = {
  title: 'ui/HiScrollbar',
  component: HiScrollbar,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    orientation: { control: 'select', options: ['vertical', 'horizontal', 'both'] },
    size: { control: 'select', options: ['sm', 'md'] },
    variant: { control: 'select', options: ['default', 'transparent'] },
  },
  args: { orientation: 'both', size: 'md', variant: 'default', maxHeight: '200px' },
} satisfies Meta<typeof HiScrollbar>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Helpers ───────────────────────────────────────────────────────
const DUMMY_ITEMS = Array.from({ length: 20 }, (_, i) => `항목 ${i + 1} — 스크롤 테스트 텍스트입니다.`);

type ItemsListProps = { wrapWidth?: string; pClass?: string };
const ItemsList = ({ 
  wrapWidth = '700px', 
  pClass = 'text-leading-d2 text-text-default py-1 border-b border-border-neutral-subtler whitespace-nowrap' 
}: ItemsListProps) => (
  <div style={{ width: wrapWidth }}>
    {DUMMY_ITEMS.map((t, i) => (
      <p key={i} className={pClass}>{t}</p>
    ))}
  </div>
);

const HorizontalItems = () => (
  <div className="flex gap-3" style={{ width: '700px' }}>
    {Array.from({ length: 12 }, (_, i) => (
      <div key={i} className="shrink-0 w-25 h-15 bg-bg-secondary-subtlest rounded-md flex items-center justify-center text-leading-d2 text-text-primary-base">
        항목 {i + 1}
      </div>
    ))}
  </div>
);

// ── Stories ───────────────────────────────────────────────────────

export const Default: Story = {
  render: (args) => (
    <HiScrollbar {...args} className="w-75">
      <ItemsList pClass="text-leading-b3 text-text-default py-1 border-b border-border-neutral-subtler whitespace-nowrap" />
    </HiScrollbar>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex gap-8 items-start">
      {(['default', 'transparent'] as const).map((v) => (
        <div key={v} className="flex flex-col gap-2">
          <p className="text-leading-d2 font-bold text-text-neutral-stronger">{v === 'default' ? 'BG-white' : 'BG-transparent'}</p>
          <div className={v === 'transparent' ? 'bg-bg-primary-subtlest p-2 rounded-md' : ''}>
            <HiScrollbar variant={v} maxHeight="160px" className="w-50"><ItemsList wrapWidth="100%" /></HiScrollbar>
          </div>
        </div>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex gap-8 items-start">
      {(['sm', 'md'] as const).map((s) => (
        <div key={s} className="flex flex-col gap-2">
          <p className="text-leading-d2 font-bold text-text-neutral-stronger">{s} ({s === 'sm' ? '6px' : '8px'})</p>
          <HiScrollbar size={s} maxHeight="160px" className="w-50"><ItemsList wrapWidth="100%" /></HiScrollbar>
        </div>
      ))}
    </div>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {(['sm', 'md'] as const).map((s) => (
        <div key={s} className="flex flex-col gap-2">
          <p className="text-leading-d2 font-bold text-text-neutral-stronger">{s}</p>
          <HiScrollbar orientation="horizontal" size={s} maxWidth="300px"><HorizontalItems /></HiScrollbar>
        </div>
      ))}
    </div>
  ),
};

export const Both: Story = {
  name: 'Both (양방향)',
  render: () => (
    <HiScrollbar orientation="both" maxHeight="200px" maxWidth="300px">
      <ItemsList wrapWidth="600px" />
    </HiScrollbar>
  ),
};

export const All: Story = {
  render: () => (
    <div className="flex flex-col gap-10 w-130">
      <div>
        <p className="text-leading-b3 font-bold text-text-default mb-4">Vertical</p>
        <div className="grid grid-cols-2 gap-6">
          {(['sm', 'md'] as const).map((s) => (['default', 'transparent'] as const).map((v) => (
            <div key={`${s}-${v}`} className="flex flex-col gap-2">
              <p className="text-leading-d2 text-text-neutral-stronger">{s} / {v === 'default' ? 'BG-white' : 'BG-transparent'}</p>
              <div className={v === 'transparent' ? 'bg-bg-primary-subtlest p-2 rounded-md' : ''}>
                <HiScrollbar size={s} variant={v} maxHeight="120px">
                  <ItemsList wrapWidth="100%" pClass="text-leading-d2 py-1 border-b border-border-neutral-subtler" />
                </HiScrollbar>
              </div>
            </div>
          )))}
        </div>
      </div>
      <div>
        <p className="text-leading-b3 font-bold text-text-default mb-4">Horizontal</p>
        <div className="flex flex-col gap-4">
          {(['default', 'transparent'] as const).map((v) => (
            <div key={v} className="flex flex-col gap-2">
              <p className="text-leading-d2 text-text-neutral-stronger">{v === 'default' ? 'BG-white' : 'BG-transparent'}</p>
              <div className={v === 'transparent' ? 'bg-bg-primary-subtlest p-2 rounded-md' : ''}>
                <HiScrollbar orientation="horizontal" variant={v} maxWidth="500px"><div style={{ width: '900px' }}><HorizontalItems /></div></HiScrollbar>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
};

export const CustomColors: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {['action-red-base', 'var(--action-primary-base)'].map((color) => (
        <div key={color}>
          <p className="text-leading-d2 font-bold text-text-neutral-stronger mb-2">{color.includes('--') ? 'CSS variable' : 'Token color'}</p>
          <HiScrollbar color={color} maxHeight="140px" className="w-75"><ItemsList /></HiScrollbar>
        </div>
      ))}
    </div>
  ),
};