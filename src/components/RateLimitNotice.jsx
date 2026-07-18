import React, { useEffect, useState } from "react";

export function secondsRemaining(until, now = Date.now()) {
  return Math.max(0, Math.ceil((until - now) / 1000));
}

export default function RateLimitNotice({ until }) {
  const [seconds, setSeconds] = useState(() =>
    until ? secondsRemaining(until) : 0,
  );

  useEffect(() => {
    if (!until) {
      setSeconds(0);
      return undefined;
    }

    const update = () => setSeconds(secondsRemaining(until));
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [until]);

  if (seconds === 0) return null;

  return (
    <p
      className="mt-6 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-center text-sm text-blue-900"
      role="status"
    >
      GitHub asked us to breathe for {seconds} second
      {seconds === 1 ? "" : "s"}.
    </p>
  );
}

if (import.meta.vitest) {
  const { expect, it } = import.meta.vitest;

  it("calculates a friendly whole-second countdown", () => {
    expect(secondsRemaining(50_000, 10_001)).toBe(40);
  });
}
