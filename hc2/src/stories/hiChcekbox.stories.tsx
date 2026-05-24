import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, useEffect } from 'react';
import { HiCheckbox } from '@/components/uiux/hiCheckbox';

type CheckboxSelect = 'off' | 'on' | 'focus' | 'indeterminate';

const meta = {
  title: 'ui/HiCheckbox',
  component: HiCheckbox,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  // ── docs 탭에서도 클릭 동작하도록 decorator로 상태 주입
  decorators: [
    (Story, context) => {
      const [select, setSelect] = useState<CheckboxSelect>(context.args.select ?? 'off');

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
      options: ['off', 'on', 'focus', 'indeterminate'],
    },
    type: {
      control: 'select',
      options: ['normal', 'terms'],
    },
    disabled:     { control: 'boolean' },
    label:        { control: 'text' },
    labelPrefix:  { control: 'text' },
    subLabel:     { control: 'text' },
    color:        { control: 'text' },
  },
  args: {
    select:      'off',
    type:        'normal',
    disabled:    false,
    label:       '메인텍스트',
    labelPrefix: undefined,
    subLabel:    '서브 텍스트 서브 텍스트',
    color:       undefined,
  },
} satisfies Meta<typeof HiCheckbox>;

export default meta;

type Story = StoryObj<typeof meta>;

// ── controls로 직접 상태 제어 (off→focus: off+ring, on→focus: on+ring) ──
export const Default: Story = {
  args: { select: 'on' },
  render: (args) => (
    <HiCheckbox {...args} />
  ),
};

// ── 상태별 시각 확인 (고정값) ─────────────────────────────────────
export const States: Story = {
  name: 'States',
  render: () => (
    <div className="flex flex-col gap-4">
      {(['off', 'on', 'focus', 'indeterminate'] as const).map((key) => (
        <HiCheckbox
          key={key}
          select={key}
          label={key}
          subLabel="서브 텍스트"
        />
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {(['off', 'on', 'focus', 'indeterminate'] as const).map((select) => (
        <HiCheckbox
          key={select}
          select={select}
          label={`${select} disabled`}
          subLabel="서브 텍스트"
          disabled
        />
      ))}
    </div>
  ),
};

export const Types: Story = {
  render: () => {
    const [normal, setNormal] = useState<CheckboxSelect>('off');
    const [terms1, setTerms1] = useState<CheckboxSelect>('off');
    const [terms2, setTerms2] = useState<CheckboxSelect>('off');
    const [terms3, setTerms3] = useState<CheckboxSelect>('off');
    return (
      <div className="flex flex-col gap-4">
        {/* normal */}
        <HiCheckbox
          type="normal"
          select={normal}
          label="normal — 메인텍스트"
          subLabel="서브 텍스트 서브 텍스트"
          onChange={setNormal}
        />
        {/* terms — prefix 없음 */}
        <HiCheckbox
          type="terms"
          select={terms1}
          label="이용약관에 동의합니다"
          onChange={setTerms1}
        />
        {/* terms — prefix + 한 줄 */}
        <HiCheckbox
          type="terms"
          select={terms2}
          labelPrefix="[필수]"
          label="이용약관에 동의합니다"
          onChange={setTerms2}
        />
        {/* terms — prefix + 서브텍스트 */}
        <HiCheckbox
          type="terms"
          select={terms3}
          labelPrefix="[선택]"
          label="마케팅 수신에 동의합니다"
          subLabel="서브 텍스트 서브 텍스트 서브 텍스트"
          onChange={setTerms3}
        />
      </div>
    );
  },
};

export const NoLabel: Story = {
  render: () => {
    const [values, setValues] = useState<Record<string, CheckboxSelect>>({
      off:           'off',
      on:            'on',
      focus:         'focus',
      indeterminate: 'indeterminate',
    });
    return (
      <div className="flex gap-4">
        {(['off', 'on', 'focus', 'indeterminate'] as const).map((key) => (
          <HiCheckbox
            key={key}
            select={values[key]}
            onChange={(v) => setValues((prev) => ({ ...prev, [key]: v }))}
          />
        ))}
      </div>
    );
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-row gap-15">
      {/* 활성화 컬럼 */}
      <div className="flex flex-col gap-6">
        {(['off', 'on', 'focus', 'indeterminate'] as const).map((key) => (
          <HiCheckbox key={key} select={key} label={key} subLabel="서브 텍스트" />
        ))}
      </div>
      {/* 비활성화 컬럼 */}
      <div className="flex flex-col gap-6">
        {(['off', 'on', 'focus', 'indeterminate'] as const).map((key) => (
          <HiCheckbox key={key} select={key} label={`${key} disabled`} subLabel="서브 텍스트" disabled />
        ))}
      </div>
    </div>
  ),
};

export const CustomColor: Story = {
  name: 'Custom Color',
  render: () => {
    const [primary, setPrimary] = useState<CheckboxSelect>('on');
    const [red, setRed]         = useState<CheckboxSelect>('on');
    const [green, setGreen]     = useState<CheckboxSelect>('on');
    return (
      <div className="flex flex-col gap-4">
        <HiCheckbox select={primary} label="기본 (primary)"  subLabel="서브텍스트"  onChange={setPrimary} />
        <HiCheckbox select={red}     label="Red"   subLabel="서브텍스트"   color="graphic-red"   onChange={setRed} />
        <HiCheckbox select={green}   label="Green" subLabel="서브텍스트" color="var(--graphic-green)" onChange={setGreen} />
      </div>
    );
  },
};