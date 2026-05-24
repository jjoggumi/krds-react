export const InfiniteScroll = ({
  className = '',
  onLoadMore,
  children,
  bottomThreshold = 10
}) => {

  const handleScroll = async (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight + bottomThreshold >= scrollHeight) {
      await onLoadMore();
    }
  }

  return <div
    onScroll={handleScroll}
    className={className}
    style={{ overflowY: 'auto' }}
  >
    {children}
  </div>
}