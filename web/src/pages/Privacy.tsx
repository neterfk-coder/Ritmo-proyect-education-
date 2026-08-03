import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStudent } from "../state/StudentContext";

/**
 * A page that exists because of what this product could have been.
 *
 * The obvious version of Ritmo ships a teacher dashboard, a parent digest and
 * an engagement score. Every one of those was possible with the data model we
 * already have. We did not build them, and this page is where we say so in
 * plain terms rather than in a policy nobody reads.
 */
export function Privacy() {
  const { student, erase, signOut } = useStudent();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!student) return null;

  return (
    <div className="mx-auto max-w-reading px-6 py-16 space-y-14">
      <header className="space-y-4">
        <p className="eyebrow">My data</p>
        <h1 className="font-display text-[2.5rem] leading-[1.1] tracking-tight">
          What this knows, and what it can never do.
        </h1>
      </header>

      <section className="space-y-5">
        <h2 className="eyebrow">What is not collected</h2>
        <ul className="space-y-3.5">
          {[
            "No camera. Focus is inferred from how you use the page, never from your face.",
            "No microphone unless you press the dictation button, and the audio never leaves the device.",
            "No keystroke log. Friction is five numbers between 0 and 1, computed in your browser and thrown away after scoring.",
            "No teacher dashboard, no parent digest, no engagement score. There is no table in the database for a person who is not you.",
          ].map((line) => (
            <li key={line} className="flex gap-3.5 reading text-[0.9375rem]">
              <span aria-hidden className="text-faint font-mono text-xs pt-1.5">—</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-5">
        <h2 className="eyebrow">What is stored</h2>
        <p className="reading text-[0.9375rem] text-muted">
          Your rules, your tasks, the steps you finished, and one row per friction moment holding a
          score and a signal name. It sits in a SQLite file on the machine running this app. If you
          are running Ritmo locally, that machine is yours.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="eyebrow">Your account id</h2>
        <div className="flex flex-wrap gap-2 items-center">
          <code className="font-mono text-xs bg-raised border border-line rounded-card px-3 py-2 break-all">
            {student.id}
          </code>
          <button
            className="btn-quiet !py-1.5 !text-xs"
            onClick={() => {
              navigator.clipboard.writeText(student.id);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 2000);
            }}
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <p className="text-xs text-faint reading">
          Keep this to open the same account on another browser. There is no password because there
          is no server holding accounts.
        </p>
      </section>

      <section className="space-y-5 border-t border-line pt-10">
        <h2 className="eyebrow">Erase everything</h2>
        <p className="reading text-[0.9375rem] text-muted">
          Deletes your rules, tasks, sessions, friction rows and observations. It is immediate and
          there is no archived copy.
        </p>
        {confirming ? (
          <div className="flex flex-wrap gap-3">
            <button
              className="btn-primary !bg-ink !border-ink"
              onClick={async () => {
                await erase();
                navigate("/");
              }}
            >
              Yes, erase all of it
            </button>
            <button className="btn-quiet" onClick={() => setConfirming(false)}>
              Keep it
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            <button className="btn-quiet" onClick={() => setConfirming(true)}>
              Erase everything
            </button>
            <button className="btn-bare" onClick={() => { signOut(); navigate("/"); }}>
              Just sign out on this browser
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
