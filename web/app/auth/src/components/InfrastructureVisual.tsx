import { useEffect, useRef } from "react";

type NodeKind = "core" | "hub" | "server" | "edge" | "cloud";
interface N { x: number; y: number; z: number; kind: NodeKind; phase: number; label?: string }
interface E { a: number; b: number; phase: number; speed: number; strong?: boolean }
interface P { e: number; t: number; v: number; dir: 1 | -1 }

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function build() {
  const r = seeded(7);
  const nodes: N[] = [];
  const edges: E[] = [];
  const add = (n: Omit<N, "phase">) => (nodes.push({ ...n, phase: r() * Math.PI * 2 }), nodes.length - 1);
  const link = (a: number, b: number, strong = false) =>
    edges.push({ a, b, phase: r() * Math.PI * 2, speed: 0.15 + r() * 0.35, strong });

  const core = add({ x: 0, y: 0, z: 0, kind: "core", label: "CORE" });
  const hubLabels = ["NET", "SRV", "K3S", "SEC", "OBS", "APP"];
  const hubs: number[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    const h = add({ x: Math.cos(a) * 150, y: 0, z: Math.sin(a) * 150, kind: "hub", label: hubLabels[i] });
    hubs.push(h);
    link(core, h, true);
    // cluster of servers around hub
    const count = 4 + Math.floor(r() * 3);
    const servers: number[] = [];
    for (let j = 0; j < count; j++) {
      const b = a + (j - count / 2) * 0.16;
      const rad = 215 + (j % 2) * 30 + r() * 10;
      const s = add({ x: Math.cos(b) * rad, y: 0, z: Math.sin(b) * rad, kind: "server" });
      servers.push(s);
      link(h, s);
    }
    for (let j = 0; j < servers.length - 1; j++) if (r() > 0.5) link(servers[j], servers[j + 1]);
  }
  for (let i = 0; i < 6; i++) link(hubs[i], hubs[(i + 1) % 6]);

  // edge / remote locations
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2 + r() * 0.2;
    const rad = 330 + r() * 60;
    const e = add({ x: Math.cos(a) * rad, y: 0, z: Math.sin(a) * rad, kind: "edge" });
    const target = hubs[Math.floor(((a / (Math.PI * 2)) * 6 + 6) % 6)];
    link(e, target);
  }

  // cloud layer above
  const clouds: number[] = [];
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const c = add({ x: Math.cos(a) * 90, y: -170, z: Math.sin(a) * 90, kind: "cloud", label: i === 0 ? "CLOUD" : undefined });
    clouds.push(c);
    link(core, c, true);
  }
  for (let i = 0; i < 4; i++) link(clouds[i], clouds[(i + 1) % 4]);

  return { nodes, edges };
}

