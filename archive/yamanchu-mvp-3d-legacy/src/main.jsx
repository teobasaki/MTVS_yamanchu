import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import './styles.css';

const CARD_TYPES = {
  steady: {
    title: '꾸준한 2번 타자형',
    color: '#22c55e',
    aura: 'green',
    description: '안정적이고 신뢰감 있는 직관 메이트. 큰 기복 없이 끝까지 함께 응원합니다.',
    traits: ['안정형', '꾸준함', '배려형', '페이스 메이커'],
    matchingTip: '차분하게 오래 대화하는 사람과 잘 맞아요.'
  },
  bullpen: {
    title: '불펜 에이스형',
    color: '#38bdf8',
    aura: 'blue',
    description: '평소엔 차분하지만 위기 상황에서 몰입도가 확 올라가는 타입입니다.',
    traits: ['후반 집중형', '위기 상황 응원', '차분한 대화', '안정적 관계형'],
    matchingTip: '위기 순간에도 끝까지 응원하는 사람과 잘 맞아요.'
  },
  runner: {
    title: '대주자형',
    color: '#f97316',
    aura: 'orange',
    description: '결정적 순간에 먼저 움직이는 액션형 직관 메이트입니다.',
    traits: ['빠른 반응', '장난기', '순간 집중', '실행력'],
    matchingTip: '가볍게 시작해 빠르게 친해지는 사람과 잘 맞아요.'
  },
  cheer: {
    title: '응원단장형',
    color: '#ef4444',
    aura: 'red',
    description: '경기장 분위기를 끌어올리는 에너지 높은 응원 리더입니다.',
    traits: ['분위기 메이커', '응원가 풀버전', '높은 에너지', '표현형'],
    matchingTip: '같이 웃고 크게 리액션하는 사람과 잘 맞아요.'
  },
  ninth: {
    title: '9회말 심장폭격기형',
    color: '#a855f7',
    aura: 'purple',
    description: '극적인 순간에 감정이 크게 살아나는 클러치 감성형입니다.',
    traits: ['극적 몰입', '감정 표현', '클러치 반응', '낭만형'],
    matchingTip: '역전과 끝내기의 낭만을 아는 사람과 잘 맞아요.'
  },
  data: {
    title: '냉정한 데이터 단장형',
    color: '#6366f1',
    aura: 'indigo',
    description: '기록과 흐름을 읽으며 경기를 전략적으로 즐기는 분석형입니다.',
    traits: ['기록 분석', '차분한 판단', '전략형', '관찰형'],
    matchingTip: '경기 후 분석 토크를 좋아하는 사람과 잘 맞아요.'
  },
  clutch: {
    title: '클러치 응원형',
    color: '#facc15',
    aura: 'gold',
    description: '중요한 순간에 응원 텐션이 폭발하는 후반 집중형입니다.',
    traits: ['후반 폭발', '몰입형', '감정 동조', '낙관적 회복'],
    matchingTip: '끝까지 포기하지 않는 사람과 잘 맞아요.'
  }
};

const NPCS = [
  {
    id: 'minji', nickname: '민지', cardKey: 'bullpen', pos: [-4, 0, -6], hiddenKeyword: '불펜',
    answers: ['홈런', '치맥', '삼성'],
    syncPoint: '두 분은 위기 상황에서 끝까지 응원하는 패턴이 비슷합니다.',
    hint: '저는 위기 상황에서 강해지는 타입이에요.'
  },
  {
    id: 'taehyun', nickname: '태현', cardKey: 'cheer', pos: [5, 0, -4], hiddenKeyword: '응원',
    answers: ['홈런', '떡볶이', '다이노스'],
    syncPoint: '두 분은 경기장 분위기를 함께 끌어올리는 에너지가 있습니다.',
    hint: '저는 경기장 분위기를 끌어올리는 걸 좋아해요.'
  },
  {
    id: 'seoyeon', nickname: '서연', cardKey: 'data', pos: [0, 0, -10], hiddenKeyword: '데이터',
    answers: ['삼진', '치맥', '삼성'],
    syncPoint: '두 분은 경기 흐름을 읽고 분석하는 대화 리듬이 잘 맞습니다.',
    hint: '저는 기록과 데이터를 보면서 경기를 보는 편이에요.'
  }
];

