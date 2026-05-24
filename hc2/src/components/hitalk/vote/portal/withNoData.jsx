import { Icon } from '@/components/uiux/hitalk'
import { ContentWrapper } from './contentWrapper'

const styles = {
  container: {
    width: '100%',
    height: '100%',
    minHeight: '50vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  icon: {
    width: 64,
    height: 64,
    backgroundSize: '100%',
  },
  span: {
    marginTop: 15,
    color: 'var(--web-Text-Gray-08, #9E9E9E)',
    fontFeatureSettings: "'liga' off, 'clig' off",
    fontFamily: 'Pretendard Variable',
    fontSize: 15,
    fontStyle: 'normal',
    fontWeight: 400,
    lineHeight: '23px',
    letterSpacing: '-0.2px',
  },
}

const NoDataContent = ({ messageNoData }) => (
  <div style={styles.container}>
    <div style={styles.wrapper}>
      <Icon icon='nodata' style={styles.icon} />
      <span style={styles.span}>{messageNoData}</span>
    </div>
  </div>
)

export const WithNoData = ({ children, hasData, messageNoData = '데이터가 없습니다.', withContentWrapper=false }) => 
  <>
    {hasData ? children : (
      withContentWrapper ? (
        <ContentWrapper>
          <NoDataContent messageNoData={messageNoData} />
        </ContentWrapper>
      ) : (
        <NoDataContent messageNoData={messageNoData} />
      )
    )}
  </>