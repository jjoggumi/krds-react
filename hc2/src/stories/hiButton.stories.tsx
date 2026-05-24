import type { Meta, StoryObj } from '@storybook/react-vite';
import { Plus, Trash2, Download, Mail, ArrowRight } from 'lucide-react';
import { HiButton } from '@/components/uiux/hiButton';

const meta = {
  title: 'ui/HiButton',
  component: HiButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiaryBlue', 'tertiary', 'warningLine', 'warningFill', 'underline', 'link'],
    },
    size: {
      control: 'select',
      options: ['xxl', 'xl', 'lg', 'md', 'sm', 'xs'],
    },
    shape: {
      control: 'select',
      options: ['rounded', 'pill', 'square'],
    },
    block: { control: 'boolean' },
    active: { control: 'boolean' },
    disabled: { control: 'boolean' },
    children: { control: 'text' },
  },
  args: {
    variant: 'primary',
    size: 'md',
    shape: 'rounded',
    block: false,
    active: false,
    disabled: false,
    children: '버튼',
  },
} satisfies Meta<typeof HiButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Types: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      {(['primary', 'secondary', 'tertiaryBlue', 'tertiary', 'warningLine', 'warningFill', 'underline', 'link'] as const).map((variant) => (
        <HiButton key={variant} variant={variant}>{variant}</HiButton>
      ))}
    </div>
  ),
};

export const Shapes: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      {(['rounded', 'pill', 'square'] as const).map((shape) => (
        <HiButton key={shape} shape={shape}>{shape}</HiButton>
      ))}
    </div>
  ),
};

export const Active: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      {(['primary', 'secondary', 'tertiaryBlue', 'tertiary', 'warningLine', 'warningFill', 'underline', 'link'] as const).map((variant) => (
        <HiButton key={variant} variant={variant} active>{variant}</HiButton>
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      {(['primary', 'secondary', 'tertiaryBlue', 'tertiary', 'warningLine', 'warningFill', 'underline', 'link'] as const).map((variant) => (
        <HiButton key={variant} variant={variant} disabled>{variant}</HiButton>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      {(['xxl', 'xl', 'lg', 'md', 'sm', 'xs'] as const).map((size) => (
        <HiButton key={size} size={size}>{size} 버튼</HiButton>
      ))}
    </div>
  ),
};

export const Block: Story = {
  args: { block: true },
  parameters: { layout: 'padded' },
};

export const WithIconLeft: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <HiButton variant="primary"><Plus className="w-4 h-4" />추가</HiButton>
      <HiButton variant="secondary"><Download className="w-4 h-4" />다운로드</HiButton>
      <HiButton variant="tertiaryBlue"><Mail className="w-4 h-4" />메일 보내기</HiButton>
      <HiButton variant="tertiary"><Trash2 className="w-4 h-4" />삭제</HiButton>
      <HiButton variant="warningLine"><Trash2 className="w-4 h-4" />경고 삭제</HiButton>
      <HiButton variant="warningFill"><Trash2 className="w-4 h-4" />영구 삭제</HiButton>
      <HiButton variant="link"><ArrowRight className="w-4 h-4" />더 보기</HiButton>
    </div>
  ),
};

export const WithIconRight: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <HiButton variant="primary">추가<Plus className="w-4 h-4" /></HiButton>
      <HiButton variant="secondary">다운로드<Download className="w-4 h-4" /></HiButton>
      <HiButton variant="link">더 보기<ArrowRight className="w-4 h-4" /></HiButton>
    </div>
  ),
};

export const IconOnly: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      {(['primary', 'secondary', 'tertiaryBlue', 'tertiary', 'warningLine', 'warningFill'] as const).map((variant) => (
        <HiButton key={variant} variant={variant} className="!px-0 w-10"><Plus className="w-4 h-4" /></HiButton>
      ))}
    </div>
  ),
};