function assignCard(answers) {
  const text = answers.join(' ');
  if (text.includes('데이터') || text.includes('분석') || text.includes('경기력') || text.includes('전략형')) return 'data';
  if (text.includes('응원가') || text.includes('치맥') || text.includes('분위기') || text.includes('열정형')) return 'cheer';
  if (text.includes('역전') || text.includes('감정 표현') || text.includes('홈런')) return 'ninth';
  if (text.includes('끝까지 응원') || text.includes('조용히 지켜')) return 'bullpen';
  if (text.includes('장난형') || text.includes('사람')) return 'runner';
  return 'steady';
}

function App() {
  const [step, setStep] = useState('landing');
  const [answers, setAnswers] = useState([]);
  const [cardKey, setCardKey] = useState('bullpen');
  const [selectedNpc, setSelectedNpc] = useState(null);
  const [balanceResult, setBalanceResult] = useState(null);

  const userCard = CARD_TYPES[cardKey];

  const finishQuiz = (quizAnswers) => {
    const key = assignCard(quizAnswers);
    setAnswers(quizAnswers);
    setCardKey(key);
    setStep('reveal');
  };

  const startProfile = (npc) => {
    setSelectedNpc(npc);
    setStep('profile');
  };

  return (
    <div className="app-shell">
      <AnimatePresence mode="wait">
        {step === 'landing' && <Landing key="landing" onStart={() => setStep('quiz')} />}
        {step === 'quiz' && <Quiz key="quiz" onDone={finishQuiz} />}
        {step === 'reveal' && <CardReveal key="reveal" card={userCard} onEnter={() => setStep('world')} />}
        {step === 'world' && <World key="world" userCardKey={cardKey} userCard={userCard} onNpcHit={startProfile} onBack={() => setStep('reveal')} />}
        {step === 'profile' && selectedNpc && <NpcProfile key="profile" npc={selectedNpc} userCard={userCard} onStart={() => setStep('balance')} onClose={() => setStep('world')} />}
        {step === 'balance' && selectedNpc && <BalanceGame key="balance" npc={selectedNpc} onDone={(result) => { setBalanceResult(result); setStep('result'); }} />}
        {step === 'result' && selectedNpc && <MatchResult key="result" npc={selectedNpc} result={balanceResult} onChat={() => setStep('chat')} onRetry={() => setStep('world')} />}
        {step === 'chat' && selectedNpc && <Chat key="chat" npc={selectedNpc} onTicket={() => setStep('ticket')} />}
        {step === 'ticket' && selectedNpc && <TicketMock key="ticket" npc={selectedNpc} onBack={() => setStep('chat')} onHome={() => setStep('world')} />}
      </AnimatePresence>
    </div>
  );
}

function Landing({ onStart }) {
  return <motion.section className="screen landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <div className="stadium-light" />
    <div className="hero-card">
      <div className="eyebrow">DATING SERVICE MVP · DESKTOP DEMO</div>
      <h1>야만추 <span>野慢追</span></h1>
      <h2>야구장에서 만남을 추구하다</h2>
      <p>직관을 매개로 자연스럽게 만나는 야구 기반 소셜 매칭 서비스</p>
      <button className="primary" onClick={onStart}>시연 시작하기</button>
    </div>
  </motion.section>;
}

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
  return <motion.section className="screen quiz" initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -40, opacity: 0 }}>
    <div className="quiz-panel">
      <div className="progress"><div style={{ width: `${((idx + 1) / questions.length) * 100}%` }} /></div>
      <p className="eyebrow">AI 성향 카드 발급 · Rule-based Demo</p>
      <h2>{questions[idx].q}</h2>
      <div className="choice-grid">
        {questions[idx].a.map((c) => <button key={c} onClick={() => pick(c)}>{c}</button>)}
      </div>
    </div>
  </motion.section>;
}

