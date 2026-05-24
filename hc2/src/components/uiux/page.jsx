import React, { useState } from 'react';

import { HiButton } from './';
import Icon, { iconNames } from './hiIcon';
import { HiInput } from './hiInput';
import { Textarea } from './textarea';
import { Switch } from './switch';
import HiBadge from './hiBadge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './table';
import HiModal from './hiModal';
import HiSelectBox from './hiSelectBox';
// import BadgeDemo from './BadgeDemo';
import Tooltip from './tooltip';
import HiTab from './hiTab';

const ICON_LIST = iconNames;

export const TextMain = ({ route, authorities }) => {
  const [inputValue, setInputValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');
  const [checked, setChecked] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectValue, setSelectValue] = useState(null);
  const [activeTab, setActiveTab] = useState('Buttons');

  const selectItems = [
    { value: 1, title: 'Option 1' },
    { value: 2, title: 'Option 2' },
    { value: 3, title: 'Option 3' },
  ];

  const TAB_LIST = [
    'Buttons', 'Icons', 'Tooltip', 'Inputs', 'Textarea',
    'Switch', 'Badge', 'Table', 'Modal', 'Select', 'Tabs',
  ];

  return (
    <div style={{ fontFamily: 'Inter, Arial, sans-serif' }} className="flex flex-col h-screen bg-bg-neutral-subtle">
      {/* Sticky Nav */}
      <div className="sticky top-0 z-50 bg-bg-fixed-white border-b border-border-neutral-base" style={{backdropFilter: 'blur(8px)'}}>
        <div className="flex items-center gap-2 px-2 h-12 overflow-x-auto scrollbar-none rounded-xl mt-0 mb-0 border-b border-border-neutral-base bg-bg-fixed-white">
          {TAB_LIST.map((t) => (
            <HiButton
              key={t}
              onClick={() => setActiveTab(t)}
              className={[
                'relative shrink-0 px-5 py-2 h-10 text-b3 font-medium rounded-xl transition-all duration-200',
                activeTab === t
                  ? 'bg-bg-primary-base text-text-base'
                  : 'bg-transparent text-text-neutral-strong hover:bg-bg-primary-subtlest hover:text-text-primary-base',
              ].join(' ')}
              style={{ boxShadow: 'none' }}
            >
              {t}
            </HiButton>
          ))}
        </div>
      </div>

      {/* Tab panels */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'Buttons' && (
          <div className="space-y-8">
            <section>
              <h4 className="mb-2 font-bold">Types</h4>
              <div className="flex gap-2 flex-wrap">
                {['primary', 'secondary', 'tertiaryBlue', 'tertiary', 'warningLine', 'underline', 'link'].map((t) => (
                  <HiButton key={t} variant={t} size="md">{t}</HiButton>
                ))}
              </div>
            </section>

            <section>
              <h4 className="mb-2 font-bold">Sizes</h4>
              <div className="flex gap-2 items-center flex-wrap">
                {['2xl', 'xl', 'lg', 'md', 'sm', 'xs'].map((s) => (
                  <HiButton key={s} variant="primary" size={s}>{s}</HiButton>
                ))}
              </div>
              <div className="mt-2">
                <HiButton variant="primary" size="md" block>Block</HiButton>
              </div>
            </section>

            <section>
              <h4 className="mb-2 font-bold">Shapes</h4>
              <div className="flex gap-2 items-center flex-wrap">
                {['rounded', 'pill', 'square'].map((sh) => (
                  <HiButton key={sh} variant="primary" size="md" shape={sh}>{sh}</HiButton>
                ))}
              </div>
            </section>

            <section>
              <h4 className="mb-2 font-bold">States — disabled</h4>
              <div className="flex gap-2 flex-wrap">
                {['primary', 'secondary', 'tertiaryBlue', 'tertiary', 'warningLine', 'underline', 'link'].map((t) => (
                  <HiButton key={t} variant={t} size="md" disabled>{t}</HiButton>
                ))}
              </div>
            </section>

            <section>
              <h4 className="mb-2 font-bold">States — active (pressed)</h4>
              <div className="flex gap-2 flex-wrap">
                {['primary', 'secondary', 'tertiaryBlue', 'tertiary', 'warningLine'].map((t) => (
                  <HiButton key={t} variant={t} size="md" active>{t}</HiButton>
                ))}
              </div>
            </section>

            
          </div>
        )}

        {activeTab === 'Icons' && (
            <section className="p-4 bg-bg-base rounded-lg border border-border-neutral-subtle">
            <div className="mb-4">
              <h3 className="text-lg font-medium">Icon Gallery ({ICON_LIST.length})</h3>
              <p className="text-b3 text-text-neutral-strong">아이콘을 클릭하면 이름을 콘솔에 출력합니다.</p>
            </div>
            
            {/* 그리드 레이아웃으로 아이콘 배열 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
              {ICON_LIST.map((name) => (
                <div 
                  key={name} 
                  onClick={() => {
                    console.log(name);
                    alert(`Copied: ${name}`); // 간단한 알림
                  }}
                  className="flex flex-col items-center justify-center p-4 border border-border-neutral-subtler rounded-md hover:bg-bg-neutral-subtlest cursor-pointer transition-all"
                >
                  {/* 아이콘 컴포넌트 호출 */}
                  <div className="mb-2 text-neutral-stronger">
                    <Icon icon={name} iconSize={32} color="light-gray" />
                  </div>
                  
                  {/* 아이콘 이름 표시 */}
                  <span className="text-d3 text-text-neutral-strong text-center break-all leading-tight">
                    {name}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'Tooltip' && (
          <div className="space-y-8">
          <section className="mb-6 space-y-4">
            <h4 className="mb-2 font-bold">HiTooltip — 기본</h4>
            <div className="flex gap-4 items-center">
                <Tooltip titleHtml="Simple tooltip">
                  <button className="px-3 py-1 bg-gray-100 rounded">Hover me</button>
                </Tooltip>

                <Tooltip titleHtml="Tooltip with icon" icon="info" color="primary">
                  <span className="px-3 py-1">Hover span</span>
                </Tooltip>

                <Tooltip titleHtml="No children: icon only" icon="info" color="noti" />
            </div>

            <h4 className="mb-2 font-bold">Positions</h4>
            <div className="flex gap-2 flex-wrap">
              {['top','bottom','left','right','center-top','center-bottom','center-left','center-right'].map((pos) => (
                <Tooltip key={pos} titleHtml={`pos: ${pos}`} position={pos}>
                  <button className="px-2 py-1 bg-gray-100 rounded">{pos}</button>
                </Tooltip>
              ))}
            </div>

            <h4 className="mb-2 font-bold">Animations</h4>
            <div className="flex gap-2">
              <Tooltip titleHtml="ani x" ani="shakeX"><button className="px-3 py-1 bg-gray-100 rounded">ani x</button></Tooltip>
              <Tooltip titleHtml="ani y" ani="shakeY"><button className="px-3 py-1 bg-gray-100 rounded">ani y</button></Tooltip>
              <Tooltip titleHtml="fade" ani="fade"><button className="px-3 py-1 bg-gray-100 rounded">fade</button></Tooltip>
            </div>

            <h4 className="mb-2 font-bold">Colors (named & CSS)</h4>
            <div className="flex gap-2 flex-wrap items-center">
              {['primary','secondary','success','noti','warning','info','error','purple'].map((c) => (
                <Tooltip key={c} titleHtml={c} color={c}><button className="px-2 py-1 bg-gray-100 rounded">{c}</button></Tooltip>
              ))}
            </div>
          </section>
          <section className="mb-6 space-y-4">
            <h4 className="mb-2 font-semibold">Intents & Sizes</h4>
            <div className="flex flex-col gap-3">
              <div className="flex gap-2 items-center">
                <Tooltip titleHtml="solid (default)" intent="solid" color="primary">
                  <button className="px-3 py-1 bg-gray-100 rounded">solid</button>
                </Tooltip>
                <Tooltip titleHtml="solidLight" intent="solidLight" color="primary">
                  <button className="px-3 py-1 bg-gray-100 rounded">solidLight</button>
                </Tooltip>
                <Tooltip titleHtml="solid (secondary)" intent="solid" color="secondary">
                  <button className="px-3 py-1 bg-gray-100 rounded">solid secondary</button>
                </Tooltip>
              </div>
              <div className="flex gap-2 items-center">
                <Tooltip titleHtml="size: sm" size="sm">
                  <button className="px-3 py-1 bg-gray-100 rounded">sm</button>
                </Tooltip>
                <Tooltip titleHtml="size: md" size="md">
                  <button className="px-3 py-1 bg-gray-100 rounded">md</button>
                </Tooltip>
                <Tooltip titleHtml="size: lg" size="lg">
                  <button className="px-3 py-1 bg-gray-100 rounded">lg</button>
                </Tooltip>
              </div>
              <div className="flex gap-2 items-center">
                <Tooltip titleHtml="arrowOffset 4px" position="top" arrowOffset={4}>
                  <button className="px-3 py-1 bg-gray-100 rounded">arrow 4px</button>
                </Tooltip>
                <Tooltip titleHtml="arrowOffset 16px" position="top" arrowOffset={16}>
                  <button className="px-3 py-1 bg-gray-100 rounded">arrow 16px</button>
                </Tooltip>
              </div>
            </div>
          </section>
          </div>
        )}

        {activeTab === 'Inputs' && (
          <section className="mb-3">
            <HiInput value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Type here" />
          </section>
        )}

        {activeTab === 'Textarea' && (
          <section className="mb-3">
            <Textarea value={textareaValue} onChange={(e) => setTextareaValue(e.target.value)} rows={6} />
          </section>
        )}

        {activeTab === 'Switch' && (
          <section className="mb-3">
            <label className="flex items-center gap-2">
              <Switch model={checked} onUpdateModel={(v) => setChecked(v)} />
              <span>Switch is {checked ? 'ON' : 'OFF'}</span>
            </label>
          </section>
        )}

        {activeTab === 'Badge' && (
          <div className="space-y-8">
            {/* Intent × Color */}
            {['solid', 'solidLight', 'outline'].map((intent) => (
              <section key={intent}>
                <h4 className="mb-2 font-bold">{intent}</h4>
                <div className="flex gap-2 flex-wrap">
                  {['primary', 'success', 'noti', 'warning', 'navy', 'purple', 'disabled'].map((color) => (
                    <HiBadge key={color} intent={intent} color={color}>{color}</HiBadge>
                  ))}
                </div>
              </section>
            ))}

            {/* Shape */}
            <section>
              <h4 className="mb-2 font-bold">Shape</h4>
              <div className="flex gap-3">
                {['rounded', 'pill', 'square'].map((shape) => (
                  <HiBadge key={shape} shape={shape} color="primary">{shape}</HiBadge>
                ))}
              </div>
            </section>

            {/* Size */}
            <section>
              <h4 className="mb-2 font-bold">Size</h4>
              <div className="flex gap-3 items-center">
                {['sm', 'md', 'lg'].map((size) => (
                  <HiBadge key={size} size={size} color="primary">{size}</HiBadge>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'Table' && (
          <section className="mb-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>1</TableCell>
                  <TableCell>Example</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </section>
        )}

        {activeTab === 'Modal' && (
          <section className="mb-3">
            <HiModal isOpen={modalOpen} onClose={() => setModalOpen(false)} heading={<strong>Modal Title</strong>}>
              <div>Modal content here</div>
              <div style={{ marginTop: 12 }}>
              </div>
            </HiModal>
          </section>
        )}

        {activeTab === 'Select' && (
          <section className="mb-3">
            <HiSelectBox value={selectValue} items={selectItems} onChange={(v) => setSelectValue(v)} />
          </section>
        )}

        {activeTab === 'Tabs' && (
          <section className="grid gap-6">
            {/* Underline variants */}
            <div>
              <h4 className="mb-3 font-semibold text-b3 text-text-neutral-strong uppercase tracking-wide">Underline</h4>
              <div className="grid grid-cols-1 gap-2">
                <div className="p-4 bg-bg-fixed-white border border-border-neutral-subtle">
                  <p className="mb-3 text-d2 text-text-neutral-strong font-medium">Primary</p>
                  <div>
                    <HiTab labels={['텍스트', '텍스트', '텍스트']} variant="underline" />
                  </div>
                </div>
              </div>
            </div>

            {/* Pills variants */}
            <div>
              <h4 className="mb-3 font-semibold text-b3 text-text-neutral-strong uppercase tracking-wide">Pills</h4>
              <div className="grid grid-cols-1 gap-2">
                <div className="p-4 bg-bg-fixed-white rounded-lg border border-border-neutral-subtle">
                  <p className="mb-3 text-d2 text-text-neutral-strong font-medium">Primary</p>
                  <div>
                    <HiTab labels={['텍스트', '텍스트', '텍스트']} variant="pills" />
                  </div>
                </div>
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h4 className="mb-3 font-bold text-b3 text-text-neutral-strong uppercase tracking-wide">Sizes</h4>
              <div className="grid grid-cols-2 gap-2">
                {['md', 'lg', 'xl', 'xxl'].map((s) => (
                  <div key={s} className="p-4 bg-bg-fixed-white border border-border-neutral-subtle">
                    <p className="mb-3 text-d2 text-text-neutral-strong font-medium">{s}</p>
                    <div>
                      <HiTab labels={['텍스트', '텍스트', '텍스트']} variant="underline" size={s} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Badge */}
            <div>
              <h4 className="mb-3 font-semibold text-b3 text-text-neutral-strong uppercase tracking-wide">Badge (isNew)</h4>
              <div className="grid grid-cols-1 gap-2">
                <div className="p-4 bg-bg-fixed-white border border-border-neutral-subtle">
                  <p className="mb-3 text-d2 text-text-neutral-strong font-medium">Pills with badge</p>
                  <HiTab
                    labels={['텍스트', '텍스트', '텍스트']}
                    variant="pills"
                    isNew={[false, true, false]}
                  />
                </div>
              </div>
            </div>

            {/* With content */}
            <div>
              <h4 className="mb-3 font-bold text-b3 text-text-neutral-strong uppercase tracking-wide">With Content</h4>
              <div className="p-4 bg-bg-fixed-white border border-border-neutral-subtle">
                <div>
                  <HiTab
                    labels={['개요', '상세정보', '리뷰']}
                    variant="underline"
                    contentAnimation="fade"
                    contentAnimationDuration={0.2}
                  >
                    <div className="text-b3 text-text-neutral-strong py-2">개요 패널 내용이 여기에 표시됩니다.</div>
                    <div className="text-b3 text-text-neutral-strong py-2">상세정보 패널 내용이 여기에 표시됩니다.</div>
                    <div className="text-b3 text-text-neutral-strong py-2">리뷰 패널 내용이 여기에 표시됩니다.</div>
                  </HiTab>
                </div>
              </div>
            </div>

          </section>
        )}
      </div>
    </div>
  );
};
