"use client";

import { FormEvent, PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, HelpCircle, QrCode, RefreshCw, X } from "lucide-react";
import { loginAdmin } from "@/lib/admin-auth";

/* 静态二维码图案（确定性生成，避免 hydration 不一致） */
function qrCells(): Array<[number, number]> {
  const cells: Array<[number, number]> = [];
  for (let y = 0; y < 21; y += 1) {
    for (let x = 0; x < 21; x += 1) {
      const inFinder =
        (x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12);
      if (inFinder) continue;
      const n = (x * 37 + y * 91 + ((x * y) % 7) * 13) % 5;
      if (n === 1 || n === 3) cells.push([x, y]);
    }
  }
  return cells;
}

const QR_CELLS = qrCells();
const FINDERS: Array<[number, number]> = [
  [0, 0],
  [14, 0],
  [0, 14],
];

/* 点击扫码后展示的清晰二维码（更密的确定性图案，避免 hydration 不一致） */
const DENSE_SIZE = 29;
function denseQrCells(): Array<[number, number]> {
  const cells: Array<[number, number]> = [];
  for (let y = 0; y < DENSE_SIZE; y += 1) {
    for (let x = 0; x < DENSE_SIZE; x += 1) {
      const inFinder =
        (x < 8 && y < 8) ||
        (x >= DENSE_SIZE - 8 && y < 8) ||
        (x < 8 && y >= DENSE_SIZE - 8);
      if (inFinder) continue;
      const n = (x * 73 + y * 149 + ((x * y) % 11) * 41 + ((x + y) % 5) * 17) % 7;
      if (n % 3 !== 0) cells.push([x, y]);
    }
  }
  return cells;
}
const DENSE_CELLS = denseQrCells();
const DENSE_FINDERS: Array<[number, number]> = [
  [0, 0],
  [DENSE_SIZE - 7, 0],
  [0, DENSE_SIZE - 7],
];

/* ---------------- 滑块拼图验证 ---------------- */

const STAGE_W = 312;
const STAGE_H = 186;
const PIECE_H = 42;
const HOLE_TOP = 54;
const HANDLE_W = 80;
const TRACK_PAD = 2;
const MAX_POS = STAGE_W - HANDLE_W - TRACK_PAD * 2;

/* 拼图场景（日出水岸 + 斜拉桥），用 SVG 内联避免外链资源 */
const SCENE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 312 186">
<defs>
<linearGradient id="capSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7d94a8"/><stop offset=".42" stop-color="#c9d5dc"/><stop offset=".62" stop-color="#efe9dc"/></linearGradient>
<linearGradient id="capWater" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3d5560"/><stop offset=".35" stop-color="#2a3d46"/><stop offset="1" stop-color="#14232b"/></linearGradient>
<radialGradient id="capSun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fffdf2" stop-opacity=".95"/><stop offset=".45" stop-color="#fff6de" stop-opacity=".5"/><stop offset="1" stop-color="#fff6de" stop-opacity="0"/></radialGradient>
</defs>
<rect width="312" height="116" fill="url(#capSky)"/>
<circle cx="152" cy="86" r="74" fill="url(#capSun)"/>
<path d="M0 112 L0 96 L34 88 L70 98 L104 84 L142 96 L176 86 L214 98 L252 88 L312 100 L312 116Z" fill="#6d8290" opacity=".85"/>
<rect y="116" width="312" height="70" fill="url(#capWater)"/>
<ellipse cx="152" cy="123" rx="54" ry="7" fill="#f6e6c8" opacity=".32"/>
<rect y="112" width="312" height="5" fill="#22323b"/>
<g stroke="#1b2a32" stroke-width="1.2" opacity=".9" fill="none"><path d="M99.5 30 L40 112"/><path d="M99.5 30 L62 112"/><path d="M99.5 30 L122 112"/><path d="M99.5 30 L160 112"/><path d="M152.8 46 L126 112"/><path d="M152.8 46 L196 112"/><path d="M152.8 46 L236 112"/></g>
<path d="M96 24 L103 24 L101 116 L98 116Z" fill="#1b2a32"/>
<path d="M150 40 L156 40 L154.5 116 L151.5 116Z" fill="#1b2a32"/>
<g fill="#16242c"><rect x="30" y="117" width="7" height="55"/><rect x="128" y="117" width="7" height="55"/><rect x="198" y="117" width="7" height="55"/><rect x="266" y="117" width="7" height="55"/></g>
<g stroke="#8fa7b0" stroke-width="1" opacity=".22"><path d="M0 142 H312"/><path d="M0 160 H312"/><path d="M0 178 H312"/></g>
</svg>`;

const SCENE_URL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(SCENE_SVG)}`;
const PIECE_CLIP = "path('M0 0 H42 V14 a7 7 0 0 1 0 14 V42 H0 Z')";

