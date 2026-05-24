import { Link, Outlet } from "react-router-dom";
import styles from './layout.module.scss';
export const Layout = () => {
  return (
      <main className={`hc2-time-table-wrap`}>
        <Outlet />
      </main>
  );
}
