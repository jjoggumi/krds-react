import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, useEffect } from 'react';
import { HiRadio, HiRadioGroup } from '@/components/uiux/hiRadio';

type RadioSelect = 'off' | 'on' | 'focus';

const meta = {
  title: 'ui/HiRadio',
  component: HiRadio,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  // ── docs 탭에서도 클릭 동작하도록 decorator로 상태 주입 ──────────
  decorators: [
    (Story, context) => {
      const [select, setSelect] = useState<RadioSelect>(
        context.args.select ?? 'off'
      );

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
      options: ['off', 'on', 'focus'],
    },
    disabled: { control: 'boolean' },
    label:    { control: 'text' },
    subLabel: { control: 'text' },
    color:    { control: 'text' },
  },
  args: {
    select:   'off',
    disabled: false,
    label:    '라디오버튼',
    subLabel: undefined,
    color:    undefined,
  },
} satisfies Meta<typeof HiRadio>;

export default meta;

type Story = StoryObj<typeof meta>;

// ── Default (docs 탭 기준, decorator로 인터랙션 동작) ─────────────
export const Default: Story = {
  args: { select: 'on' },
};

// ── 상태별 시각 확인 ──────────────────────────────────────────────
export const States: Story = {
  name: 'States',
  render: () => {
    const states = (['off', 'on', 'focus'] as const);
    return (
      <div className="flex flex-col gap-4">
        {states.map((key) => (
          <HiRadio
            key={key}
            select={key}
            label={key}
            onChange={() => {}}
          />
        ))}
      </div>
    );
  },
};

// ── Disabled ──────────────────────────────────────────────────────
export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {(['off', 'on', 'focus'] as const).map((select) => (
        <HiRadio
          key={select}
          select={select}
          label={`${select} disabled`}
          disabled
        />
      ))}
    </div>
  ),
};

// ── 서브텍스트 ────────────────────────────────────────────────────
export const WithSubLabel: Story = {
  render: () => {
    const [selected, setSelected] = useState<string>('a');
    const items = [
      { id: 'a', label: '메인텍스트 메인텍스트', subLabel: '서브 텍스트 서브 텍스트 서브 텍스트' },
      { id: 'b', label: '메인텍스트 메인텍스트', subLabel: '서브 텍스트 서브 텍스트 서브 텍스트' },
    ];
    return (
      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <HiRadio
            key={item.id}
            select={selected === item.id ? 'on' : 'off'}
            label={item.label}
            subLabel={item.subLabel}
            onChange={() => setSelected(item.id)}
          />
        ))}
      </div>
    );
  },
};

// ── 전체 상태 ─────────────────────────────────────────────────────
export const AllStates: Story = {
  render: () => {
    const states = ['off', 'on', 'focus'] as const;
    return (
      <div className="flex flex-row gap-15">
        {/* 활성화 컬럼: 각 상태를 그대로 보여줍니다 (on은 활성, focus는 포커스 스타일) */}
        <div className="flex flex-col gap-6">
          {states.map((key) => (
            <HiRadio
              key={key}
              select={key}
              label={key}
              onChange={() => {}}
            />
          ))}
        </div>
        {/* 비활성화 컬럼 */}
        <div className="flex flex-col gap-6">
          {states.map((key) => (
            <HiRadio
              key={key}
              select={key}
              label={`${key} disabled`}
              disabled
            />
          ))}
        </div>
      </div>
    );
  },
};

// ── RadioGroup Vertical ───────────────────────────────────────────
export const Group: Story = {
  name: 'HiRadioGroup_Vertical',
  render: () => {
    const [value, setValue] = useState('a');
    return (
      <HiRadioGroup
        value={value}
        options={[
          { value: 'a', label: '옵션 1', subLabel: '서브 텍스트' },
          { value: 'b', label: '옵션 2', subLabel: '서브 텍스트' },
          { value: 'c', label: '옵션 3 (disabled)', disabled: true },
        ]}
        onChange={setValue}
      />
    );
  },
};

// ── RadioGroup Horizontal ─────────────────────────────────────────
export const GroupHorizontal: Story = {
  name: 'HiRadioGroup_Horizontal',
  render: () => {
    const [value, setValue] = useState('a');
    return (
      <HiRadioGroup
        direction="horizontal"
        value={value}
        options={[
          { value: 'a', label: '옵션 1' },
          { value: 'b', label: '옵션 2' },
          { value: 'c', label: '옵션 3' },
        ]}
        onChange={setValue}
      />
    );
  },
};

// ── RadioGroup Disabled ───────────────────────────────────────────
export const GroupDisabled: Story = {
  name: 'HiRadioGroup_Disabled',
  render: () => (
    <HiRadioGroup
      value="a"
      disabled
      options={[
        { value: 'a', label: '옵션 1' },
        { value: 'b', label: '옵션 2' },
        { value: 'c', label: '옵션 3' },
      ]}
    />
  ),
};

// ── Custom Color ──────────────────────────────────────────────────
export const CustomColor: Story = {
  name: 'Custom Color',
  render: () => {
    const [primary, setPrimary] = useState<RadioSelect>('on');
    const [red, setRed]         = useState<RadioSelect>('on');
    const [green, setGreen]     = useState<RadioSelect>('on');
    return (
      <div className="flex flex-col gap-4">
        <HiRadio select={primary} label="기본 (primary)"  onChange={setPrimary} />
        <HiRadio select={red}     label="Red"   color="graphic-red"   onChange={setRed} />
        <HiRadio select={green}   label="Green" color="var(--graphic-green)" onChange={setGreen} />
      </div>
    );
  },
};