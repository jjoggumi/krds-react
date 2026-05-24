import React, { HTMLAttributes, SVGProps } from 'react';

// -----------------------------
// Build-time asset collection
// -----------------------------
const _rawIcons = import.meta.glob('./icons/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const _pngIcons = import.meta.glob('./icons/*.png', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

const _pngById: Record<string, string> = Object.fromEntries(
  Object.entries(_pngIcons).map(([path, url]) => [
    path.replace(/^.*\//, '').replace(/\.png$/, ''),
    url,
  ])
);

// -----------------------------
// Helpers
// -----------------------------
const toVar = (token?: string) => {
  if (!token) return undefined;
  const v = token.trim();

  // 1. 이미 var()나 hex, rgb 형식이면 그대로 반환
  if (/^(var\(|--|#|rgba?\(|hsla?\()/i.test(v)) return v;

  /**
   * 2. 우선순위 기반 변수 조립
   * - var(--color-${v}): Tailwind @theme에 등록된 별칭 (예: text-primary-base)
   * - var(--${v}): :root에 직접 선언된 원시 변수 (예: slate-500)
   * - ${v}: 변수가 없을 경우 대비한 폴백 값
   */
  return `var(--color-${v}, var(--${v}, ${v}))`;
};
const PREFIXES = ['ico-', 'ic-', 'ico_', 'ic_', 'icon-', 'icon_'];

function normalizeId(name: string, idSet: Set<string> | Record<string, any>): string | undefined {
  const cases = [name, name.replace(/-/g, '_'), name.replace(/_/g, '-')];
  for (const c of cases) {
    if (idSet instanceof Set ? idSet.has(c) : idSet[c]) return c;
    for (const p of PREFIXES) {
      const combined = p + c;
      if (idSet instanceof Set ? idSet.has(combined) : idSet[combined]) return combined;
    }
  }
  return undefined;
}

// -----------------------------
// Runtime sprite state
// -----------------------------
let _spriteInjected = false;
const _symbolIds = new Set<string>();
const _preserveRawIds = new Set<string>();
const _rawById: Record<string, string> = {};

function injectSprite() {
  if (_spriteInjected || typeof document === 'undefined') return;
  _spriteInjected = true;

  const symbols: string[] = [];

  Object.entries(_rawIcons).forEach(([path, raw]) => {
    const id = path.replace(/^.*\//, '').replace(/\.svg$/, '');
    _rawById[id] = raw;

    const hasExplicitColor = /fill=["']\s*#|fill=["']\s*rgb\(|<linearGradient|<radialGradient|stop-color/i.test(raw);
    if (hasExplicitColor) {
      _preserveRawIds.add(id);
      return;
    }

    const viewBox = (raw.match(/viewBox=['"]([^'"]+)['"]/) ?? [])[1] ?? '0 0 24 24';
    const rootFill = (raw.match(/<svg[^>]*\sfill=["']([^"']*)["']/) ?? [])[1];

    let inner = raw
      .replace(/<\?xml[\s\S]*?\?>/, '')
      .replace(/<!DOCTYPE[\s\S]*?>/, '')
      .replace(/<svg[^>]*>/, '')
      .replace(/<\/svg>\s*$/, '');

    if (rootFill !== undefined) {
      inner = `<g fill="${rootFill}">${inner}</g>`;
    }

    // CSS 변수(--icon-color)를 통해 색상을 제어하도록 치환
    inner = inner
      .replace(/fill="(?!none)[^"]*"/g, 'fill="var(--icon-color, currentColor)"')
      .replace(/stroke="(?!none)[^"]*"/g, 'stroke="var(--icon-color, currentColor)"');

    _symbolIds.add(id);
    symbols.push(`<symbol id="${id}" viewBox="${viewBox}">${inner}</symbol>`);
  });

  const el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  el.id = '__hi-sprite__';
  el.setAttribute('aria-hidden', 'true');
  el.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none;';
  el.innerHTML = symbols.join('');
  document.body.insertBefore(el, document.body.firstChild);
}

export const iconNames: string[] = [
  ...Object.keys(_rawIcons).map((p) => p.replace(/^.*\//, '').replace(/\.svg$/, '')),
  ...Object.keys(_pngIcons).map((p) => p.replace(/^.*\//, '').replace(/\.png$/, '')),
].sort();

// ─── HiIcon 컴포넌트 ───────────────────────────────────────────────────────────
interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'color'> {
  icon: string;
  size?: number;
  color?: string;
  hoverColor?: string;
}

const HiIcon = ({
  icon,
  size = 24,
  color,
  hoverColor,
  className,
  style,
  ...props
}: IconProps) => {
  injectSprite();

  // CSS 변수 기반 스타일 설정
  const sharedStyle: React.CSSProperties = {
    ...(color ? { ['--icon-color' as any]: toVar(color) } : {}),
    ...(hoverColor ? { ['--hover-color' as any]: toVar(hoverColor) } : {}),
    display: 'inline-block',
    verticalAlign: 'middle',
    flexShrink: 0,
    transition: 'color 0.2s, fill 0.2s, stroke 0.2s',
    ...style,
  };

  // 1. PNG 아이콘
  const pngId = normalizeId(icon, _pngById);
  if (pngId) {
    return (
      <img
        src={_pngById[pngId]}
        width={size}
        height={size}
        aria-hidden="true"
        className={className}
        style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
        {...(props as any)}
      />
    );
  }

  // 2. 다색 SVG (원본 보존)
  const rawId = normalizeId(icon, _rawById);
  if (rawId && _preserveRawIds.has(rawId)) {
    const svgHtml = (_rawById[rawId] ?? '').replace(/<svg([^>]*)>/, (_m, g1) => {
      const attrs = g1.replace(/\s(?:width|height)=["'][^"']*["']/g, '');
      const cls = className ? ` class="${className}"` : '';
      return `<svg${attrs} width="${size}" height="${size}" aria-hidden="true"${cls}>`;
    });
    return (
      <span
        aria-hidden="true"
        style={sharedStyle}
        dangerouslySetInnerHTML={{ __html: svgHtml }}
        {...(props as any)}
      />
    );
  }

  // 3. 단색 아이콘 (스프라이트)
  return (
    <svg
      width={size}
      height={size}
      fill="currentColor"
      // !를 붙여서 style에 박힌 --icon-color를 강제로 덮어씌웁니다.
      className={`
        ${hoverColor ? 'hover:![--icon-color:var(--hover-color)] group-hover:![--icon-color:var(--hover-color)]' : ''} 
        ${className ?? ''}
      `.trim()}
      aria-hidden="true"
      style={sharedStyle}
      {...(props as any)}
    >
      <use href={`#${normalizeId(icon, _symbolIds) || icon}`} />
    </svg>
  );
};

export { HiIcon };
export default HiIcon;