function CardReveal({ card, onEnter }) {
  return <motion.section className="screen reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <div className="particles">{Array.from({ length: 36 }).map((_, i) => <span key={i} style={{ '--i': i }} />)}</div>
    <motion.div className="fifa-card" initial={{ rotateY: 90, scale: .7, opacity: 0 }} animate={{ rotateY: 0, scale: 1, opacity: 1 }} transition={{ duration: 1.2, type: 'spring' }}>
      <div className="card-top">YMC</div>
      <div className="card-avatar">⚾</div>
      <h1>{card.title}</h1>
      <p>{card.description}</p>
      <div className="traits">{card.traits.map(t => <span key={t}>{t}</span>)}</div>
    </motion.div>
    <button className="primary glow" onClick={onEnter}>야구장 입장하기</button>
  </motion.section>;
}

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

  const throwBall = () => {
    const now = performance.now();
    if (cdRef.current.ball > now) return;
    const group = playerRef.current;
    if (!group) return;
    const dir = new THREE.Vector3(0, 0, -1).applyEuler(group.rotation).normalize();
    const pos = group.position.clone().add(new THREE.Vector3(0, 1.2, 0)).add(dir.clone().multiplyScalar(1.0));
    setBalls((prev) => [...prev, { id: crypto.randomUUID(), pos, dir, born: now }]);
    cdRef.current.ball = now + 2000;
    setFeedback('공을 던졌습니다!');
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
      setFeedback(`${hitNpc.nickname}님에게 배트 인사 성공!`);
      setTimeout(() => onNpcHit(hitNpc), 350);
    } else {
      setFeedback('헛스윙! 조금 더 가까이 가보세요.');
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => feedback && setFeedback(''), 1800);
    return () => clearTimeout(timeout);
  }, [feedback]);

  return <motion.section className="screen world-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <Canvas shadows camera={{ position: [0, 5, 8], fov: 60 }}>
      <color attach="background" args={["#07111f"]} />
      <ambientLight intensity={0.65} />
      <directionalLight position={[4, 10, 4]} intensity={1.35} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <Stadium />
      <Player refObj={playerRef} swinging={swinging} />
      <CameraFollow target={playerRef} />
      <NPCGroup refs={npcsRef} userCardKey={userCardKey} />
      <BallProjectiles balls={balls} setBalls={setBalls} npcRefs={npcsRef} onHit={(npc) => { setFeedback(`${npc.nickname}님 명중! 프로필 카드 공개`); setTimeout(() => onNpcHit(npc), 250); }} />
      <NearestTracker playerRef={playerRef} npcRefs={npcsRef} setNearest={setNearest} />
    </Canvas>
    <div className="hud top-left">
      <p>내 카드</p><strong style={{ color: userCard.color }}>{userCard.title}</strong>
      <small>WASD/방향키 이동 · A/D 회전</small>
    </div>
    <div className="hud top-center">야만추 스타디움 · 3D 데스크탑 시연</div>
    <div className="hud bottom-info">{nearest ? `가까운 상대: ${nearest.nickname} · ${CARD_TYPES[nearest.cardKey].title}` : 'NPC를 찾아 공을 던지거나 배트로 인사하세요'}</div>
    {feedback && <div className="toast">{feedback}</div>}
    <div className="action-panel">
      <button onClick={throwBall} disabled={cooldowns.ball > 0}>⚾ 공 던지기 {cooldowns.ball > 0 && `(${cooldowns.ball})`}</button>
      <button onClick={swingBat} disabled={cooldowns.bat > 0}>🏏 배트 휘두르기 {cooldowns.bat > 0 && `(${cooldowns.bat})`}</button>
    </div>
  </motion.section>;
}

function Stadium() {
  return <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[22, 96]} />
      <meshStandardMaterial color="#1f7a3a" roughness={.9} />
    </mesh>
    <mesh position={[0, 0.01, -3]} rotation={[-Math.PI / 2, 0, Math.PI / 4]} receiveShadow>
      <boxGeometry args={[10, 10, .05]} />
      <meshStandardMaterial color="#a06a38" roughness={1} />
    </mesh>
    <mesh position={[0, 0.02, -3]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[1.2, 32]} />
      <meshStandardMaterial color="#c8975f" roughness={1} />
    </mesh>
    {[[0,-8],[-4,-4],[0,0],[4,-4]].map(([x,z], i) => <mesh key={i} position={[x, .04, z]} rotation={[-Math.PI/2,0,Math.PI/4]} receiveShadow>
      <boxGeometry args={[.8,.8,.08]} /><meshStandardMaterial color="#f8fafc" />
    </mesh>)}
    <mesh position={[0, .1, 12]}><boxGeometry args={[18, 3, .4]} /><meshStandardMaterial color="#0f172a" /></mesh>
    <mesh position={[0, 2, 12.25]}><boxGeometry args={[9, 2.4, .3]} /><meshStandardMaterial color="#111827" emissive="#0ea5e9" emissiveIntensity={.2} /></mesh>
    <group position={[0,0,0]}>
      {Array.from({length: 24}).map((_, i) => {
        const angle = (Math.PI * 2 * i)/24;
        const r = 23;
        return <mesh key={i} position={[Math.cos(angle)*r, 1, Math.sin(angle)*r]} rotation={[0, -angle + Math.PI/2, 0]}>
          <boxGeometry args={[3.5,2,1]} /><meshStandardMaterial color={i%2?'#1e3a8a':'#334155'} />
        </mesh>
      })}
    </group>
    <mesh position={[0,1.2,14]}><boxGeometry args={[30,2.2,.4]} /><meshStandardMaterial color="#0f172a" /></mesh>
  </group>
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
  return <group ref={refObj} position={[0,0,4]} rotation={[0, Math.PI, 0]}>
    <CartoonPlayer color="#ef4444" swinging={swinging} isPlayer />
  </group>
}

