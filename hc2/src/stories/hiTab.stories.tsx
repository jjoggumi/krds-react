import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { HiTab } from '@/components/uiux/hiTab';

const LABELS = ['전체', '진행중', '완료', '취소'];

const TabContent = ({ text }: { text: string }) => (
  <div className="p-4 rounded-lg bg-bg-neutral-subtlest text-text-default text-b2">{text} 탭 콘텐츠 영역</div>
);

const meta = {
  title: 'ui/HiTab',
  component: HiTab,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'select', options: ['underline', 'pills'] },
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl', 'xxl'] },
    contentAnimation: { control: 'select', options: ['none', 'fade'] },
  },
  args: {
    labels: LABELS,
    variant: 'underline',
    size: 'md',
    contentAnimation: 'none',
  },
} satisfies Meta<typeof HiTab>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Underline: Story = {
  args: {
    labels: LABELS,
    children: LABELS.map((label) => <TabContent key={label} text={label} />),
  },
};

export const Pills: Story = {
  args: {
    variant: 'pills',
    labels: LABELS,
    children: LABELS.map((label) => <TabContent key={label} text={label} />),
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      {(['sm', 'md', 'lg', 'xl', 'xxl'] as const).map((size) => (
        <div key={size}>
          <p className="text-d1 text-text-neutral-subtle mb-2">{size}</p>
          <HiTab labels={LABELS} size={size} />
        </div>
      ))}
    </div>
  ),
};

export const PillsSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      {(['sm', 'md', 'lg', 'xl', 'xxl'] as const).map((size) => (
        <div key={size}>
          <p className="text-d1 text-text-neutral-subtle mb-2">{size}</p>
          <HiTab labels={LABELS} variant="pills" size={size} />
        </div>
      ))}
    </div>
  ),
};

export const WithBadge: Story = {
  args: {
    labels: LABELS,
    isNew: [false, true, false, true],
    children: LABELS.map((label) => <TabContent key={label} text={label} />),
  },
};

export const WithFadeAnimation: Story = {
  args: {
    labels: LABELS,
    contentAnimation: 'fade',
    contentAnimationDuration: 0.2,
    children: LABELS.map((label) => <TabContent key={label} text={label} />),
  },
};

export const WithRenderEtc: Story = {
  args: {
    labels: LABELS,
    renderEtc: <button className="text-b3 text-text-primary-base">+ 추가</button>,
    children: LABELS.map((label) => <TabContent key={label} text={label} />),
  },
};

export const ControlledOuter: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [index, setIndex] = React.useState(0);
    return (
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          {LABELS.map((label, i) => (
            <button
              key={label}
              className={`px-3 py-1 rounded text-b3 border ${i === index ? 'bg-bg-primary-base text-text-base border-transparent' : 'border-border-neutral-base text-text-default'}`}
              onClick={() => setIndex(i)}
            >
              외부 버튼: {label}
            </button>
          ))}
        </div>
        <HiTab
          labels={LABELS}
          isControlOuter
          selectedTabIndex={index}
          onChange={setIndex}
          children={LABELS.map((label) => <TabContent key={label} text={label} />)}
        />
      </div>
    );
  },
};