type SliderState = "idle" | "run" | "fail" | "ok";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"account" | "phone">("account");
  const [qrReady, setQrReady] = useState(false);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [countdown, setCountdown] = useState(0);

  const [captchaOpen, setCaptchaOpen] = useState(false);
  const [holeX, setHoleX] = useState(180);
  const [piecePos, setPiecePos] = useState(0);
  const [sliderState, setSliderState] = useState<SliderState>("idle");
  const dragging = useRef(false);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = window.setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [countdown]);

  function sendCode() {
    if (countdown > 0) return;
    if (!/^1\d{10}$/.test(phone.trim())) {
      setError("请输入正确的手机号");
      return;
    }
    setError("");
    setCountdown(60);
  }

  async function doLogin() {
    setLoading(true);
    try {
      await loginAdmin(username.trim(), password);
      router.replace("/home");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "登录失败，请检查账号和密码");
      setCaptchaOpen(false);
    } finally {
      setLoading(false);
    }
  }

  function openCaptcha() {
    setError("");
    setPiecePos(0);
    setHoleX(70 + Math.round(Math.random() * 150));
    setSliderState("idle");
    setCaptchaOpen(true);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (tab === "phone") {
      submitPhone();
      return;
    }
    openCaptcha();
  }

  function submitPhone() {
    if (!/^1\d{10}$/.test(phone.trim())) {
      setError("请输入正确的手机号");
      return;
    }
    if (!code.trim()) {
      setError("请输入验证码");
      return;
    }
    setError("手机登录暂未开放，请使用账号登录");
  }

  function resetPuzzle() {
    setPiecePos(0);
    setHoleX(70 + Math.round(Math.random() * 150));
    setSliderState("idle");
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (sliderState === "ok") return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragging.current = true;
    setSliderState("run");
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragging.current) return;
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const next = clamp(
      event.clientX - rect.left - TRACK_PAD - HANDLE_W / 2,
      0,
      MAX_POS,
    );
    setPiecePos(next);
  }

  function onPointerUp() {
    if (!dragging.current) return;
    dragging.current = false;
    if (Math.abs(piecePos - holeX) <= 6) {
      setPiecePos(holeX);
      setSliderState("ok");
      window.setTimeout(() => {
        setCaptchaOpen(false);
        void doLogin();
      }, 520);
      return;
    }
    setSliderState("fail");
    window.setTimeout(() => {
      setPiecePos(0);
      setSliderState("idle");
    }, 420);
  }

  const settled = sliderState === "ok" || sliderState === "fail";
  const pieceStyle = {
    left: piecePos,
    top: HOLE_TOP,
    backgroundImage: `url("${SCENE_URL}")`,
    backgroundPosition: `-${piecePos}px -${HOLE_TOP}px`,
  };

  return (
    <main className="lg-shell">
      <span className="lg-blob lg-blob-a" />
      <span className="lg-blob lg-blob-b" />
      <span className="lg-arc lg-arc-a" />
      <span className="lg-arc lg-arc-b" />
      <span className="lg-arc lg-arc-c" />

      <section className="lg-art">
        <div className="lg-stage">
          <span className="lg-bubble lg-bubble-member">会员<br />管理</span>
          <span className="lg-bubble lg-bubble-sea">公海<br />客源</span>
          <span className="lg-bubble lg-bubble-store">门店<br />管理</span>
          <span className="lg-bubble lg-bubble-service">服务<br />跟进</span>
          <span className="lg-bubble lg-bubble-match">牵线<br />匹配</span>
          <span className="lg-bubble lg-bubble-activity">活动<br />报名</span>
          <span className="lg-bubble lg-bubble-office">红娘<br />办公</span>

          <span className="lg-person lg-person-m">
            <i className="lg-head" />
            <i className="lg-torso" />
          </span>
          <span className="lg-person lg-person-f">
            <i className="lg-head" />
            <i className="lg-torso" />
          </span>

          <span className="lg-heart lg-heart-a">♥</span>
          <span className="lg-heart lg-heart-b">♥</span>
        </div>
        <p className="lg-slogan">成就天下美好姻缘</p>
      </section>

      <form onSubmit={submit} className="lg-panel">
        <h1 className="lg-title">婚恋运营管理系统</h1>
        <p className="lg-subtitle">为婚恋行业发展提供科技赋能</p>

        <div className="lg-main">
          <div className="lg-qr">
            <p className="lg-qr-label">扫码登录</p>
            <button
              type="button"
              className="lg-qr-box"
              aria-label={qrReady ? "二维码" : "点击扫码"}
              onClick={() => setQrReady(true)}
            >
              {qrReady ? (
                <svg viewBox={`0 0 ${DENSE_SIZE} ${DENSE_SIZE}`} className="lg-qr-svg is-ready" aria-hidden="true">
                  {DENSE_CELLS.map(([x, y]) => (
                    <rect key={`d-${x}-${y}`} x={x} y={y} width="1" height="1" />
                  ))}
                  {DENSE_FINDERS.map(([x, y]) => (
                    <g key={`df-${x}-${y}`}>
                      <rect x={x} y={y} width="7" height="7" />
                      <rect x={x + 1} y={y + 1} width="5" height="5" className="lg-qr-hole" />
                      <rect x={x + 2} y={y + 2} width="3" height="3" />
                    </g>
                  ))}
                </svg>
              ) : (
                <>
                  <svg viewBox="0 0 21 21" className="lg-qr-svg" aria-hidden="true">
                    {QR_CELLS.map(([x, y]) => (
                      <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />
                    ))}
                    {FINDERS.map(([x, y]) => (
                      <g key={`f-${x}-${y}`}>
                        <rect x={x} y={y} width="7" height="7" />
                        <rect x={x + 1} y={y + 1} width="5" height="5" className="lg-qr-hole" />
                        <rect x={x + 2} y={y + 2} width="3" height="3" />
                      </g>
                    ))}
                  </svg>
                  <span className="lg-qr-btn">
                    <QrCode size={13} />
                    点击扫码
                  </span>
                </>
              )}
            </button>
            <p className="lg-qr-tip">请使用手机微信&ldquo;扫一扫&rdquo;登录</p>
          </div>

          <div className="lg-form">
            <div className="lg-tabs">
              <button type="button" className={tab === "account" ? "is-active" : ""} onClick={() => { setTab("account"); setError(""); }}>
                账号登录
              </button>
              <button type="button" className={tab === "phone" ? "is-active" : ""} onClick={() => { setTab("phone"); setError(""); }}>
                手机登录
              </button>
            </div>
            {tab === "account" ? (
              <>
                <input
                  className="lg-input"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  autoComplete="username"
                  placeholder="请输入账号昵称"
                />
                <div className="lg-input-row">
                  <input
                    className="lg-input"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    placeholder="请输入密码"
                  />
                  <button
                    type="button"
                    className="lg-eye"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "隐藏密码" : "显示密码"}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </>
            ) : (
              <>
                <input
                  className="lg-input"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  autoComplete="tel"
                  inputMode="numeric"
                  maxLength={11}
                  placeholder="请输入手机号"
                />
                <div className="lg-input-row lg-code-row">
                  <input
                    className="lg-input"
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="请输入验证码"
                  />
                  <button
                    type="button"
                    className="lg-code-btn"
                    onClick={sendCode}
                    disabled={countdown > 0}
                  >
                    {countdown > 0 ? `${countdown}s 后重发` : "获取验证码"}
                  </button>
                </div>
              </>
            )}
            {error ? <p className="lg-error">{error}</p> : null}
            <button type="submit" className="lg-submit" disabled={loading}>
              {loading ? "登录中..." : "登录"}
            </button>
          </div>
        </div>
      </form>

      {captchaOpen ? (
        <div
          className="lg-cap-mask"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setCaptchaOpen(false);
          }}
        >
          <div className="lg-cap">
            <div className="lg-cap-head">
              <span>安全验证</span>
              <button
                type="button"
                className="lg-cap-close"
                onClick={() => setCaptchaOpen(false)}
                aria-label="关闭"
              >
                <X size={15} />
              </button>
            </div>
            <p className={`lg-cap-title${sliderState === "ok" ? " is-ok" : ""}`}>
              {sliderState === "ok" ? "验证通过" : "拖动下方滑块完成拼图"}
            </p>

            <div className="lg-cap-stage" style={{ width: STAGE_W, height: STAGE_H }}>
              <span className="lg-cap-scene" style={{ backgroundImage: `url("${SCENE_URL}")` }} />
              <span className="lg-cap-hole" style={{ left: holeX, top: HOLE_TOP }} />
              <span
                className={`lg-cap-piece${settled ? " is-run" : ""}${sliderState === "fail" ? " is-fail" : ""}`}
                style={pieceStyle}
              />
            </div>

            <div className="lg-cap-track" ref={trackRef}>
              <div
                className={`lg-cap-handle${settled ? " is-run" : ""}${sliderState === "ok" ? " is-ok" : ""}`}
                style={{ marginLeft: piecePos }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
              >
                <span className="lg-cap-grip">
                  <i /><i /><i />
                </span>
              </div>
            </div>

            <div className="lg-cap-foot">
              <button type="button" className="lg-cap-ico" aria-label="帮助">
                <HelpCircle size={14} />
              </button>
              <button type="button" className="lg-cap-ico" onClick={resetPuzzle} aria-label="换一张">
                <RefreshCw size={14} />
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <p className="lg-copyright">授权给 宣誓爱 正版使用</p>
    </main>
  );
}
