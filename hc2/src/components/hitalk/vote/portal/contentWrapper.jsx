import Style from './contentWrapper.module.css';

const ContentItem = ({ children }) => 
  <div className={`${Style['item']} item`}>
    {children}
  </div>;

export const ContentWrapper = ({ children = [], className = '', style, header }) => {
  return (
    <div className={`${className} ${Style['content-wrapper']}`} style={style}>
      {header && <div className={`${Style['header']} header`}>{header}</div>}
      {(children.map ? children : [children]).map((child, index) => (
        <ContentItem key={index}>{child}</ContentItem>
      ))}
    </div>
  );
}