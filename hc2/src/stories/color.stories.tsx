import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Foundation/Color',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ────────────────────────────────────────────────
// 공통 컴포넌트
// ────────────────────────────────────────────────
function ColorSwatch({ name, value }: { name: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 w-28">
      <div
        className="h-12 w-full rounded border border-border-neutral-subtle"
        style={{ background: value }}
      />
      <p className="text-[11px] font-mono text-text-neutral-stronger leading-tight break-all">{name}</p>
      <p className="text-[11px] text-text-neutral-subtle leading-tight">{value}</p>
    </div>
  );
}

function CssVarSwatch({ varName }: { varName: string }) {
  return (
    <div className="flex flex-col gap-1 w-28">
      <div
        className="h-12 w-full rounded border border-border-neutral-subtle"
        style={{ background: `var(${varName})` }}
      />
      <p className="text-[11px] font-mono text-text-neutral-stronger leading-tight break-all">{varName}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="text-leading-h5 font-semibold text-text-default mb-4">{title}</h2>
      <div className="flex flex-wrap gap-4">{children}</div>
    </div>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h3 className="text-leading-b2 font-medium text-text-neutral-stronger mb-3">{title}</h3>
      <div className="flex flex-wrap gap-3">{children}</div>
    </div>
  );
}

// ────────────────────────────────────────────────
// 프리미티브 팔레트
// ────────────────────────────────────────────────
const BLUE = [
  ['--blue-50', '#e8f3ff'],
  ['--blue-100', '#c0dfff'],
  ['--blue-200', '#9accff'],
  ['--blue-300', '#74b7ff'],
  ['--blue-400', '#5ca7ff'],
  ['--blue-500', '#4d98ff'],
  ['--blue-600', '#4b89f2'],
  ['--blue-700', '#4777de'],
  ['--blue-800', '#4365cb'],
  ['--blue-900', '#3c46ab'],
  ['--blue-950', '#1e3284'],
] as const;

const OCEAN = [
  ['--ocean-50', '#f2f7fc'],
  ['--ocean-100', '#e3eaf6'],
  ['--ocean-200', '#cddcf0'],
  ['--ocean-300', '#b2cae9'],
  ['--ocean-400', '#83abde'],
  ['--ocean-500', '#608dd1'],
  ['--ocean-600', '#4c72c4'],
  ['--ocean-700', '#4867b5'],
  ['--ocean-800', '#3b5392'],
  ['--ocean-900', '#213567'],
  ['--ocean-950', '#192747'],
] as const;

const SLATE = [
  ['--slate-50', '#f5f7fb'],
  ['--slate-100', '#ebeef4'],
  ['--slate-200', '#d5dbe8'],
  ['--slate-300', '#B8C4D8'],
  ['--slate-400', '#95a6c5'],
  ['--slate-500', '#7c8db5'],
  ['--slate-600', '#6a77a6'],
  ['--slate-700', '#5e6897'],
  ['--slate-800', '#50577d'],
  ['--slate-900', '#434965'],
  ['--slate-950', '#2c2e3f'],
] as const;

const GRAY = [
  ['--gray-0', '#ffffff'],
  ['--gray-50', '#fafafa'],
  ['--gray-100', '#f6f6f6'],
  ['--gray-200', '#f3f3f3'],
  ['--gray-300', '#eeeeee'],
  ['--gray-400', '#e0e0e0'],
  ['--gray-500', '#d6d6d6'],
  ['--gray-600', '#bdbdbd'],
  ['--gray-700', '#9e9e9e'],
  ['--gray-800', '#616161'],
  ['--gray-900', '#3a3a3a'],
  ['--gray-950', '#1b1b1b'],
  ['--gray-1000', '#000000'],
] as const;

const MINT = [
  ['--mint-50', '#f1fcf9'],
  ['--mint-100', '#d0f7ee'],
  ['--mint-200', '#a0efdc'],
  ['--mint-300', '#69dfc7'],
  ['--mint-400', '#36bca6'],
  ['--mint-500', '#21ab97'],
  ['--mint-600', '#18897b'],
  ['--mint-700', '#176e64'],
  ['--mint-800', '#175852'],
  ['--mint-900', '#184944'],
  ['--mint-950', '#072c2a'],
] as const;

