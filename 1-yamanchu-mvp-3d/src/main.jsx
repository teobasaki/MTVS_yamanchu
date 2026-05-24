import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Trophy, Zap, Radio, HeartHandshake, Star, ChevronRight, Play,
  Users, MessageCircle, Ticket, CreditCard, Send, Bot, MapPin, Crown,
  Activity, Shield, Award, ArrowLeft, ArrowRight, CalendarCheck, AlertTriangle,
  Wallet, UserPlus
} from 'lucide-react';
import './styles.css';

/* ============================================================
   DATA · Card archetypes (with stat blocks for radar/rating)
============================================================ */
const CARD_TYPES = {
  steady: {
    title: '꾸준한 2번 타자형', short: '2BAT', color: '#22c55e', rating: 84,
    description: '안정적이고 신뢰감 있는 직관 메이트. 큰 기복 없이 끝까지 함께 응원합니다.',
    traits: ['안정형', '꾸준함', '배려형', '페이스 메이커'],
    matchingTip: '차분하게 오래 대화하는 사람과 잘 맞아요.',
    stats: { 대화:7, 응원:6, 분위기:7, 몰입:6, 안정감:9 }
  },
  bullpen: {
    title: '불펜 에이스형', short: 'BP', color: '#38bdf8', rating: 88,
    description: '평소엔 차분하지만 위기 상황에서 몰입도가 확 올라가는 타입입니다.',
    traits: ['후반 집중형', '위기 상황 응원', '차분한 대화', '안정적 관계형'],
    matchingTip: '위기 순간에도 끝까지 응원하는 사람과 잘 맞아요.',
    stats: { 대화:8, 응원:7, 분위기:6, 몰입:9, 안정감:8 }
  },
  runner: {
    title: '대주자형', short: 'PR', color: '#f97316', rating: 82,
    description: '결정적 순간에 먼저 움직이는 액션형 직관 메이트입니다.',
    traits: ['빠른 반응', '장난기', '순간 집중', '실행력'],
    matchingTip: '가볍게 시작해 빠르게 친해지는 사람과 잘 맞아요.',
    stats: { 대화:6, 응원:7, 분위기:8, 몰입:7, 안정감:5 }
  },
  cheer: {
    title: '응원단장형', short: 'CHR', color: '#ef4444', rating: 90,
    description: '경기장 분위기를 끌어올리는 에너지 높은 응원 리더입니다.',
    traits: ['분위기 메이커', '응원가 풀버전', '높은 에너지', '표현형'],
    matchingTip: '같이 웃고 크게 리액션하는 사람과 잘 맞아요.',
    stats: { 대화:7, 응원:10, 분위기:9, 몰입:8, 안정감:5 }
  },
  ninth: {
    title: '9회말 심장폭격기형', short: '9TH', color: '#a855f7', rating: 92,
    description: '극적인 순간에 감정이 크게 살아나는 클러치 감성형입니다.',
    traits: ['극적 몰입', '감정 표현', '클러치 반응', '낭만형'],
    matchingTip: '역전과 끝내기의 낭만을 아는 사람과 잘 맞아요.',
    stats: { 대화:7, 응원:8, 분위기:8, 몰입:10, 안정감:6 }
  },
  data: {
    title: '냉정한 데이터 단장형', short: 'GM', color: '#6366f1', rating: 89,
    description: '기록과 흐름을 읽으며 경기를 전략적으로 즐기는 분석형입니다.',
    traits: ['기록 분석', '차분한 판단', '전략형', '관찰형'],
    matchingTip: '경기 후 분석 토크를 좋아하는 사람과 잘 맞아요.',
    stats: { 대화:10, 응원:5, 분위기:6, 몰입:7, 안정감:9 }
  },
  clutch: {
    title: '클러치 응원형', short: 'CLU', color: '#facc15', rating: 87,
    description: '중요한 순간에 응원 텐션이 폭발하는 후반 집중형입니다.',
    traits: ['후반 폭발', '몰입형', '감정 동조', '낙관적 회복'],
    matchingTip: '끝까지 포기하지 않는 사람과 잘 맞아요.',
    stats: { 대화:6, 응원:9, 분위기:8, 몰입:9, 안정감:6 }
  }
};

const NPCS = [
  {
    id: 'minji', nickname: '민지', cardKey: 'bullpen', pos: [-4, 0, -6], hiddenKeyword: '불펜',
    answers: ['홈런', '치맥', '삼성'],
    syncPoint: '두 분은 위기 상황에서 끝까지 응원하는 패턴이 비슷합니다.',
    hint: '저는 위기 상황에서 강해지는 타입이에요.',
    quickReplies: ['오늘 경기 어땠어?', '응원 스타일 궁금해', '직관 자주 오세요?']
  },
  {
    id: 'taehyun', nickname: '태현', cardKey: 'cheer', pos: [5, 0, -4], hiddenKeyword: '응원',
    answers: ['홈런', '떡볶이', '다이노스'],
    syncPoint: '두 분은 경기장 분위기를 함께 끌어올리는 에너지가 있습니다.',
    hint: '저는 경기장 분위기를 끌어올리는 걸 좋아해요.',
    quickReplies: ['응원가 잘 부르세요?', '직관 자주?', '오늘 분위기 좋았다']
  },
  {
    id: 'seoyeon', nickname: '서연', cardKey: 'data', pos: [0, 0, -10], hiddenKeyword: '데이터',
    answers: ['삼진', '치맥', '삼성'],
    syncPoint: '두 분은 경기 흐름을 읽고 분석하는 대화 리듬이 잘 맞습니다.',
    hint: '저는 기록과 데이터를 보면서 경기를 보는 편이에요.',
    quickReplies: ['오늘 투수 평가는?', '세이버메트릭스 좋아하세요?', '시즌 예상 궁금해요']
  }
];

const TICKET_GAME = {
  date: '2026.05.20 (화)',
  stadium: '대구 라이온즈파크',
  away: { team: 'NC', color: 'away' },
  home: { team: '삼성', color: 'home' }
};

function assignCard(answers) {
  const text = answers.join(' ');
  if (text.includes('데이터') || text.includes('분석') || text.includes('경기력') || text.includes('전략형')) return 'data';
  if (text.includes('응원가') || text.includes('치맥') || text.includes('분위기') || text.includes('열정형')) return 'cheer';
  if (text.includes('역전') || text.includes('감정 표현') || text.includes('홈런')) return 'ninth';
  if (text.includes('끝까지 응원') || text.includes('조용히 지켜')) return 'bullpen';
  if (text.includes('장난형') || text.includes('사람')) return 'runner';
  return 'steady';
}

