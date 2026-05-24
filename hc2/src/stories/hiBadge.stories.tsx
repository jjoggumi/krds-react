import type { Meta, StoryObj } from '@storybook/react-vite';
import { HiBadge } from '@/components/uiux/hiBadge';

const FIGMA_COLORS = [
  'primary', 'secondary',
  'blue', 'emerald', 'mint', 'amber', 'yellow', 'orange',
  'green', 'coral', 'red', 'magenta', 'lavender', 'violet',
  'gray',
] as const;

const meta = {
  title: 'ui/HiBadge',
  component: HiBadge,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['solid', 'solidLight', 'outline'],
    },
    color: {
      control: 'select',
      options: FIGMA_COLORS,
    },
    shape: {
      control: 'select',
      options: ['rounded', 'pill'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    children: { control: 'text' },
  },
  args: {
    type: 'solid',
    color: 'primary',
    shape: 'pill',
    size: 'md',
    children: 'Label',
  },
} satisfies Meta<typeof HiBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 컨트롤 패널로 모든 옵션을 조절해볼 수 있는 기본 스토리 */
export const Default: Story = {};

/** solid / solidLight / outline 3가지 type */
export const Types: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {(['solid', 'solidLight', 'outline'] as const).map((type) => (
        <HiBadge key={type} type={type} >
          {type}
        </HiBadge>
      ))}
    </div>
  )
};

/** rounded / pill */
export const Shapes: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {(['rounded', 'pill'] as const).map((shape) => (
        <HiBadge key={shape} shape={shape}>
          {shape}
        </HiBadge>
      ))}
    </div>
  ),
};

/** Pill 형태의 타입별 전체 색상 팔레트 */
export const ColorPill: Story = {
  render: () => (
    <div className="space-y-4">
      {(['solid', 'solidLight', 'outline'] as const).map((type) => (
        <div key={type}>
          <div className="mb-2 font-medium">{type}</div>
          <div className="flex flex-wrap gap-2">
            {FIGMA_COLORS.map((color) => (
              <HiBadge key={`${type}-${color}`} type={type} color={color}>
                {color}
              </HiBadge>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
  parameters: { layout: 'padded' },
};



/** Rounded 형태의 타입별 전체 색상 팔레트 */
export const ColorsRounded: Story = {
  render: () => (
    <div className="space-y-4">
      {(['solid', 'solidLight', 'outline'] as const).map((type) => (
        <div key={type}>
          <div className="mb-2 font-medium">{type}</div>
          <div className="flex flex-wrap gap-2">
            {FIGMA_COLORS.map((color) => (
              <HiBadge key={`${type}-${color}`} type={type} color={color} shape="rounded">
                {color}
              </HiBadge>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
  parameters: { layout: 'padded' },
};

/** sm / md / lg */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <HiBadge key={size} size={size}>
          {size}
        </HiBadge>
      ))}
    </div>
  ),
};