const GREEN = [
  ['--green-50', '#eefff4'],
  ['--green-100', '#d7ffe7'],
  ['--green-200', '#b2ffd1'],
  ['--green-300', '#83f8b2'],
  ['--green-400', '#3bf086'],
  ['--green-500', '#09de61'],
  ['--green-600', '#00c853'],
  ['--green-700', '#049140'],
  ['--green-800', '#0a7136'],
  ['--green-900', '#0a5d2f'],
  ['--green-950', '#003417'],
] as const;

const YELLOW = [
  ['--yellow-50', '#fffbeb'],
  ['--yellow-100', '#fff5d1'],
  ['--yellow-200', '#ffe588'],
  ['--yellow-300', '#ffd24a'],
  ['--yellow-400', '#ffbd20'],
  ['--yellow-500', '#ff9800'],
  ['--yellow-600', '#e27100'],
  ['--yellow-700', '#bb4c02'],
  ['--yellow-800', '#983a08'],
  ['--yellow-900', '#7c300b'],
  ['--yellow-950', '#481700'],
] as const;

const ORANGE = [
  ['--orange-50', '#fff6ed'],
  ['--orange-100', '#ffebd4'],
  ['--orange-200', '#ffd3a8'],
  ['--orange-300', '#ffb371'],
  ['--orange-400', '#ff8737'],
  ['--orange-500', '#fe6611'],
  ['--orange-600', '#ef4b07'],
  ['--orange-700', '#c63508'],
  ['--orange-800', '#9d2c0f'],
  ['--orange-900', '#7e2610'],
  ['--orange-950', '#441006'],
] as const;

const RED = [
  ['--red-50', '#fff1f2'],
  ['--red-100', '#ffe0e2'],
  ['--red-200', '#ffc6ca'],
  ['--red-300', '#ff9ea5'],
  ['--red-400', '#ff6670'],
  ['--red-500', '#fd3644'],
  ['--red-600', '#ec1f2d'],
  ['--red-700', '#c60f1b'],
  ['--red-800', '#a4101a'],
  ['--red-900', '#87151d'],
  ['--red-950', '#4a050a'],
] as const;

const ALPHA = [
  ['--alpha-blue-80', 'rgba(71, 119, 222, 0.8)'],
  ['--alpha-blue-60', 'rgba(71, 119, 222, 0.6)'],
  ['--alpha-blue-40', 'rgba(71, 119, 222, 0.4)'],
  ['--alpha-blue-20', 'rgba(71, 119, 222, 0.2)'],
  ['--alpha-blue-10', 'rgba(71, 119, 222, 0.1)'],
  ['--alpha-black-80', 'rgba(0, 0, 0, 0.8)'],
  ['--alpha-black-60', 'rgba(0, 0, 0, 0.6)'],
  ['--alpha-black-40', 'rgba(0, 0, 0, 0.4)'],
  ['--alpha-black-20', 'rgba(0, 0, 0, 0.2)'],
  ['--alpha-black-10', 'rgba(0, 0, 0, 0.1)'],
  ['--alpha-white-80', 'rgba(255, 255, 255, 0.8)'],
  ['--alpha-white-60', 'rgba(255, 255, 255, 0.6)'],
  ['--alpha-white-40', 'rgba(255, 255, 255, 0.4)'],
  ['--alpha-white-20', 'rgba(255, 255, 255, 0.2)'],
  ['--alpha-white-10', 'rgba(255, 255, 255, 0.1)'],
] as const;

// ────────────────────────────────────────────────
// 시맨틱 토큰
// ────────────────────────────────────────────────
const SEMANTIC_BG = [
  '--bg-base', '--bg-primary-subtlest', '--bg-primary-subtler', '--bg-primary-base',
  '--bg-secondary-subtlest', '--bg-secondary-subtler', '--bg-secondary-base',
  '--bg-tertiary-stronger',
  '--bg-neutral-subtlest', '--bg-neutral-subtler', '--bg-neutral-subtle',
  '--bg-neutral-base', '--bg-neutral-strong', '--bg-neutral-stronger',
  '--bg-red-subtlest', '--bg-green-subtlest', '--bg-yellow-subtlest',
  '--bg-orange-subtlest', '--bg-orange-subtler', '--bg-mint-subtlest',
  '--bg-fixed-white', '--bg-fixed-black', '--bg-inverse',
] as const;

const SEMANTIC_BORDER = [
  '--border-primary-subtlest', '--border-primary-base',
  '--border-secondary-subtlest', '--border-secondary-subtler', '--border-secondary-base',
  '--border-tertiary-subtler',
  '--border-neutral-subtlest', '--border-neutral-subtler', '--border-neutral-subtle',
  '--border-neutral-base', '--border-neutral-strong', '--border-neutral-stronger',
  '--border-neutral-strongest',
] as const;

