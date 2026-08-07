import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Backdrop } from "./components/Backdrop";
import { Owl } from "./components/Owl";
import { Shell } from "./components/Shell";
import { Auth } from "./pages/Auth";
import { Landing } from "./pages/Landing";
import { Onboarding } from "./pages/Onboarding";
import { Workspace } from "./pages/Workspace";
import { Profile } from "./pages/Profile";
import { Privacy } from "./pages/Privacy";
import { useStudent } from "./state/StudentContext";
import { useT } from "./lib/i18n";

export default function App() {
  const { student, loading } = useStudent();
  const t = useT();
  const { pathname } = useLocation();

  /*
    The field is on before there is an account to store a preference on, and
    takes the student's own setting the moment there is one.

    The front door gets it at full exposure. There is no lit step to protect
    out there, and the restraint that is correct behind a task had made the
    animation effectively invisible on the one page whose job is to be looked
    at — it was running the whole time at four percent opacity.
  */
  const backdrop = (
    <Backdrop
      enabled={student?.backdropOn ?? true}
      intensity={pathname === "/" ? "full" : "calm"}
    />
  );

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center px-6">
        <div className="flex items-center gap-3 rise">
          <Owl size={36} />
          <div>
            <p className="font-display text-2xl leading-none tracking-tight">Ritmo</p>
            <p className="flex items-center gap-1.5 pt-2" aria-label={t("app.opening")}>
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
            The landing page is the front door; the account screens are one
            click through it, and /setup is the door beside them. Until the
            account layer is connected to a server, the local flow has to stay
            reachable — a login box that cannot log anybody in must not be the
            only way in, and must not be the first thing anyone meets either.
          */}
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/signin" element={<Auth mode="signin" />} />
            <Route path="/register" element={<Auth mode="register" />} />
            <Route path="/forgot" element={<Auth mode="forgot" />} />
            <Route path="/reset" element={<Auth mode="reset" />} />
            <Route path="/setup" element={<Onboarding />} />
            <Route path="*" element={<Navigate to="/" replace />} />
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