function computeSync(userStats, npcStats) {
  // Cosine-ish similarity scaled to 0-100
  const keys = Object.keys(userStats);
  let dot = 0, na = 0, nb = 0;
  keys.forEach(k => {
    const a = userStats[k], b = npcStats[k];
    dot += a * b; na += a * a; nb += b * b;
  });
  const cos = dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
  return Math.round(cos * 100);
}

/* ============================================================
   APP ROOT
============================================================ */
function App() {
  const [step, setStep] = useState('landing');
  const [answers, setAnswers] = useState([]);
  const [cardKey, setCardKey] = useState('bullpen');
  const [selectedNpc, setSelectedNpc] = useState(null);
  const [balanceResult, setBalanceResult] = useState(null);
  const [confetti, setConfetti] = useState(false);

  const userCard = CARD_TYPES[cardKey];

  const finishQuiz = (quizAnswers) => {
    const key = assignCard(quizAnswers);
    setAnswers(quizAnswers);
    setCardKey(key);
    setStep('reveal');
    setConfetti(true);
    setTimeout(() => setConfetti(false), 3500);
  };

  const startProfile = (npc) => {
    setSelectedNpc(npc);
    setStep('profile');
  };

  return (
    <div className="app-shell">
      <div className="scan-sweep" />
      <AnimatePresence mode="wait">
        {step === 'landing' && <Landing key="landing" onStart={() => setStep('quiz')} />}
        {step === 'quiz' && <Quiz key="quiz" onDone={finishQuiz} />}
        {step === 'reveal' && <CardReveal key="reveal" card={userCard} onEnter={() => setStep('world')} onRetry={() => setStep('quiz')} />}
        {step === 'world' && <World key="world" userCardKey={cardKey} userCard={userCard} onNpcHit={startProfile} onBack={() => setStep('reveal')} />}
        {step === 'profile' && selectedNpc && <NpcProfile key="profile" npc={selectedNpc} userCard={userCard} onStart={() => setStep('balance')} onClose={() => setStep('world')} />}
        {step === 'balance' && selectedNpc && <BalanceGame key="balance" npc={selectedNpc} onDone={(result) => { setBalanceResult(result); setStep('result'); setConfetti(result.match >= 2); setTimeout(()=>setConfetti(false), 3500); }} />}
        {step === 'result' && selectedNpc && <MatchResult key="result" npc={selectedNpc} userCard={userCard} result={balanceResult} onChat={() => setStep('chat')} onRetry={() => setStep('world')} />}
        {step === 'chat' && selectedNpc && <Chat key="chat" npc={selectedNpc} onTicket={() => setStep('ticket')} />}
        {step === 'ticket' && selectedNpc && <TicketMock key="ticket" npc={selectedNpc} onBack={() => setStep('chat')} onHome={() => setStep('world')} />}
      </AnimatePresence>
      {confetti && <Confetti />}
    </div>
  );
}

/* ============================================================
   LANDING
============================================================ */
function Landing({ onStart }) {
  return (
    <motion.section className="screen landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="landing-grid" />
      <div className="stadium-arc" />
      <div className="landing-marquee">
        <span className="dot" />
        LIVE · MATCHDAY 2026.05.20 · 대구 라이온즈파크
      </div>
      <motion.div
        className="hero-card"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <div className="hero-crest">野</div>
        <div className="eyebrow">PREMIER DATING SERVICE · DESKTOP DEMO</div>
        <h1>야만추<span className="hanja">野慢追</span></h1>
        <h2>야구장에서 만남을 추구하다</h2>
        <p className="lede">
          직관을 매개로 자연스럽게 이어지는 프리미엄 야구 기반 소셜 매칭.<br />
          박스석에서 시작해 9회말까지, 한 경기의 모든 장면을 함께합니다.
        </p>
        <div className="hero-meta">
          <span className="chip"><Crown size={14} /> Premier Match</span>
          <span className="chip emerald"><Activity size={14} /> Real-time Sync</span>
          <span className="chip"><Award size={14} /> KBO Partner Demo</span>
        </div>
        <div className="hero-cta">
          <button className="btn btn-primary" onClick={onStart}>
            <Play size={16} /> 시연 시작하기
          </button>
          <button className="btn btn-ghost" onClick={onStart}>
            <ChevronRight size={16} /> 카드 발급부터 시작
          </button>
        </div>
      </motion.div>
    </motion.section>
  );
}

