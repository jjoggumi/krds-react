import Styles from './titearea.module.scss';
import React from 'react';

/**
 * @typedef {1|2|3|4|5} TitleLevel
 * @typedef {Object} TitleAreaProps
 * @property {TitleLevel} [level=3]
 * @property {TitleLevel} [summaryLevel] - summary에 별도 레벨 지정(선택)
 * @property {React.ReactNode} [title]
 * @property {React.ReactNode} [summary]
 * @property {React.ReactNode} [etc]
 * @property {'row'|'col'} [variant='row']
 * @property {string} [className]
 * @property {React.CSSProperties} [style]
 * @property {React.ReactNode} [children]
 */

/**
 * Reusable Title component supporting h3/h4/h5 with optional summary.
 * Props:
 * - level: 1 | 2 | 3 | 4 | 5 (default: 3)
 * - title: ReactNode (optional, can also use children)
 * - summary: ReactNode (optional, renders under the title)
 * - className: string (optional)
 * - style: React.CSSProperties (optional)
 *
 * Examples:
 * - Props usage:
 *   <TitleArea level={4} summaryLevel={5} title={<><strong>메인</strong> <span>서브</span></>} summary="설명 텍스트" />
 * - Slot usage (legacy):
 *   <TitleArea level={2}>
 *     <TitleArea.Title><strong>메인</strong> <span>서브</span></TitleArea.Title>
 *     <TitleArea.Summary>설명 텍스트</TitleArea.Summary>
 *     <TitleArea.Etc>우측 추가 컨텐츠</TitleArea.Etc>
 *   </TitleArea>
 */
/** @param {{children?: React.ReactNode}} props */
const SlotTitle = ({ children }) => <>{children}</>;
/** @param {{children?: React.ReactNode}} props */
const SlotSummary = ({ children }) => <>{children}</>;
/** @param {{children?: React.ReactNode}} props */
const SlotEtc = ({ children }) => <>{children}</>;

/**
 * @param {TitleAreaProps} props
 * @returns {JSX.Element}
 */
const TitleArea = ({
  level = 3,
  summaryLevel = undefined,
  title = undefined,
  summary = undefined,
  etc = undefined,
  variant = 'row',
  className = '',
  style = undefined,
  children = undefined,
}) => {
  const lv = [1, 2, 3, 4, 5].includes(level) ? level : 3;
  const Tag = `h${lv}`;
  const summaryLv = [1, 2, 3, 4, 5].includes(summaryLevel) ? summaryLevel : Math.min(lv + 1, 5);
  const SummaryTag = `h${summaryLv}`;
  const wrapClass = [Styles[`h${lv}-tit`] , Styles['title']].join(' ');
  const summaryClass = [Styles[`h${summaryLv}-smr`], Styles['smr']].join(' ');
  const dirClass = variant === 'col' ? Styles['col'] : Styles['row'];

  const childArray = React.Children.toArray(children);
  const titleChild = childArray.find((el) => React.isValidElement(el) && el.type === SlotTitle);
  const summaryChild = childArray.find((el) => React.isValidElement(el) && el.type === SlotSummary);
  const etcChild = childArray.find((el) => React.isValidElement(el) && el.type === SlotEtc);

  // props 우선, 없으면 슬롯으로 폴백
  const titleContent = title ?? (titleChild ? titleChild.props.children : children);
  const summaryContent = summary ?? (summaryChild ? summaryChild.props.children : null);
  const etcContent = etc ?? (etcChild ? etcChild.props.children : null);

  return (
    <div className={`${className} ${Styles[`h${lv}-tit-wrap`]} ${Styles['title-area']} ${dirClass}`} style={style}>
      <Tag className={wrapClass}>{titleContent}</Tag>
      {summaryContent ? <SummaryTag className={summaryClass}>{summaryContent}</SummaryTag> : null}
      {etcContent ? <div className={`${Styles['etc'] || ''} etc`}>{etcContent}</div> : null}
    </div>
  );
};

TitleArea.Title = SlotTitle;
TitleArea.Summary = SlotSummary;
TitleArea.Etc = SlotEtc;

export { TitleArea };
export default TitleArea;
