import { Outlet } from 'react-router-dom';
import { MainSidebar } from '@/components/text/components/main/MainSidebar';
import styles from './RootLayout.module.scss'
import { LoadingContextProvider } from '@/components/text/context/LoadingContext';

export const RootLayout = () => {
  return (
    <div className={`hc2-text-wrap ${styles.rootLayout}`}>
      <MainSidebar/>
      <LoadingContextProvider>
        <div className="text-con pl-15 pr-15 pt-10 pb-10 w-full flex-1 overflow-auto" id="text-scroll-wrap">
          <div className="min-w-290">
            <Outlet/>
          </div>
        </div>
      </LoadingContextProvider>
    </div>
  )
}