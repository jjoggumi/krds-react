import { MemoryRouter,  Routes, Route } from "react-router-dom";
import { useHtmlClassList } from "../../../../utils/useHtmlClassList";
import { Layout } from "./layout";
import TimetableDailyLessonList from "./lessonList";

export const TimetableDailyHome = (props) => {
  const { school } = props;
  const currentSchool = school ? JSON.parse(school) : null;
  
  useHtmlClassList(["hc2", "timetable-root"]);
  return (
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<TimetableDailyLessonList school={currentSchool} />} />
          {/* <Route path="dashboard" element={<Dashboard />} /> */}
        </Route>
      </Routes>
    </MemoryRouter>
  );
}