/* ============================================================
   QUIZ
============================================================ */
function Quiz({ onDone }) {
  const questions = [
    { q: '직관 스타일은?', a: ['조용히 집중', '치맥과 함께 응원', '응원가 풀버전', '사진과 분위기 즐기기'] },
    { q: '위기 상황에서 나는?', a: ['조용히 지켜본다', '끝까지 응원한다', '데이터로 분석한다', '감정 표현이 커진다'] },
    { q: '가장 좋아하는 순간은?', a: ['홈런', '삼진', '역전', '호수비'] },
    { q: '직관에서 더 중요한 것은?', a: ['경기력', '분위기', '사람', '음식'] },
    { q: '내 연애 스타일은?', a: ['안정형', '열정형', '장난형', '전략형'] }
  ];
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState([]);
  const pick = (choice) => {
    const next = [...selected, choice];
    if (idx === questions.length - 1) onDone(next);
    else { setSelected(next); setIdx(idx + 1); }
  };
  return (
    <motion.section className="screen quiz" initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -40, opacity: 0 }}>
      <div className="quiz-panel">
        <div className="quiz-head">
          <span className="eyebrow">AI 성향 카드 발급 · Rule-based Demo</span>
          <div className="step-counter">Q<b>{String(idx + 1).padStart(2,'0')}</b>/0{questions.length}</div>
        </div>
        <div className="progress"><div style={{ width: `${((idx + 1) / questions.length) * 100}%` }} /></div>
        <h2>{questions[idx].q}</h2>
        <div className="choice-grid">
          {questions[idx].a.map((c, i) => (
            <button key={c} data-num={String.fromCharCode(65 + i)} onClick={() => pick(c)}>{c}</button>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

/* ============================================================
   CARD REVEAL
============================================================ */
function CardReveal({ card, onEnter, onRetry }) {
  return (
    <motion.section className="screen reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="particles">{Array.from({ length: 36 }).map((_, i) => <span key={i} style={{ '--i': i }} />)}</div>
      <div className="reveal-marquee">★ TODAY'S PREMIER CARD ★</div>

      <motion.div
        className="premier-card"
        initial={{ rotateY: 90, scale: .7, opacity: 0 }}
        animate={{ rotateY: 0, scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, type: 'spring' }}
      >
        <div className="pc-inner">
          <div className="pc-top">
            <div>
              <div className="pc-rating">{card.rating}</div>
              <div className="pc-pos">{card.short}</div>
            </div>
            <div style={{ textAlign:'right', fontFamily:'var(--font-pixel)', fontSize:9, color:'var(--gold-500)', letterSpacing:1.5 }}>
              YMC · 2026<br/>SEASON
            </div>
          </div>

          <div className="pc-crest" style={{ borderColor: card.color, boxShadow:`inset 0 0 30px ${card.color}55, 0 0 28px ${card.color}55` }}>⚾</div>

          <div className="pc-name">{card.title}</div>
          <div className="pc-sub">PREMIER · YAMANCHU</div>
          <p className="pc-desc">{card.description}</p>

          <div className="pc-divider" />

          <div className="pc-stats">
            {Object.entries(card.stats).slice(0,3).map(([k,v]) => (
              <div className="stat" key={k}>
                <div className="v">{String(v*10 - 5).padStart(2,'0')}</div>
                <div className="k">{k}</div>
              </div>
            ))}
          </div>

          <div className="pc-traits">
            {card.traits.map(t => <span key={t}>{t}</span>)}
          </div>
        </div>
      </motion.div>

      <div className="reveal-actions">
        <button className="btn btn-ghost" onClick={onRetry}>
          <ArrowLeft size={14}/> 다시 진단
        </button>
        <button className="btn btn-primary glow" onClick={onEnter}>
          야구장 입장하기 <ArrowRight size={16} />
        </button>
      </div>
    </motion.section>
  );
}

/* ============================================================
   WORLD (3D)
============================================================ */
function useKeys() {
  const keys = useRef({});
  useEffect(() => {
    const down = (e) => { keys.current[e.key.toLowerCase()] = true; };
    const up = (e) => { keys.current[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);
  return keys;
}

function World({ userCardKey, userCard, onNpcHit }) {
  const playerRef = useRef();
  const npcsRef = useRef({});
  const [cooldowns, setCooldowns] = useState({ ball: 0, bat: 0 });
  const [balls, setBalls] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [nearest, setNearest] = useState(null);
  const [swinging, setSwinging] = useState(false);
  const [liveSync, setLiveSync] = useState({});
  const cdRef = useRef({ ball: 0, bat: 0 });

  useEffect(() => {
    const t = setInterval(() => {
      const now = performance.now();
      setCooldowns({
        ball: Math.max(0, Math.ceil((cdRef.current.ball - now) / 1000)),
        bat: Math.max(0, Math.ceil((cdRef.current.bat - now) / 1000))
      });
    }, 150);
    return () => clearInterval(t);
  }, []);

  // Compute initial sync values
  useEffect(() => {
    const sync = {};
    NPCS.forEach(npc => {
      sync[npc.id] = computeSync(userCard.stats, CARD_TYPES[npc.cardKey].stats);
    });
    setLiveSync(sync);
  }, [userCardKey]);

  const throwBall = () => {
    const now = performance.now();
    if (cdRef.current.ball > now) return;
    const group = playerRef.current;
    if (!group) return;
    const dir = new THREE.Vector3(0, 0, -1).applyEuler(group.rotation).normalize();
    const pos = group.position.clone().add(new THREE.Vector3(0, 1.2, 0)).add(dir.clone().multiplyScalar(1.0));
    setBalls((prev) => [...prev, { id: crypto.randomUUID(), pos, dir, born: now }]);
    cdRef.current.ball = now + 2000;
    setFeedback('⚾ 공을 던졌습니다');
  };

  const swingBat = () => {
    const now = performance.now();
    if (cdRef.current.bat > now) return;
    cdRef.current.bat = now + 2000;
    setSwinging(true);
    setTimeout(() => setSwinging(false), 300);
    const group = playerRef.current;
    if (!group) return;
    const playerPos = group.position.clone();
    const forward = new THREE.Vector3(0, 0, -1).applyEuler(group.rotation).normalize();
    const hitNpc = NPCS.find(npc => {
      const npcObj = npcsRef.current[npc.id];
      if (!npcObj) return false;
      const v = npcObj.position.clone().sub(playerPos);
      const dist = v.length();
      const dot = forward.dot(v.normalize());
      return dist < 2.6 && dot > 0.15;
    });
    if (hitNpc) {
      setFeedback(`★ ${hitNpc.nickname}님에게 배트 인사 성공`);
      setTimeout(() => onNpcHit(hitNpc), 350);
    } else {
      setFeedback('헛스윙! 조금 더 가까이 가보세요');
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => feedback && setFeedback(''), 1800);
    return () => clearTimeout(timeout);
  }, [feedback]);

  // Find top-similar NPC for highlighting
  const topSyncNpcId = useMemo(() => {
    let best = null, bestV = -1;
    Object.entries(liveSync).forEach(([id, v]) => { if (v > bestV) { bestV = v; best = id; } });
    return best;
  }, [liveSync]);

  return (
    <motion.section className="screen world-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <Canvas shadows camera={{ position: [0, 5, 8], fov: 60 }}>
        <color attach="background" args={["#04130d"]} />
        <fog attach="fog" args={["#04130d", 18, 50]} />
        <ambientLight intensity={0.55} />
        <directionalLight position={[6, 12, 4]} intensity={1.4} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
        <pointLight position={[-8, 5, 8]} intensity={0.7} color="#d4af37" distance={26} />
        <pointLight position={[8, 5, 8]} intensity={0.7} color="#10b981" distance={26} />
        <Stadium />
        <Player refObj={playerRef} swinging={swinging} />
        <CameraFollow target={playerRef} />
        <NPCGroup refs={npcsRef} userCardKey={userCardKey} topSyncNpcId={topSyncNpcId} />
        <BallProjectiles balls={balls} setBalls={setBalls} npcRefs={npcsRef} onHit={(npc) => { setFeedback(`★ ${npc.nickname}님 명중 · 프로필 공개`); setTimeout(() => onNpcHit(npc), 250); }} />
        <NearestTracker playerRef={playerRef} npcRefs={npcsRef} setNearest={setNearest} />
      </Canvas>

      {/* HUD: Top-left player card */}
      <div className="hud hud-card">
        <div className="head">
          <span className="lbl">★ YOUR CARD</span>
          <span className="badge">YMC · {userCard.short}</span>
        </div>
        <div className="body">
          <div className="avatar" style={{ borderColor: userCard.color }}>⚾</div>
          <div className="meta">
            <span className="name">{userCard.title}</span>
            <span className="role">RATING {userCard.rating}</span>
          </div>
        </div>
        <div className="keys">
          <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd>
          <kbd>← → ↑ ↓</kbd>
        </div>
      </div>

      {/* HUD: Top-center stadium title */}
      <div className="hud hud-title">
        <span className="crest">▣ 야만추 STADIUM</span>
        <span className="sep" />
        <span className="meta">SEASON · 2026</span>
        <span className="sep" />
        <span className="live">LIVE</span>
      </div>

      {/* HUD: Top-right live sync radar */}
      <div className="hud hud-sync">
        <div className="head">
          <span className="ttl"><Activity size={12} style={{verticalAlign:'middle', marginRight:6}}/>LIVE SYNC</span>
          <span className="pulse">3 NPCS</span>
        </div>
        <div className="stream">
          {NPCS.map(npc => {
            const v = liveSync[npc.id] || 0;
            const top = npc.id === topSyncNpcId;
            return (
              <div key={npc.id} className={`row ${top ? 'match' : ''}`}>
                <span className="nm">{top && '★ '}{npc.nickname}</span>
                <span className="pct">{v}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* HUD: Bottom info */}
      <div className="hud hud-bottom">
        <span className="arrow">▶</span>
        {nearest ? (
          <>
            <span>가까운 상대 ·</span>
            <strong className="nm">{nearest.nickname}</strong>
            <span>·</span>
            <span className="card-name">{CARD_TYPES[nearest.cardKey].title}</span>
          </>
        ) : (
          <span>NPC를 찾아 공을 던지거나 배트로 인사해 보세요</span>
        )}
      </div>

      {feedback && <div className="toast">{feedback}</div>}

      <div className="action-panel">
        <button onClick={throwBall} disabled={cooldowns.ball > 0}>
          ⚾ 공 던지기 {cooldowns.ball > 0 && <span className="cd">({cooldowns.ball})</span>}
        </button>
        <button className="primary" onClick={swingBat} disabled={cooldowns.bat > 0}>
          🏏 배트 휘두르기 {cooldowns.bat > 0 && <span className="cd">({cooldowns.bat})</span>}
        </button>
      </div>
    </motion.section>
  );
}

function Stadium() {
  return (
    <group>
      {/* Outer field - rich emerald turf with subtle pattern */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[22, 96]} />
        <meshStandardMaterial color="#0e6b3a" roughness={.95} />
      </mesh>
      {/* Mowing stripes */}
      {[...Array(10)].map((_, i) => (
        <mesh key={i} position={[0, 0.005, 0]} rotation={[-Math.PI/2, 0, 0]}>
          <ringGeometry args={[1 + i*2, 1 + i*2 + 0.9, 64]} />
          <meshStandardMaterial color={i % 2 === 0 ? "#0e6b3a" : "#0a5a31"} roughness={1} />
        </mesh>
      ))}
      {/* Infield diamond */}
      <mesh position={[0, 0.012, -3]} rotation={[-Math.PI / 2, 0, Math.PI / 4]} receiveShadow>
        <boxGeometry args={[10, 10, .05]} />
        <meshStandardMaterial color="#a06a38" roughness={1} />
      </mesh>
      <mesh position={[0, 0.02, -3]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.2, 32]} />
        <meshStandardMaterial color="#c8975f" roughness={1} />
      </mesh>
      {/* Bases */}
      {[[0,-8],[-4,-4],[0,0],[4,-4]].map(([x,z], i) => (
        <mesh key={i} position={[x, .04, z]} rotation={[-Math.PI/2,0,Math.PI/4]} receiveShadow>
          <boxGeometry args={[.8,.8,.08]} /><meshStandardMaterial color="#f8fafc" />
        </mesh>
      ))}
      {/* Gold trim foul lines */}
      <mesh position={[-6, 0.02, -4]} rotation={[-Math.PI/2, 0, Math.PI/4]}>
        <boxGeometry args={[14, 0.1, 0.02]} />
        <meshStandardMaterial color="#d4af37" emissive="#d4af37" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[6, 0.02, -4]} rotation={[-Math.PI/2, 0, -Math.PI/4]}>
        <boxGeometry args={[14, 0.1, 0.02]} />
        <meshStandardMaterial color="#d4af37" emissive="#d4af37" emissiveIntensity={0.4} />
      </mesh>
      {/* Premium scoreboard wall (back) */}
      <mesh position={[0, 2.5, -16]} castShadow>
        <boxGeometry args={[14, 5, 0.4]} />
        <meshStandardMaterial color="#04130d" emissive="#d4af37" emissiveIntensity={0.15} />
      </mesh>
      <mesh position={[0, 2.5, -15.78]}>
        <boxGeometry args={[12, 4, 0.05]} />
        <meshStandardMaterial color="#0a1f17" emissive="#10b981" emissiveIntensity={0.3} />
      </mesh>
      {/* Premier boxes (stands) */}
      <group position={[0,0,0]}>
        {Array.from({length: 28}).map((_, i) => {
          const angle = (Math.PI * 2 * i)/28;
          const r = 23.5;
          const isGold = i % 4 === 0;
          return (
            <mesh key={i} position={[Math.cos(angle)*r, 1.2, Math.sin(angle)*r]} rotation={[0, -angle + Math.PI/2, 0]} castShadow>
              <boxGeometry args={[3.4, 2.4, 1]} />
              <meshStandardMaterial
                color={isGold ? '#3d2a06' : '#0a3a26'}
                emissive={isGold ? '#d4af37' : '#10b981'}
                emissiveIntensity={isGold ? 0.18 : 0.08}
              />
            </mesh>
          );
        })}
      </group>
      {/* Pitcher's mound */}
      <mesh position={[0, 0.06, -3.5]} receiveShadow>
        <cylinderGeometry args={[0.45, 0.7, 0.12, 24]} />
        <meshStandardMaterial color="#c8975f" roughness={1} />
      </mesh>
    </group>
  );
}

function Player({ refObj, swinging }) {
  const keys = useKeys();
  useFrame((_, delta) => {
    const g = refObj.current;
    if (!g) return;
    const speed = 6 * delta;
    const rotSpeed = 2.6 * delta;
    if (keys.current['a'] || keys.current['arrowleft']) g.rotation.y += rotSpeed;
    if (keys.current['d'] || keys.current['arrowright']) g.rotation.y -= rotSpeed;
    const forward = new THREE.Vector3(0,0,-1).applyEuler(g.rotation).normalize();
    if (keys.current['w'] || keys.current['arrowup']) g.position.add(forward.multiplyScalar(speed));
    if (keys.current['s'] || keys.current['arrowdown']) g.position.add(forward.multiplyScalar(-speed));
    g.position.x = THREE.MathUtils.clamp(g.position.x, -16, 16);
    g.position.z = THREE.MathUtils.clamp(g.position.z, -16, 10);
  });
  return (
    <group ref={refObj} position={[0,0,4]} rotation={[0, Math.PI, 0]}>
      <CartoonPlayer color="#d4af37" swinging={swinging} isPlayer />
    </group>
  );
}

function CartoonPlayer({ color = '#d4af37', swinging = false, isPlayer = false }) {
  return (
    <group>
      <mesh position={[0,1.85,0]} castShadow><sphereGeometry args={[.42, 24, 24]} /><meshStandardMaterial color="#f2c09b" /></mesh>
      <mesh position={[0,2.25,-.03]} castShadow><sphereGeometry args={[.45, 24, 12, 0, Math.PI*2, 0, Math.PI/2]} /><meshStandardMaterial color={color} /></mesh>
      <mesh position={[0,1.2,0]} castShadow><capsuleGeometry args={[.32,.75,8,16]} /><meshStandardMaterial color={color} /></mesh>
      <mesh position={[0,.6,0]} castShadow><boxGeometry args={[.7,.45,.35]} /><meshStandardMaterial color="#f8fafc" /></mesh>
      <mesh position={[-.42,1.15,0]} rotation={[0,0,.45]} castShadow><capsuleGeometry args={[.08,.55,6,10]} /><meshStandardMaterial color="#f2c09b" /></mesh>
      <mesh position={[.42,1.15,0]} rotation={[0,0,-.45 + (swinging ? -1.2 : 0)]} castShadow><capsuleGeometry args={[.08,.55,6,10]} /><meshStandardMaterial color="#f2c09b" /></mesh>
      <mesh position={[-.18,.25,0]} rotation={[0,0,.2]} castShadow><capsuleGeometry args={[.11,.7,6,10]} /><meshStandardMaterial color="#f8fafc" /></mesh>
      <mesh position={[.18,.25,0]} rotation={[0,0,-.2]} castShadow><capsuleGeometry args={[.11,.7,6,10]} /><meshStandardMaterial color="#f8fafc" /></mesh>
      <mesh position={[-.62,1.05,-.08]} castShadow><sphereGeometry args={[.12,16,16]} /><meshStandardMaterial color="#ffffff" /></mesh>
      <mesh position={[.72,1.05,-.04]} rotation={[0,0,1.2 + (swinging ? 1.0 : 0)]} castShadow><cylinderGeometry args={[.045,.065,1.1,12]} /><meshStandardMaterial color="#8b5a2b" /></mesh>
      {isPlayer && (
        <mesh position={[0,.05,0]} rotation={[-Math.PI/2,0,0]}>
          <ringGeometry args={[.78,.94,32]} />
          <meshBasicMaterial color="#d4af37" transparent opacity={.6} />
        </mesh>
      )}
    </group>
  );
}

function NPCGroup({ refs, userCardKey, topSyncNpcId }) {
  return (
    <group>
      {NPCS.map((npc, i) => (
        <NPCAvatar
          key={npc.id}
          npc={npc}
          idx={i}
          refs={refs}
          isSimilar={npc.cardKey === userCardKey || npc.id === topSyncNpcId}
        />
      ))}
    </group>
  );
}

function NPCAvatar({ npc, idx, refs, isSimilar }) {
  const group = useRef();
  const card = CARD_TYPES[npc.cardKey];
  useEffect(() => { refs.current[npc.id] = group.current; }, []);
  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime * .45 + idx * 2;
    group.current.position.x = npc.pos[0] + Math.sin(t) * 1.2;
    group.current.position.z = npc.pos[2] + Math.cos(t * .8) * .9;
    group.current.rotation.y = Math.sin(t) * .7 + Math.PI;
  });
  return (
    <group ref={group} position={npc.pos}>
      <mesh position={[0,.04,0]} rotation={[-Math.PI/2,0,0]}>
        <ringGeometry args={[.78, isSimilar ? 1.22 : 1.0, 48]} />
        <meshBasicMaterial color={isSimilar ? '#d4af37' : card.color} transparent opacity={isSimilar ? .95 : .55} />
      </mesh>
      {isSimilar && (
        <mesh position={[0,.045,0]} rotation={[-Math.PI/2,0,0]}>
          <ringGeometry args={[1.3, 1.5, 48]} />
          <meshBasicMaterial color="#d4af37" transparent opacity={.35} />
        </mesh>
      )}
      <pointLight color={isSimilar ? '#d4af37' : card.color} intensity={isSimilar ? 2.6 : 1.2} distance={5} position={[0,1.4,0]} />
      <CartoonPlayer color={card.color} />
    </group>
  );
}

function CameraFollow({ target }) {
  const { camera } = useThree();
  const desired = new THREE.Vector3();
  useFrame(() => {
    const t = target.current;
    if (!t) return;
    const back = new THREE.Vector3(0, 3.4, 6.2).applyEuler(t.rotation);
    desired.copy(t.position).add(back);
    camera.position.lerp(desired, .12);
    const lookAt = t.position.clone().add(new THREE.Vector3(0,1.2,0));
    camera.lookAt(lookAt);
  });
  return null;
}

function BallProjectiles({ balls, setBalls, npcRefs, onHit }) {
  const meshRefs = useRef({});
  useFrame((_, delta) => {
    if (!balls.length) return;
    const now = performance.now();
    const next = [];
    for (const b of balls) {
      b.pos.add(b.dir.clone().multiplyScalar(delta * 13));
      const mesh = meshRefs.current[b.id];
      if (mesh) mesh.position.copy(b.pos);
      let hit = null;
      for (const npc of NPCS) {
        const obj = npcRefs.current[npc.id];
        if (obj && obj.position.distanceTo(b.pos) < 1.0) { hit = npc; break; }
      }
      if (hit) { onHit(hit); continue; }
      if (now - b.born < 1300) next.push(b);
    }
    if (next.length !== balls.length) setBalls(next);
  });
  return (
    <group>
      {balls.map(b => (
        <mesh key={b.id} ref={el => meshRefs.current[b.id] = el} position={b.pos} castShadow>
          <sphereGeometry args={[.16,16,16]} />
          <meshStandardMaterial color="#ffffff" emissive="#d4af37" emissiveIntensity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function NearestTracker({ playerRef, npcRefs, setNearest }) {
  useFrame(() => {
    const p = playerRef.current; if (!p) return;
    let best = null, bestD = Infinity;
    NPCS.forEach(npc => {
      const obj = npcRefs.current[npc.id];
      if (!obj) return;
      const d = obj.position.distanceTo(p.position);
      if (d < bestD) { bestD = d; best = npc; }
    });
    setNearest(bestD < 8 ? best : null);
  });
  return null;
}

/* ============================================================
   NPC PROFILE MODAL — with radar chart
============================================================ */
function RadarChart({ statsA, statsB, colorA = '#d4af37', colorB = '#10b981' }) {
  const keys = Object.keys(statsA);
  const cx = 110, cy = 110, R = 78;
  const angles = keys.map((_, i) => (Math.PI * 2 * i / keys.length) - Math.PI / 2);
  const buildPoly = (stats) => keys.map((k, i) => {
    const v = stats[k] / 10;
    return [cx + Math.cos(angles[i]) * R * v, cy + Math.sin(angles[i]) * R * v];
  });
  const ptsA = buildPoly(statsA);
  const ptsB = buildPoly(statsB);
  const polyStr = (pts) => pts.map(([x, y]) => `${x},${y}`).join(' ');

  return (
    <svg viewBox="0 0 220 220" style={{ width:'100%', height:'auto', display:'block' }}>
      {[0.25, 0.5, 0.75, 1].map(s => (
        <polygon
          key={s}
          points={keys.map((_, i) => `${cx + Math.cos(angles[i]) * R * s},${cy + Math.sin(angles[i]) * R * s}`).join(' ')}
          fill="none" stroke="#2c3754" strokeWidth="0.7"
          strokeDasharray={s === 1 ? '0' : '2 2'}
        />
      ))}
      {keys.map((_, i) => (
        <line key={i} x1={cx} y1={cy}
          x2={cx + Math.cos(angles[i]) * R}
          y2={cy + Math.sin(angles[i]) * R}
          stroke="#2c3754" strokeWidth="0.5" />
      ))}
      <motion.polygon
        points={polyStr(ptsB)}
        fill="rgba(16,185,129,.22)" stroke={colorB} strokeWidth="1.2"
        initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        style={{ transformOrigin: `${cx}px ${cy}px`, filter: 'drop-shadow(0 0 4px rgba(16,185,129,.5))' }}
      />
      <motion.polygon
        points={polyStr(ptsA)}
        fill="rgba(212,175,55,.20)" stroke={colorA} strokeWidth="1.5"
        initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        style={{ transformOrigin: `${cx}px ${cy}px`, filter: 'drop-shadow(0 0 4px rgba(212,175,55,.5))' }}
      />
      {ptsA.map(([x, y], i) => (
        <circle key={`a${i}`} cx={x} cy={y} r="2.5" fill={colorA} />
      ))}
      {keys.map((k, i) => {
        const x = cx + Math.cos(angles[i]) * (R + 16);
        const y = cy + Math.sin(angles[i]) * (R + 16);
        return (
          <text key={k} x={x} y={y + 3} textAnchor="middle"
            fontSize="10" fill="#f4ecd8" fontFamily="DotGothic16, sans-serif">
            {k}
          </text>
        );
      })}
    </svg>
  );
}

function NpcProfile({ npc, userCard, onStart, onClose }) {
  const card = CARD_TYPES[npc.cardKey];
  const sync = computeSync(userCard.stats, card.stats);
  return (
    <motion.section className="screen modal-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="profile-modal">
        <button className="close-btn" onClick={onClose}>×</button>
        <motion.div className="mini-card"
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4 }}
        >
          <div className="mini-head">
            <div className="avatar-round" style={{ borderColor: card.color }}>⚾</div>
            <div className="id">
              <h2 className="nm">{npc.nickname}</h2>
              <div className="role">{card.title}</div>
            </div>
            <div className="rating">
              <div className="v">{card.rating}</div>
              <div className="l">RATING</div>
            </div>
          </div>

          <div className="mini-body">
            <div className="col-text">
              <p>{card.description}</p>
              <div className="traits">
                {card.traits.map(t => <span key={t}>{t}</span>)}
              </div>
            </div>
            <div className="col-radar">
              <div className="lbl">
                <span>▣ COMPATIBILITY RADAR</span>
                <span>5 AXIS</span>
              </div>
              <RadarChart statsA={userCard.stats} statsB={card.stats} colorA="#d4af37" colorB={card.color}/>
              <div style={{ display:'flex', justifyContent:'center', gap:14, fontSize:11, marginTop:4, color:'var(--muted)', fontFamily:'var(--font-pixel-kr)' }}>
                <span style={{color:'#d4af37'}}>● 나</span>
                <span style={{color:card.color}}>● {npc.nickname}</span>
              </div>
            </div>
          </div>

          <div className="sync-box">
            <span className="tag">★ SYNC POINT · {sync}%</span>
            {npc.syncPoint}
          </div>

          <div className="mini-actions">
            <button className="btn btn-ghost" onClick={onClose}>닫기</button>
            <button className="btn btn-primary" onClick={onStart}>
              <Zap size={14}/> 밸런스 게임 시작
            </button>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}

/* ============================================================
   BALANCE GAME
============================================================ */
function BalanceGame({ npc, onDone }) {
  const qs = [
    { q: '홈런 vs 삼진', opts: ['홈런','삼진'] },
    { q: '치맥 vs 떡볶이', opts: ['치맥','떡볶이'] },
    { q: '삼성 vs 다이노스', opts: ['삼성','다이노스'] }
  ];
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [time, setTime] = useState(3);
  useEffect(() => {
    setTime(3);
    const timer = setInterval(() => setTime(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [idx]);
  useEffect(() => { if (time <= 0) pick(null); }, [time]);

  const pick = (choice) => {
    const next = [...answers, choice || '무응답'];
    if (idx === qs.length - 1) {
      const match = next.reduce((acc, a, i) => acc + (a === npc.answers[i] ? 1 : 0), 0);
      const sync = match === 3 ? 92 : match === 2 ? 78 : match === 1 ? 48 : 25;
      onDone({ answers: next, match, sync });
    } else { setAnswers(next); setIdx(idx + 1); }
  };

  return (
    <motion.section className="screen balance" initial={{ opacity: 0, scale: .98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
      <div className="game-panel">
        <div className="game-head">
          <div className="left">
            <div className="opp-name">vs {npc.nickname}</div>
            <div className="opp-sub">{CARD_TYPES[npc.cardKey].title}</div>
          </div>
          <div className="qcount">Q {idx+1}/{qs.length}</div>
        </div>
        <div className={`timer ${time <= 1 ? 'urgent' : ''}`}>{Math.max(0, time)}</div>
        <h2>{qs[idx].q}</h2>
        <div className="versus-row">
          <button onClick={() => pick(qs[idx].opts[0])}>{qs[idx].opts[0]}</button>
          <div className="vs">VS</div>
          <button onClick={() => pick(qs[idx].opts[1])}>{qs[idx].opts[1]}</button>
        </div>
        <div className="game-foot">
          <span className="live-dot"></span>
          상대의 선택은 자동으로 공개됩니다 · 3초 제한
        </div>
      </div>
    </motion.section>
  );
}

/* ============================================================
   MATCH RESULT — Cinematic
============================================================ */
function MatchResult({ npc, userCard, result, onChat, onRetry }) {
  const success = result?.match >= 2;
  const npcCard = CARD_TYPES[npc.cardKey];
  const [sync, setSync] = useState(0);

  useEffect(() => {
    const target = result?.sync || 0;
    let v = 0;
    const t = setInterval(() => {
      v += Math.max(1, Math.ceil((target - v) / 6));
      if (v >= target) { v = target; clearInterval(t); }
      setSync(v);
    }, 40);
    return () => clearInterval(t);
  }, [result]);

  return (
    <motion.section className="screen result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="result-card"
        initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}
      >
        <span className={`stamp ${success ? '' : 'fail'}`}>
          {success ? <><Trophy size={12}/> MATCH SUCCESS</> : <><AlertTriangle size={12}/> NOT YET</>}
        </span>
        <h1>{success ? '친구 추가 성공!' : '아직은 어색한 직관 메이트'}</h1>
        <div className="meta-line">FINAL · BALANCE GAME · {result?.match}/3</div>

        <div className="result-scoreline">
          <div className="side">
            <div className="nm">나</div>
            <div className="role">{userCard.short} · {userCard.rating}</div>
          </div>
          <div className="score">
            {sync}<span className="pct">%</span>
          </div>
          <div className="side">
            <div className="nm">{npc.nickname}</div>
            <div className="role">{npcCard.short} · {npcCard.rating}</div>
          </div>
        </div>

        <div className="result-receipt">
          <div className="row"><span>매칭 시각</span><b>{new Date().toTimeString().slice(0,5)}</b></div>
          <div className="row"><span>일치 문항</span><b>{result?.match}/3</b></div>
          <div className="row"><span>감정 동조율</span><b>{result?.sync}%</b></div>
          <div className="row"><span>평가</span><b>{sync >= 85 ? '★ 최고의 매칭' : sync >= 70 ? '좋은 매칭' : sync >= 40 ? '무난한 매칭' : '재도전 권장'}</b></div>
        </div>

        <p style={{color:'var(--muted)', fontSize:13, margin:'8px 0 0'}}>
          {success ? `${npc.nickname}님과 감정 동조율이 높습니다. 메시지를 보내 보세요.`
                   : '조금 더 잘 맞는 직관 메이트를 찾아볼까요?'}
        </p>

        <div className="result-actions">
          <button className="btn btn-ghost" onClick={onRetry}>
            <ArrowLeft size={14}/> 야구장으로
          </button>
          {success
            ? <button className="btn btn-primary" onClick={onChat}><MessageCircle size={14}/> 메시지 보내기</button>
            : <button className="btn btn-emerald" onClick={onRetry}><UserPlus size={14}/> 다른 상대 찾기</button>}
        </div>
      </motion.div>
    </motion.section>
  );
}

/* ============================================================
   CHAT — with AI hints and reply chips
============================================================ */
function Chat({ npc, onTicket }) {
  const card = CARD_TYPES[npc.cardKey];
  const [messages, setMessages] = useState([
    { from: 'system', text: '스무고개 모드가 시작되었습니다. 상대의 숨겨진 성향 키워드를 맞춰보세요.' },
    { from: npc.nickname, text: npc.hint, chips: npc.quickReplies }
  ]);
  const [input, setInput] = useState('');
  const [solved, setSolved] = useState(false);
  const [hintsLeft, setHintsLeft] = useState(2);
  const scrollRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const send = (val) => {
    const text = (val ?? input).trim();
    if (!text) return;
    const ok = text.includes(npc.hiddenKeyword);
    const reply = ok
      ? { from: 'system', text: `★ 정답 ★ ${npc.nickname}님의 숨겨진 키워드는 "${npc.hiddenKeyword}"입니다.`, success: true }
      : { from: npc.nickname, text: aiReply(npc, text), chips: pickReplyChips(npc, text) };
    setMessages(prev => [...prev, { from: '나', text }, reply]);
    if (ok) setSolved(true);
    setInput('');
  };

  const askHint = () => {
    if (hintsLeft <= 0) return;
    setHintsLeft(hintsLeft - 1);
    const letter = npc.hiddenKeyword.charAt(0);
    setMessages(prev => [...prev, { from: 'system', text: `💡 힌트 · 키워드는 "${letter}"로 시작합니다 (남은 힌트 ${hintsLeft - 1}회)` }]);
  };

  return (
    <motion.section className="screen chat-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="chat-box">
        <div className="chat-head">
          <div className="who">
            <div className="av" style={{ borderColor: card.color }}>⚾</div>
            <div>
              <div className="nm">{npc.nickname}</div>
              <div className="role">{card.title} · RATING {card.rating}</div>
            </div>
          </div>
          <button className="hint-box" onClick={askHint} disabled={hintsLeft <= 0} style={{cursor: hintsLeft > 0 ? 'pointer' : 'not-allowed', opacity: hintsLeft > 0 ? 1 : 0.5}}>
            <Sparkles size={12} style={{verticalAlign:'middle', marginRight:6}}/>
            AI 힌트 · {hintsLeft}회
          </button>
        </div>

        <div className="messages" ref={scrollRef}>
          {messages.map((m, i) => (
            <motion.div key={i}
              className={`msg ${m.from === '나' ? 'me' : m.from === 'system' ? `system${m.success ? ' success' : ''}` : 'them'}`}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .25 }}
            >
              <b>{m.from}</b>
              <div>{m.text}</div>
              {m.chips && m.chips.length > 0 && (
                <div className="reply-chips">
                  {m.chips.map(c => (
                    <button key={c} onClick={() => send(c)}>{c}</button>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="chat-input">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') send(); }}
            placeholder={`키워드를 입력해 보세요 · 예: ${npc.hiddenKeyword}`}
          />
          <button onClick={() => send()}><Send size={12}/> 전송</button>
        </div>

        {solved && (
          <button className="btn btn-primary wide" onClick={onTicket}>
            <Ticket size={14}/> 나랑 직관 갈래?
          </button>
        )}
      </div>
    </motion.section>
  );
}

function aiReply(npc, msg) {
  const m = msg.toLowerCase();
  if (m.includes('응원')) return '응원하는 거 좋아하시죠? 저는 분위기에 따라 다른데 오늘 같은 날엔 같이 외쳐요!';
  if (m.includes('치맥') || m.includes('치킨')) return '경기 끝나고 치맥은 거의 의식이에요. 어떤 곳 자주 가세요?';
  if (m.includes('투수') || m.includes('타자') || m.includes('분석')) return '저도 그쪽 좋아해요. 오늘 이닝별 흐름 어떻게 보셨어요?';
  if (m.includes('직관')) return '직관 자주 와요. 시즌권 살까 고민 중이에요.';
  return '오, 비슷한 결이네요. 힌트는 제가 위기·분위기·기록 중 하나를 좋아하는 타입이라는 거예요!';
}

function pickReplyChips(npc, msg) {
  // Always offer a few hint-y next steps
  return [
    `${npc.hiddenKeyword.charAt(0)}로 시작하는 단어`,
    '오늘 인상 깊은 장면은?',
    '다음 직관 같이 갈래요?'
  ];
}

/* ============================================================
   TICKET — Premium boutique
============================================================ */
function TicketMock({ npc, onBack, onHome }) {
  const [done, setDone] = useState(false);
  const [pay, setPay] = useState('dutch');
  return (
    <motion.section className="screen ticket" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="ticket-card"
        initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4 }}
      >
        <div className="ticket-stub">
          <div className="brand">★ YAMANCHU × KBO PREMIER ★</div>
          <h1>제휴 할인 티켓</h1>
          <div className="num">YMC-2026-{npc.id.toUpperCase().slice(0,4)}-029</div>
        </div>

        {!done ? (
          <div className="ticket-body">
            <h2>{npc.nickname}님과 2인 직관 패키지</h2>

            <div className="match-card">
              <div className="team away">
                <div className="badge">{TICKET_GAME.away.team}</div>
                <div className="nm">{TICKET_GAME.away.team}</div>
              </div>
              <div className="vs">vs</div>
              <div className="team home">
                <div className="badge">{TICKET_GAME.home.team.slice(0,2)}</div>
                <div className="nm">{TICKET_GAME.home.team}</div>
              </div>
            </div>

            <div style={{ display:'flex', justifyContent:'center', gap:18, color:'var(--muted)', fontSize:13, fontFamily:'var(--font-pixel-kr)', letterSpacing:.5, marginBottom:10 }}>
              <span><MapPin size={12} style={{verticalAlign:'middle', marginRight:4}}/> {TICKET_GAME.stadium}</span>
              <span>·</span>
              <span>{TICKET_GAME.date}</span>
            </div>

            <div className="price-row">
              <del>44,000원</del>
              <strong>34,000<span>원</span></strong>
              <span className="save">-23%</span>
            </div>

            <div className="warning">
              <AlertTriangle size={14}/>
              노쇼 시 서비스 이용이 제한될 수 있습니다.
            </div>

            <div className="pay-options">
              <button className={pay === 'dutch' ? 'on' : ''} onClick={() => setPay('dutch')}>
                <Wallet size={12}/> 더치페이
              </button>
              <button className={pay === 'me' ? 'on' : ''} onClick={() => setPay('me')}>
                <CreditCard size={12}/> 내가 결제
              </button>
              <button className={pay === 'them' ? 'on' : ''} onClick={() => setPay('them')}>
                <Send size={12}/> 상대에게 요청
              </button>
            </div>

            <button className="btn btn-primary wide" onClick={() => setDone(true)}>
              <CreditCard size={14}/> 결제하기
            </button>
            <button className="ghost-btn" onClick={onBack}>← 대화창으로 돌아가기</button>
          </div>
        ) : (
          <div className="ticket-done">
            <div className="ic"><CalendarCheck size={32}/></div>
            <h2>★ 결제 완료 데모 ★</h2>
            <p>실제 결제는 연동되지 않았습니다.<br/>{npc.nickname}님과의 직관 약속이 생성되었습니다.</p>
            <div className="result-receipt" style={{ maxWidth:380, margin:'18px auto 6px' }}>
              <div className="row"><span>경기</span><b>{TICKET_GAME.home.team} vs {TICKET_GAME.away.team}</b></div>
              <div className="row"><span>일시</span><b>{TICKET_GAME.date}</b></div>
              <div className="row"><span>결제</span><b>34,000원</b></div>
              <div className="row"><span>방식</span><b>{pay === 'dutch' ? '더치페이' : pay === 'me' ? '내가 결제' : '상대에게 요청'}</b></div>
            </div>
            <button className="btn btn-primary" onClick={onHome} style={{marginTop:14}}>야구장으로 돌아가기</button>
            <button className="ghost-btn" onClick={onBack}>← 대화창으로</button>
          </div>
        )}
      </motion.div>
    </motion.section>
  );
}

/* ============================================================
   CONFETTI
============================================================ */
function Confetti() {
  const pieces = Array.from({ length: 80 }, (_, i) => {
    const colors = ['#d4af37', '#f4d35e', '#10b981', '#34d399', '#fbf3d6', '#f0d97d'];
    const c = colors[i % colors.length];
    const left = Math.random() * 100;
    const delay = Math.random() * 0.8;
    const dur = 2.5 + Math.random() * 1.5;
    const rot = Math.random() * 360;
    return (
      <i key={i} style={{
        left: `${left}%`,
        background: c,
        animationDuration: `${dur}s`,
        animationDelay: `${delay}s`,
        transform: `rotate(${rot}deg)`,
        boxShadow: `0 0 8px ${c}`
      }} />
    );
  });
  return <div className="confetti">{pieces}</div>;
}

createRoot(document.getElementById('root')).render(<App />);
