import { useState } from "react";
import { Link } from "react-router-dom";
import { useStudent } from "../state/StudentContext";
import { clearGuestFlag, isGuest } from "../lib/guest";

/**
 * The one thing a guest is missing, offered once.
 *
 * A guest account is complete except for a way back into it from another
 * browser, and the fix is copying one id. So the strip does the copying rather
 * than pointing at a page that explains copying — and once it has been used or
 * dismissed it does not come back, because a banner that reappears is a banner
 * that gets ignored.
 */
export function GuestStrip() {
  const { student } = useStudent();
  const [showing, setShowing] = useState(() => isGuest());
  const [copied, setCopied] = useState(false);

  if (!student || !showing) return null;

  const keep = async () => {
    try {
      await navigator.clipboard.writeText(student.id);
      setCopied(true);
      clearGuestFlag();
      window.setTimeout(() => setShowing(false), 2600);
    } catch {
      // Clipboard blocked. The id is on the privacy page either way, so send
      // them there rather than leaving the button doing nothing.
      setCopied(false);
      setShowing(false);
    }
  };

  return (
    <div className="border-b border-line bg-raised/40">
      <div className="mx-auto max-w-page px-6 py-2.5 flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="text-sm text-muted reading">
          {copied ? (
            <>Copied. Paste that anywhere you can find it again — it is the only way back to this work.</>
          ) : (
            <>You went straight in, so this account only exists in this browser.</>
          )}
        </p>

        {!copied && (
          <div className="flex items-center gap-4 ml-auto">
            <button className="btn-bare !text-sm" onClick={keep}>
              Copy my account id
            </button>
            <Link to="/privacy" className="btn-bare !text-sm text-faint">
              What this stores
            </Link>
            <button
              className="btn-bare !text-xs text-faint"
              onClick={() => {
                clearGuestFlag();
                setShowing(false);
              }}
              aria-label="Dismiss"
            >
              dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