const SEMANTIC_TEXT = [
  '--text-base', '--text-inverse', '--text-default',
  '--text-neutral-stronger', '--text-neutral-strong', '--text-neutral-subtle', '--text-neutral-base',
  '--text-primary-base',
  '--text-secondary-base', '--text-secondary-stronger', '--text-secondary-strongest',
] as const;

const SEMANTIC_CONTROL = [
  '--control-base', '--control-neutral-base', '--control-neutral-strong', '--control-neutral-stronger',
  '--control-primary',
  '--control-secondary-subtlest', '--control-secondary-subtle',
  '--control-red-subtlest', '--control-red-subtle', '--control-red-base',
] as const;

const SEMANTIC_ACTION = [
  '--action-base',
  '--action-primary-subtler', '--action-primary-base',
  '--action-neutral-strong', '--action-neutral-stronger',
  '--action-secondary-subtler', '--action-secondary-stronger', '--action-secondary-strongest',
  '--action-red-base',
] as const;

const GRAPHIC = [
  '--graphic-iceBlue', '--graphic-blue', '--graphic-mint', '--graphic-emerald',
  '--graphic-green', '--graphic-forest', '--graphic-amber', '--graphic-yellow',
  '--graphic-orange', '--graphic-coral', '--graphic-red', '--graphic-magenta',
  '--graphic-lavender', '--graphic-violet',
] as const;

// ────────────────────────────────────────────────
// Stories
// ────────────────────────────────────────────────
export const Primitives: Story = {
  name: '프리미티브 팔레트',
  render: () => (
    <div>
      <Section title="Blue">
        {BLUE.map(([name, value]) => <ColorSwatch key={name} name={name} value={value} />)}
      </Section>
      <Section title="Ocean">
        {OCEAN.map(([name, value]) => <ColorSwatch key={name} name={name} value={value} />)}
      </Section>
      <Section title="Slate">
        {SLATE.map(([name, value]) => <ColorSwatch key={name} name={name} value={value} />)}
      </Section>
      <Section title="Gray">
        {GRAY.map(([name, value]) => <ColorSwatch key={name} name={name} value={value} />)}
      </Section>
      <Section title="Mint">
        {MINT.map(([name, value]) => <ColorSwatch key={name} name={name} value={value} />)}
      </Section>
      <Section title="Green">
        {GREEN.map(([name, value]) => <ColorSwatch key={name} name={name} value={value} />)}
      </Section>
      <Section title="Yellow">
        {YELLOW.map(([name, value]) => <ColorSwatch key={name} name={name} value={value} />)}
      </Section>
      <Section title="Orange">
        {ORANGE.map(([name, value]) => <ColorSwatch key={name} name={name} value={value} />)}
      </Section>
      <Section title="Red">
        {RED.map(([name, value]) => <ColorSwatch key={name} name={name} value={value} />)}
      </Section>
      <Section title="Alpha">
        <div className="p-4 rounded bg-gray-400">
          <div className="flex flex-wrap gap-3">
            {ALPHA.map(([name, value]) => <ColorSwatch key={name} name={name} value={value} />)}
          </div>
        </div>
      </Section>
    </div>
  ),
};

export const SemanticTokens: Story = {
  name: '시맨틱 토큰',
  render: () => (
    <div>
      <SubSection title="Background">
        {SEMANTIC_BG.map((v) => <CssVarSwatch key={v} varName={v} />)}
      </SubSection>
      <SubSection title="Border">
        {SEMANTIC_BORDER.map((v) => <CssVarSwatch key={v} varName={v} />)}
      </SubSection>
      <SubSection title="Text">
        {SEMANTIC_TEXT.map((v) => <CssVarSwatch key={v} varName={v} />)}
      </SubSection>
      <SubSection title="Control">
        {SEMANTIC_CONTROL.map((v) => <CssVarSwatch key={v} varName={v} />)}
      </SubSection>
      <SubSection title="Action">
        {SEMANTIC_ACTION.map((v) => <CssVarSwatch key={v} varName={v} />)}
      </SubSection>
      <SubSection title="Graphic">
        {GRAPHIC.map((v) => <CssVarSwatch key={v} varName={v} />)}
      </SubSection>
    </div>
  ),
};
