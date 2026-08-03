import { Navigate, Route, Routes } from "react-router-dom";
import { Backdrop } from "./components/Backdrop";
import { Shell } from "./components/Shell";
import { Onboarding } from "./pages/Onboarding";
import { Workspace } from "./pages/Workspace";
import { Profile } from "./pages/Profile";
import { Privacy } from "./pages/Privacy";
import { useStudent } from "./state/StudentContext";

export default function App() {
  const { student, loading } = useStudent();

  // The field is on before there is an account to store a preference on, and
  // takes the student's own setting the moment there is one.
  const backdrop = <Backdrop enabled={student?.backdropOn ?? true} />;

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <p className="eyebrow">Opening</p>
      </div>
    );
  }

  if (!student) {
    return (
      <>
        {backdrop}
        <div className="relative z-10">
          <Routes>
            <Route path="*" element={<Onboarding />} />
          </Routes>
        </div>
      </>
    );
  }

  return (
    <>
      {backdrop}
      <div className="relative z-10">
        <Routes>
          <Route element={<Shell />}>
            <Route path="/work" element={<Workspace />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="*" element={<Navigate to="/work" replace />} />
          </Route>
        </Routes>
      </div>
    </>
  );
}
