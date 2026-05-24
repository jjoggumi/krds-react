import React, { useState } from 'react';
import { Meta, StoryFn } from '@storybook/react';
import HiInput, { HiInputProps } from '../components/uiux/hiInput';

const meta = {
  title: 'UI/HiInput',
  component: HiInput,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    placeholder: 'Enter text',
    showClearButton: true,
    showSearchIco: false,
    showSearch: false,
    inTable: false,
    disabled: false,
    state: undefined,
    size: 'md',
  },
} satisfies Meta<typeof HiInput>;

export default meta;

const Template: StoryFn<HiInputProps> = (args) => {
  const [value, setValue] = useState('');
  return (
    <div style={{ width: 400 }}>
      <HiInput {...args} value={value} onChange={(e) => setValue((e as any).target.value)} />
    </div>
  );
};

export const Default = Template.bind({});
Default.parameters = { docs: { storyDescription: '기본 입력 컴포넌트 — 컨트롤로 속성 조절' } };

export const WithSearchIcon = Template.bind({});
WithSearchIcon.args = { showSearchIco: true, placeholder: 'Search...' };

export const WithSearchButton = Template.bind({});
WithSearchButton.args = { showSearch: true, placeholder: 'Search with button' };

export const Sizes: StoryFn<HiInputProps> = (args) => {
  const sizes: Array<NonNullable<HiInputProps['size']>> = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
  const [values, setValues] = useState<Record<string, string>>({});
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {sizes.map((s) => (
        <div key={s} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 13 }}>{s}</div>
          <HiInput
            {...args}
            size={s}
            value={values[s] ?? ''}
            onChange={(e) => setValues({ ...values, [s]: (e as any).target.value })}
            placeholder={`Size ${s}`}
          />
        </div>
      ))}
    </div>
  );
};

export const States: StoryFn<HiInputProps> = (args) => {
  const [v1, setV1] = useState('');
  const [v2, setV2] = useState('error value');
  return (
    <div style={{ display: 'grid', gap: 12, width: 360 }}>
      <HiInput {...args} value={v1} onChange={(e) => setV1((e as any).target.value)} placeholder="Normal" />
      <HiInput {...args} state="success" message="Looks good" value={v1} onChange={(e) => setV1((e as any).target.value)} placeholder="Success" />
      <HiInput {...args} state="error" message="This field is required" value={v2} onChange={(e) => setV2((e as any).target.value)} placeholder="Error" />
    </div>
  );
};

export const InTable: StoryFn<HiInputProps> = (args) => {
  const [value, setValue] = useState('');
  return (
    <div style={{ border: '1px solid #eee', padding: 12, width: 600 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 12 }}>
        <div>
          <div style={{ marginBottom: 8 }}>Other content</div>
          <div style={{ height: 40, border: '1px solid #ddd', display: 'flex', alignItems: 'center' }}>
            <HiInput {...args} inTable value={value} onChange={(e) => setValue((e as any).target.value)} placeholder="In table" />
          </div>
        </div>
        <div>
          <div style={{ marginBottom: 8 }}>Side column</div>
          <div style={{ height: 40, border: '1px solid #ddd' }} />
        </div>
      </div>
    </div>
  );
};
