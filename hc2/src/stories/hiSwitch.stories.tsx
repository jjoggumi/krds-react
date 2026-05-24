import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, useEffect } from 'react';
import { HiSwitch } from '@/components/uiux/hiSwitch';

type SwitchSelect = 'off' | 'on';

const meta = {
  title: 'ui/HiSwitch',
  component: HiSwitch,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  // ── docs 탭에서도 클릭 동작하도록 decorator로 상태 주입
  decorators: [
    (Story, context) => {
      const [select, setSelect] = useState<SwitchSelect>(context.args.select ?? 'off');

      useEffect(() => {
        setSelect(context.args.select ?? 'off');
      }, [context.args.select]);

      return (
        <Story
          args={{
            ...context.args,
            select,
            onChange: setSelect,
          }}
        />
      );
    },
  ],
  argTypes: {
    select: {
      control: 'select',
      options: ['off', 'on'],
    },
    disabled: { control: 'boolean' },
    label:    { control: 'text' },
    color:    { control: 'text' },
  },
  args: {
    select:   'on',
    disabled: false,
    label:    '레이블',
    color:    undefined,
  },
} satisfies Meta<typeof HiSwitch>;

export default meta;

type Story = StoryObj<typeof meta>;

// ── controls로 직접 상태 제어 ─────────────────────────────────────
export const Default: Story = {
  render: (args) => (
    <HiSwitch {...args} />
  ),
};

// ── 클릭 인터랙션 확인용 ──────────────────────────────────────────
export const Interactive: Story = {
  render: (args) => {
    const [select, setSelect] = useState<SwitchSelect>(args.select ?? 'off');

    useEffect(() => {
      setSelect(args.select ?? 'off');
    }, [args.select]);

    return (
      <HiSwitch
        {...args}
        select={select}
        onChange={setSelect}
      />
    );
  },
};

// ── 상태별 시각 확인 (고정값) ─────────────────────────────────────
export const States: Story = {
  name: 'States (off / on)',
  render: () => (
    <div className="flex flex-col gap-4">
      {(['off', 'on'] as const).map((key) => (
        <HiSwitch key={key} select={key} label={key} />
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {(['off', 'on'] as const).map((select) => (
        <HiSwitch
          key={select}
          select={select}
          label={`${select} disabled`}
          disabled
        />
      ))}
    </div>
  ),
};

export const NoLabel: Story = {
  render: () => (
    <div className="flex gap-4">
      {(['off', 'on'] as const).map((key) => (
        <HiSwitch key={key} select={key} />
      ))}
    </div>
  ),
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-row gap-12">
      {/* 활성화 컬럼 */}
      <div className="flex flex-col gap-4">
        {(['off', 'on'] as const).map((key) => (
          <HiSwitch key={key} select={key} label={key} />
        ))}
      </div>
      {/* 비활성화 컬럼 */}
      <div className="flex flex-col gap-4">
        {(['off', 'on'] as const).map((key) => (
          <HiSwitch key={key} select={key} label={`${key} disabled`} disabled />
        ))}
      </div>
    </div>
  ),
};

export const CustomColor: Story = {
  name: 'Custom Color',
  render: () => {
    const [primary, setPrimary] = useState<SwitchSelect>('on');
    const [red, setRed]         = useState<SwitchSelect>('on');
    const [green, setGreen]     = useState<SwitchSelect>('on');
    return (
      <div className="flex flex-col gap-4">
        <HiSwitch select={primary} label="기본 (primary)"  onChange={setPrimary} />
        <HiSwitch select={red}     label="Red"   color="graphic-red"   onChange={setRed} />
        <HiSwitch select={green}   label="Green" color="var(--graphic-green)" onChange={setGreen} />
      </div>
    );
  },
};