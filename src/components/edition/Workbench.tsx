import { useState, type PointerEvent } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowUpRight, Check, Code2, Heart, MousePointer2 } from "lucide-react";

export function Flower({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <g fill="currentColor">
        {Array.from({ length: 8 }, (_, i) => <ellipse key={i} cx="60" cy="29" rx="15" ry="27" transform={`rotate(${i * 45} 60 60)`} />)}
      </g>
      <circle cx="60" cy="60" r="25" fill="#f9e7a5" stroke="#253c31" strokeWidth="2" />
      <path d="M49 55v5m21-5v5m-20 9q10 10 20-1" stroke="#253c31" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function Workbench({ paused }: { paused: boolean }) {
  const [loved, setLoved] = useState(false);
  const [palette, setPalette] = useState(0);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const offsetX = useSpring(x, { stiffness: 120, damping: 20 });
  const offsetY = useSpring(y, { stiffness: 120, damping: 20 });

  function move(event: PointerEvent<HTMLDivElement>) {
    if (paused || event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(((event.clientX - rect.left) / rect.width - 0.5) * 18);
    y.set(((event.clientY - rect.top) / rect.height - 0.5) * 18);
  }

  return (
    <div className={`workbench palette-${palette}`} onPointerMove={move} onPointerLeave={() => { x.set(0); y.set(0); }}>
      <div className="workbench-grid" />
      <span className="desk-index">FIG. 01 — AN IDEA TAKING SHAPE</span>
      <motion.div className="desk-circle" style={{ x: paused ? 0 : offsetX, y: paused ? 0 : offsetY }} />
      <div className="desk-composition">
        <motion.div className="code-note" aria-hidden="true" style={{ x: paused ? 0 : offsetX, y: paused ? 0 : offsetY, rotate: -17 }}><Code2 size={22} /><span>a little logic</span><i /><i /><i /></motion.div>
        <div className="little-browser">
          <div className="little-browser-bar"><span /><span /><span /><p>something-good.tsx</p><ArrowUpRight size={14} /></div>
          <div className="little-browser-content">
            <span className="browser-eyebrow">AN EXPERIMENT IN FEELING</span>
            <p>hello,<br /><em>world.</em><span className="blinking-cursor">_</span></p>
            <div className="browser-bottom"><span><i /> made with a human touch</span><button aria-label={loved ? "Reset the little heart" : "Give the idea some love"} aria-pressed={loved} onClick={() => setLoved(!loved)} className={loved ? "heart-button is-loved" : "heart-button"}><Heart size={20} fill={loved ? "currentColor" : "none"} /></button></div>
          </div>
        </div>
        <div className="plant" aria-hidden="true">
          <svg viewBox="0 0 150 215" fill="none"><path d="M76 166C71 120 93 64 94 33" stroke="#355a40" strokeWidth="5" /><path d="M79 119C27 120 15 77 23 66C63 69 77 90 79 119Z" fill="#426b48" stroke="#294c35" strokeWidth="2" /><path d="M82 92C129 92 142 53 133 43C98 48 83 67 82 92Z" fill="#6d8b53" stroke="#294c35" strokeWidth="2" /><path d="M86 67C51 60 45 29 55 16C83 21 89 46 86 67Z" fill="#839d68" stroke="#294c35" strokeWidth="2" /><path d="M30 150H119L109 205Q77 221 42 205Z" fill="#d67653" stroke="#854830" strokeWidth="2" /><ellipse cx="74" cy="151" rx="44" ry="10" fill="#e69c70" stroke="#854830" strokeWidth="2" /><ellipse cx="74" cy="151" rx="33" ry="5" fill="#554b32" /><path d="M52 168L57 204M74 171V209M96 168L91 205" stroke="#ae5d42" strokeWidth="2" /></svg>
        </div>
        <div className="desk-flower"><Flower /></div>
        <div className={`idea-sticker ${loved ? "sticker-loved" : ""}`} aria-live="polite"><span>{loved ? "a little love" : "a little soul."}</span><span>{loved ? "goes a long way." : "in every detail."}</span><svg viewBox="0 0 88 25" fill="none" aria-hidden="true"><path d="M3 15Q43 1 83 9M4 22Q46 10 75 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg></div>
        <span className="floating-pointer" aria-hidden="true"><MousePointer2 fill="#253c31" size={29} /><span>you, exploring</span></span>
        <div className="desk-foot" aria-hidden="true" />
      </div>
      <div className="desk-controls"><span>Pick a little mood</span><div role="group" aria-label="Workspace palette">{["Sunshine", "Rose", "Blue"].map((name, index) => <button key={name} className={`palette-swatch swatch-${index}`} aria-label={`${name} workspace`} aria-pressed={palette === index} onClick={() => setPalette(index)}>{palette === index && <Check size={13} />}</button>)}</div></div>
    </div>
  );
}
