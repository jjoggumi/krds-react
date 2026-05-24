import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import Tooltip from '@/components/uiux/tooltip';
import { HiButton } from '@/components/uiux/hiButton';

const meta = {
	title: 'ui/Tooltip',
	component: Tooltip,
	tags: ['autodocs'],
	parameters: { layout: 'centered' },
	argTypes: {
		position: { control: 'select', options: ['top', 'bottom', 'left', 'right', 'center-top', 'center-bottom', 'center-left', 'center-right'] },
		ani: { control: 'select', options: ['shakeX','shakeY','fade','shakeXOut','shakeYOut'] },
		intent: { control: 'select', options: ['solid','solidLight'] },
		size: { control: 'select', options: ['sm','md','lg'] },
		color: { control: 'text' },
	},
	args: {
		titleHtml: '툴팁 타이틀 예시',
		position: 'bottom',
		intent: 'solid',
		size: 'md',
		ani: undefined,
	},
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 툴팁(버블) 단독 표시
export const Default: Story = {
	render: (args) => <Tooltip {...args} isActive />,
};

// 포지션별 예시 (버튼 트리거)
export const Positions: Story = {
	name: '포지션',
	render: () => (
		<div className="flex flex-col gap-8 items-center p-20">
			{(['top','bottom','left','right','center-top','center-bottom','center-left','center-right'] as const).map((position) => (
				<Tooltip key={position} position={position} titleHtml={`포지션: ${position}`} isActive>
					<HiButton size="sm" variant="tertiary">{position}</HiButton>
				</Tooltip>
			))}
		</div>
	),
};

// 인텐트 및 사이즈 예시
export const Variants: Story = {
	name: '인텐트 및 사이즈',
	render: () => (
		<div className="flex gap-4 items-center p-8">
			<Tooltip titleHtml="Solid (sm)" intent="solid" size="sm" isActive>
				<HiButton size="sm">Solid</HiButton>
			</Tooltip>
			<Tooltip titleHtml="SolidLight (md)" intent="solidLight" size="md" isActive>
				<HiButton size="sm">SolidLight</HiButton>
			</Tooltip>
			<Tooltip titleHtml="애니메이션 shakeX" ani="shakeX" isActive>
				<HiButton size="sm">ShakeX</HiButton>
			</Tooltip>
		</div>
	),
};

// 인터랙티브 예시: 버튼 클릭으로 토글
export const Interactive: Story = {
	name: '인터랙티브',
	render: () => {
		const [open, setOpen] = useState(false);
		return (
			<Tooltip titleHtml="버튼으로 토글되는 툴팁" position="bottom" isActive={open}>
				<HiButton onClick={() => setOpen((v) => !v)}>{open ? '닫기' : '열기'}</HiButton>
			</Tooltip>
		);
	},
};

