import Styles from './card.module.scss';
import PropTypes from 'prop-types';

// Card 컴포넌트
// size: xs | sm | md | lg | xl
// variant: border | lightgray | lightblue | lightred |

const Card = ({ size = 'md', variant = 'border', className = '', children = null, style = {} }) => {
  return (
    <div className={`${Styles['card']} ${Styles[`card-${size}`]} ${Styles[`card-${variant}`]} ${className}`} style={style}>
      {children}
    </div>
  );
};

Card.propTypes = {
  size: PropTypes.oneOf(['xl', 'lg', 'md', 'sm', 'xs']),
  variant: PropTypes.oneOf(['border', 'lightgray', 'lightblue', 'lightred']),
  className: PropTypes.string,
  children: PropTypes.node,
  style: PropTypes.object,
};

export { Card };
