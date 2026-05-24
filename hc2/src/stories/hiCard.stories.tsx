import type { Meta, StoryObj } from '@storybook/react-vite';
import { HiCard } from '@/components/uiux/hiCard';

const meta = {
  title: 'ui/HiCard',
  component: HiCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['xl', 'lg', 'md', 'sm', 'xs'],
    },
    color: {
      control: 'select',
      options: ['white', 'gray', 'blue', 'red'],
    },
    hasBorder: { control: 'boolean' },
  },
  args: {
    size:      'sm',
    color:     'white',
    hasBorder: false,
  },
} satisfies Meta<typeof HiCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── controls로 직접 제어 ──────────────────────────────────────────
export const Default: Story = {
  render: (args) => (
    <HiCard {...args} className="w-[300px]">
      <p className="text-leading-b3 text-text-default">카드 콘텐츠 영역입니다.</p>
    </HiCard>
  ),
};

// ── 사이즈별 ──────────────────────────────────────────────────────
export const Sizes: Story = {
  name: 'Sizes',
  render: () => (
    <div className="flex flex-col gap-4 w-[400px]">
      {(['xl', 'lg', 'md', 'sm', 'xs'] as const).map((size) => (
        <HiCard key={size} size={size} color="white" hasBorder>
          <p className="text-leading-b3 font-bold text-text-default">{size}</p>
          <p className="text-leading-d2 text-text-neutral-stronger">
            {({
              xl: 'p-8 / rounded-lg (12px)',
              lg: 'p-6 / rounded-lg (12px)',
              md: 'p-5 / rounded-md (8px)',
              sm: 'p-4 / rounded-md (8px)',
              xs: 'p-3 / rounded-md (8px)',
            })[size]}
          </p>
        </HiCard>
      ))}
    </div>
  ),
};

// ── 색상별 ───────────────────────────────────────────────────────
export const Colors: Story = {
  name: 'Colors',
  render: () => (
    <div className="flex flex-col gap-4 w-[400px]">
      {(['white', 'gray', 'blue', 'red'] as const).map((color) => (
        <HiCard key={color} size="sm" color={color} hasBorder>
          <p className="text-leading-b3 font-bold text-text-default">{color}</p>
        </HiCard>
      ))}
    </div>
  ),
};

// ── 테두리 유무 ───────────────────────────────────────────────────
export const WithBorder: Story = {
  name: 'Border',
  render: () => (
    <div className="flex flex-col gap-4 w-[400px]">
      {(['white', 'gray', 'blue', 'red'] as const).map((color) => (
        <div key={color} className="flex gap-4">
          <HiCard size="sm" color={color} className="flex-1">
            <p className="text-leading-d2 text-text-default">border 없음</p>
          </HiCard>
          <HiCard size="sm" color={color} hasBorder className="flex-1">
            <p className="text-leading-d2 text-text-default">border 있음</p>
          </HiCard>
        </div>
      ))}
    </div>
  ),
};

// ── 커스텀 컬러 ───────────────────────────────────────────────────
export const CustomColor: Story = {
  name: 'Custom Color',
  render: () => (
    <div className="flex flex-col gap-4 w-[400px]">
      {[
        'var(--bg-mint-subtlest)',
        'var(--bg-orange-subtlest)',
        'var(--bg-green-subtlest)',
        'var(--bg-yellow-subtlest)',
      ].map((color) => (
        <HiCard key={color} size="sm" color={color}>
          <p className="text-leading-b3 text-text-default">{color}</p>
        </HiCard>
      ))}
    </div>
  ),
};