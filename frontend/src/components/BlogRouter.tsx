"use client";

import { useEffect, useState } from "react";
import BlogPost from "./BlogPost";
import BlogTerminalStatic from "./BlogTerminalStatic";

const MOBILE_BREAKPOINT = 768;

interface Props {
  slug: string;
  title: string;
  date?: string;
  body: string;          // raw markdown for <BlogPost>
  ansi: string;          // 140-col capture for desktop xterm
  ansiMobile: string;    // 48-col capture — kept for the desktop-viewport-sees-mobile case but unused when we use HTML on mobile
}

type Mode = "loading" | "mobile" | "desktop";

export default function BlogRouter({ slug, title, date, body, ansi, ansiMobile }: Props) {
  // Viewport only knowable after mount. Render a dark placeholder until then
  // so there's no FOUC / layout shift.
  const [mode, setMode] = useState<Mode>("loading");

  useEffect(() => {
    const check = () => setMode(window.innerWidth < MOBILE_BREAKPOINT ? "mobile" : "desktop");
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (mode === "loading") {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "#1d2021",
        }}
      />
    );
  }

  if (mode === "mobile") {
    return <BlogPost slug={slug} title={title} date={date} body={body} />;
  }

  return <BlogTerminalStatic slug={slug} ansi={ansi} ansiMobile={ansiMobile} />;
}