function CartoonPlayer({ color = '#ef4444', swinging = false, isPlayer = false }) {
  return <group>
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
    {isPlayer && <mesh position={[0,.05,0]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.75,.9,32]} /><meshBasicMaterial color="#facc15" transparent opacity={.45} /></mesh>}
  </group>
}

function NPCGroup({ refs, userCardKey }) {
  return <group>{NPCS.map((npc, i) => <NPCAvatar key={npc.id} npc={npc} idx={i} refs={refs} isSimilar={npc.cardKey === userCardKey} />)}</group>;
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
  return <group ref={group} position={npc.pos}>
    <mesh position={[0,.04,0]} rotation={[-Math.PI/2,0,0]}>
      <ringGeometry args={[.75, isSimilar ? 1.18 : .98, 48]} />
      <meshBasicMaterial color={card.color} transparent opacity={isSimilar ? .95 : .55} />
    </mesh>
    <pointLight color={card.color} intensity={isSimilar ? 2.5 : 1.2} distance={4} position={[0,1.2,0]} />
    <CartoonPlayer color={card.color} />
  </group>
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
  return <group>{balls.map(b => <mesh key={b.id} ref={el => meshRefs.current[b.id] = el} position={b.pos} castShadow>
    <sphereGeometry args={[.16,16,16]} /><meshStandardMaterial color="#ffffff" />
  </mesh>)}</group>;
}

function NearestTracker({ playerRef, npcRefs, setNearest }) {
  useFrame(() => {
    const p = playerRef.current; if (!p) return;
    let best = null, bestD = Infinity;
    NPCS.forEach(npc => { const obj = npcRefs.current[npc.id]; if (!obj) return; const d = obj.position.distanceTo(p.position); if (d < bestD) { bestD = d; best = npc; }});
    setNearest(bestD < 8 ? best : null);
  });
  return null;
}

function NpcProfile({ npc, userCard, onStart, onClose }) {
  const card = CARD_TYPES[npc.cardKey];
  return <motion.section className="screen modal-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <div className="profile-modal">
      <button className="close" onClick={onClose}>×</button>
      <div className="mini-card" style={{ borderColor: card.color, boxShadow: `0 0 30px ${card.color}55` }}>
        <div className="avatar-round" style={{ background: card.color }}>⚾</div>
        <h2>{npc.nickname}</h2>
        <h3 style={{ color: card.color }}>{card.title}</h3>
        <p>{card.description}</p>
        <div className="traits">{card.traits.map(t => <span key={t}>{t}</span>)}</div>
        <div className="sync-box"><strong>나와의 동조 포인트</strong><br />{npc.syncPoint}</div>
        <button className="primary" onClick={onStart}>밸런스 게임 시작</button>
      </div>
    </div>
  </motion.section>
}