export default function InfrastructureVisual({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const { nodes, edges } = build();

    const packets: P[] = Array.from({ length: 22 }, (_, i) => ({
      e: Math.floor((i * 7.3) % edges.length),
      t: Math.random(),
      v: 0.004 + Math.random() * 0.005,
      dir: Math.random() > 0.5 ? 1 : -1,
    }));
    const dust = Array.from({ length: 40 }, () => ({
      x: (Math.random() - 0.5) * 900,
      y: -260 + Math.random() * 300,
      z: (Math.random() - 0.5) * 900,
      s: Math.random() * 0.6 + 0.2,
    }));

    let w = 0, h = 0, dpr = 1, scale = 1;
    let raf = 0, running = true, visible = true;
    let mx = 0, my = 0, tmx = 0, tmy = 0;
    const start = performance.now();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width; h = rect.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      scale = Math.min(w / 880, h / 620) * 1.05;
    };

    const project = (x: number, y: number, z: number, ang: number, tilt: number) => {
      const ca = Math.cos(ang), sa = Math.sin(ang);
      const x1 = x * ca - z * sa;
      const z1 = x * sa + z * ca;
      const ct = Math.cos(tilt), st = Math.sin(tilt);
      const y2 = y * ct - z1 * st;
      const z2 = y * st + z1 * ct;
      const fov = 900;
      const f = fov / (fov + z2 + 200);
      return { sx: w / 2 + x1 * f * scale, sy: h * 0.54 + y2 * f * scale, f, z: z2 };
    };

    const draw = (time: number) => {
      const t = time / 1000;
      mx += (tmx - mx) * 0.03; my += (tmy - my) * 0.03;
      const ang = t * 0.11 + mx * 0.15;
      const tilt = 1.02 + my * 0.06; // ~58deg looking down
      ctx.clearRect(0, 0, w, h);

      // ground rings
      ctx.lineWidth = 1;
      for (const R of [150, 240, 360, 460]) {
        ctx.beginPath();
        for (let i = 0; i <= 96; i++) {
          const a = (i / 96) * Math.PI * 2;
          const p = project(Math.cos(a) * R, 0, Math.sin(a) * R, ang, tilt);
          i ? ctx.lineTo(p.sx, p.sy) : ctx.moveTo(p.sx, p.sy);
        }
        ctx.strokeStyle = R === 360 ? "rgba(0,102,255,0.10)" : "rgba(139,150,165,0.07)";
        ctx.setLineDash(R === 460 ? [2, 6] : []);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      // radial ticks
      for (let i = 0; i < 72; i++) {
        const a = (i / 72) * Math.PI * 2;
        const len = i % 6 === 0 ? 18 : 7;
        const p1 = project(Math.cos(a) * 460, 0, Math.sin(a) * 460, ang, tilt);
        const p2 = project(Math.cos(a) * (460 + len), 0, Math.sin(a) * (460 + len), ang, tilt);
        ctx.beginPath(); ctx.moveTo(p1.sx, p1.sy); ctx.lineTo(p2.sx, p2.sy);
        ctx.strokeStyle = "rgba(139,150,165,0.18)"; ctx.stroke();
      }

      const P = nodes.map((n) => project(n.x, n.y, n.z, ang, tilt));

      // cloud vertical projection shadow
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].kind !== "cloud") continue;
        const g = project(nodes[i].x, 0, nodes[i].z, ang, tilt);
        ctx.beginPath(); ctx.moveTo(P[i].sx, P[i].sy); ctx.lineTo(g.sx, g.sy);
        ctx.strokeStyle = "rgba(139,150,165,0.08)"; ctx.setLineDash([2, 4]); ctx.stroke(); ctx.setLineDash([]);
      }

      // edges
      for (const e of edges) {
        const a = P[e.a], b = P[e.b];
        const glow = Math.max(0, Math.sin(t * e.speed + e.phase));
        const depth = Math.min(1, Math.max(0.25, (a.f + b.f) / 2 - 0.35));
        const base = e.strong ? 0.22 : 0.1;
        ctx.beginPath(); ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy);
        ctx.strokeStyle = `rgba(0,102,255,${(base + glow * glow * 0.45) * depth})`;
        ctx.lineWidth = e.strong ? 1.2 : 0.8;
        ctx.stroke();
      }

      // packets
      ctx.globalCompositeOperation = "lighter";
      for (const p of packets) {
        p.t += p.v;
        if (p.t > 1) {
          p.t = 0;
          p.e = Math.floor(Math.random() * edges.length);
          p.dir = Math.random() > 0.5 ? 1 : -1;
        }
        const e = edges[p.e];
        const [A, B] = p.dir === 1 ? [P[e.a], P[e.b]] : [P[e.b], P[e.a]];
        const x = A.sx + (B.sx - A.sx) * p.t;
        const y = A.sy + (B.sy - A.sy) * p.t;
        const tx = A.sx + (B.sx - A.sx) * Math.max(0, p.t - 0.12);
        const ty = A.sy + (B.sy - A.sy) * Math.max(0, p.t - 0.12);
        const alpha = Math.sin(p.t * Math.PI);
        const grad = ctx.createLinearGradient(tx, ty, x, y);
        grad.addColorStop(0, "rgba(0,168,255,0)");
        grad.addColorStop(1, `rgba(0,168,255,${0.9 * alpha})`);
        ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(x, y);
        ctx.strokeStyle = grad; ctx.lineWidth = 1.6; ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y, 1.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,235,255,${alpha})`; ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";

      // nodes (sorted by depth)
      const order = nodes.map((_, i) => i).sort((i, j) => P[j].z - P[i].z);
      for (const i of order) {
        const n = nodes[i], p = P[i];
        const pulse = 0.5 + 0.5 * Math.sin(t * 0.8 + n.phase);
        const s = p.f * scale;
        if (n.kind === "core") {
          const R = 26 * s;
          const g = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, R * 4);
          g.addColorStop(0, "rgba(0,102,255,0.35)"); g.addColorStop(1, "rgba(0,102,255,0)");
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.sx, p.sy, R * 4, 0, Math.PI * 2); ctx.fill();
          // hex
          ctx.beginPath();
          for (let k = 0; k < 6; k++) {
            const a = (k / 6) * Math.PI * 2 + Math.PI / 6;
            const q = project(n.x + Math.cos(a) * 26, 0, n.z + Math.sin(a) * 26, ang, tilt);
            k ? ctx.lineTo(q.sx, q.sy) : ctx.moveTo(q.sx, q.sy);
          }
          ctx.closePath();
          ctx.fillStyle = "rgba(0,59,115,0.55)"; ctx.fill();
          ctx.strokeStyle = "rgba(0,168,255,0.9)"; ctx.lineWidth = 1.2; ctx.stroke();
          ctx.beginPath(); ctx.arc(p.sx, p.sy, 3 * s + 1, 0, Math.PI * 2);
          ctx.fillStyle = "#F5F7FA"; ctx.fill();
          // expanding ring
          const rr = ((t * 0.35) % 1);
          ctx.beginPath();
          for (let k = 0; k <= 48; k++) {
            const a = (k / 48) * Math.PI * 2;
            const q = project(Math.cos(a) * (30 + rr * 110), 0, Math.sin(a) * (30 + rr * 110), ang, tilt);
            k ? ctx.lineTo(q.sx, q.sy) : ctx.moveTo(q.sx, q.sy);
          }
          ctx.strokeStyle = `rgba(0,168,255,${0.35 * (1 - rr)})`; ctx.lineWidth = 1; ctx.stroke();
        } else if (n.kind === "hub") {
          const R = 7 * s;
          ctx.beginPath(); ctx.arc(p.sx, p.sy, R * 2.2, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0,168,255,${0.15 + pulse * 0.25})`; ctx.lineWidth = 1; ctx.stroke();
          ctx.beginPath(); ctx.arc(p.sx, p.sy, R, 0, Math.PI * 2);
          ctx.fillStyle = "#003B73"; ctx.fill();
          ctx.strokeStyle = "rgba(0,168,255,0.9)"; ctx.stroke();
          ctx.beginPath(); ctx.arc(p.sx, p.sy, R * 0.35, 0, Math.PI * 2);
          ctx.fillStyle = "#F5F7FA"; ctx.fill();
        } else if (n.kind === "server") {
          // small rack: stacked rectangles
          const sw = 7 * s, sh = 2.2 * s;
          for (let k = 0; k < 3; k++) {
            const y = p.sy - k * (sh + 1.2 * s);
            ctx.fillStyle = "rgba(10,15,20,0.95)";
            ctx.fillRect(p.sx - sw / 2, y - sh / 2, sw, sh);
            ctx.strokeStyle = `rgba(139,150,165,${0.35 + 0.2 * p.f})`;
            ctx.lineWidth = 0.7;
            ctx.strokeRect(p.sx - sw / 2, y - sh / 2, sw, sh);
          }
          const led = Math.sin(t * 2 + n.phase * 3) > 0.2;
          ctx.fillStyle = led ? "rgba(0,168,255,0.95)" : "rgba(0,102,255,0.3)";
          ctx.fillRect(p.sx + sw / 2 - 2 * s, p.sy - 0.5 * s, 1.2 * s, 1 * s);
        } else if (n.kind === "edge") {
          ctx.beginPath(); ctx.arc(p.sx, p.sy, 1.8 * s + 0.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(139,150,165,${0.4 + pulse * 0.4})`; ctx.fill();
        } else if (n.kind === "cloud") {
          const R = 5 * s;
          ctx.beginPath();
          ctx.moveTo(p.sx, p.sy - R); ctx.lineTo(p.sx + R, p.sy); ctx.lineTo(p.sx, p.sy + R); ctx.lineTo(p.sx - R, p.sy); ctx.closePath();
          ctx.fillStyle = "rgba(0,102,255,0.25)"; ctx.fill();
          ctx.strokeStyle = "rgba(245,247,250,0.8)"; ctx.lineWidth = 1; ctx.stroke();
        }
        if (n.label && w > 520) {
          ctx.font = `500 ${Math.max(8, 9.5 * p.f)}px "JetBrains Mono", monospace`;
          ctx.fillStyle = n.kind === "core" ? "rgba(245,247,250,0.9)" : "rgba(139,150,165,0.85)";
          const off = n.kind === "core" ? 34 * s : 14 * s;
          ctx.fillText(n.label, p.sx + off, p.sy - off * 0.4);
        }
      }

      // dust
      for (const d of dust) {
        d.y -= d.s * 0.08;
        if (d.y < -300) d.y = 40;
        const p = project(d.x, d.y, d.z, ang, tilt);
        ctx.fillStyle = `rgba(139,170,210,${0.12 * p.f})`;
        ctx.fillRect(p.sx, p.sy, 1.2, 1.2);
      }
    };

    const loop = (now: number) => {
      if (running && visible) draw(now - start);
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      tmx = (e.clientX / window.innerWidth - 0.5) * 2;
      tmy = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const io = new IntersectionObserver(([en]) => (visible = en.isIntersecting));
    io.observe(canvas);
    const onVis = () => (running = !document.hidden);

    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}
