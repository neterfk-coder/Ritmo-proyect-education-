import { Navigate, Route, Routes } from "react-router-dom";
import { Backdrop } from "./components/Backdrop";
import { Owl } from "./components/Owl";
import { Shell } from "./components/Shell";
import { Auth } from "./pages/Auth";
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
      <div className="min-h-screen grid place-items-center px-6">
        <div className="flex items-center gap-3 rise">
          <Owl size={36} />
          <div>
            <p className="font-display text-2xl leading-none tracking-tight">Ritmo</p>
            <p className="flex items-center gap-1.5 pt-2" aria-label="Opening">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="think-dot block h-1 w-1 rounded-full bg-faint"
                  style={{ animationDelay: `${i * 0.16}s` }}
                />
              ))}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <>
        {backdrop}
        <div className="relative z-10">
          {/*
            The account screens are the front door, and /setup is the door
            beside it. Until the account layer is connected to a server, the
            local flow has to stay reachable — a login box that cannot log
            anybody in must not be the only way in.
          */}
          <Routes>
            <Route path="/signin" element={<Auth mode="signin" />} />
            <Route path="/register" element={<Auth mode="register" />} />
            <Route path="/forgot" element={<Auth mode="forgot" />} />
            <Route path="/reset" element={<Auth mode="reset" />} />
            <Route path="/setup" element={<Onboarding />} />
            <Route path="*" element={<Navigate to="/signin" replace />} />
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