function BalanceGame({ npc, onDone }) {
  const qs = [
    { q: '홈런 vs 삼진', opts: ['홈런','삼진'] },
    { q: '치맥 vs 떡볶이', opts: ['치맥','떡볶이'] },
    { q: '삼성 vs 다이노스', opts: ['삼성','다이노스'] }
  ];
  const [idx, setIdx] = useState(0); const [answers, setAnswers] = useState([]); const [time, setTime] = useState(3);
  useEffect(() => { setTime(3); const timer = setInterval(() => setTime(t => t - 1), 1000); return () => clearInterval(timer); }, [idx]);
  useEffect(() => { if (time <= 0) pick(null); }, [time]);
  const pick = (choice) => {
    const next = [...answers, choice || '무응답'];
    if (idx === qs.length - 1) {
      const match = next.reduce((acc, a, i) => acc + (a === npc.answers[i] ? 1 : 0), 0);
      const sync = match === 3 ? 92 : match === 2 ? 78 : match === 1 ? 48 : 25;
      onDone({ answers: next, match, sync });
    } else { setAnswers(next); setIdx(idx + 1); }
  };
  return <motion.section className="screen balance" initial={{ opacity: 0, scale: .98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
    <div className="game-panel">
      <div className="timer">{time}</div>
      <p className="eyebrow">{npc.nickname}님과 밸런스 게임</p>
      <h2>{qs[idx].q}</h2>
      <div className="versus-row">{qs[idx].opts.map(o => <button key={o} onClick={() => pick(o)}>{o}</button>)}</div>
      <small>상대의 선택은 자동으로 공개됩니다 · 3초 제한</small>
    </div>
  </motion.section>
}

function MatchResult({ npc, result, onChat, onRetry }) {
  const success = result?.match >= 2;
  return <motion.section className="screen result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <div className="result-card">
      <h1>{success ? '친구 추가 성공!' : '아직은 어색한 직관 메이트'}</h1>
      <div className="score">{result?.sync}%</div>
      <p>{success ? `${npc.nickname}님과 감정 동조율이 높습니다.` : '조금 더 잘 맞는 직관 메이트를 찾아볼까요?'}</p>
      <p className="sub">일치 문항: {result?.match}/3</p>
      {success ? <button className="primary" onClick={onChat}>메시지 보내기</button> : <button className="primary" onClick={onRetry}>야구장으로 돌아가기</button>}
    </div>
  </motion.section>
}

function Chat({ npc, onTicket }) {
  const [messages, setMessages] = useState([
    { from: 'system', text: '스무고개 모드가 시작되었습니다. 상대의 숨겨진 성향 키워드를 맞춰보세요.' },
    { from: npc.nickname, text: npc.hint }
  ]);
  const [input, setInput] = useState(''); const [solved, setSolved] = useState(false);
  const send = () => {
    if (!input.trim()) return;
    const val = input.trim(); const ok = val.includes(npc.hiddenKeyword);
    setMessages(prev => [...prev, { from: '나', text: val }, ok ? { from: 'system', text: `정답입니다! ${npc.nickname}님의 숨겨진 키워드는 “${npc.hiddenKeyword}”입니다.` } : { from: npc.nickname, text: '오, 비슷해요. 힌트를 한 번 더 생각해보세요!' }]);
    if (ok) setSolved(true); setInput('');
  };
  return <motion.section className="screen chat-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <div className="chat-box">
      <h2>{npc.nickname}님과의 대화</h2>
      <div className="messages">{messages.map((m,i) => <div key={i} className={`msg ${m.from === '나' ? 'me' : m.from === 'system' ? 'system' : 'them'}`}><b>{m.from}</b><span>{m.text}</span></div>)}</div>
      <div className="chat-input"><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') send(); }} placeholder={`키워드를 입력해보세요. 예: ${npc.hiddenKeyword}`} /><button onClick={send}>전송</button></div>
      {solved && <button className="primary wide" onClick={onTicket}>나랑 직관 갈래?</button>}
    </div>
  </motion.section>
}

function TicketMock({ npc, onBack, onHome }) {
  const [done, setDone] = useState(false);
  return <motion.section className="screen ticket" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <div className="ticket-card">
      <h1>야만추 X KBO 제휴 할인 티켓</h1>
      {!done ? <>
        <h2>{npc.nickname}님과 2인 직관 패키지</h2>
        <div className="price"><span>정가 44,000원</span><strong>할인가 34,000원</strong></div>
        <p className="warning">노쇼 시 서비스 이용이 제한될 수 있습니다.</p>
        <div className="pay-options"><button>더치페이</button><button>내가 결제하기</button><button>상대에게 요청하기</button></div>
        <button className="primary wide" onClick={() => setDone(true)}>결제하기</button>
      </> : <>
        <div className="done">✅</div><h2>결제 완료 데모입니다.</h2><p>실제 결제는 연동되지 않았습니다. {npc.nickname}님과의 직관 약속이 생성되었습니다.</p>
        <button className="primary" onClick={onHome}>야구장으로 돌아가기</button>
      </>}
      <button className="ghost" onClick={onBack}>대화창으로 돌아가기</button>
    </div>
  </motion.section>
}

createRoot(document.getElementById('root')).render(<App />);
