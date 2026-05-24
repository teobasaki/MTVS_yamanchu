import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas, useFrame } from '@react-three/fiber';
import './styles.css';

// =========================================================
// Timeline
// =========================================================
const TIMELINE = [
  { id: 0, time: '7회말 1아웃', title: '경기 재개', commentary: '삼성 3 : 4 NC. 응원석 분위기가 다시 달아오릅니다.', type: 'normal' },
  { id: 1, time: '8회초', title: '투수 교체로 경기 지연', commentary: '잠시 루즈한 구간입니다. 이런 순간의 이모티콘 반응도 성향 데이터가 됩니다.', type: 'bored' },
  { id: 2, time: '8회말', title: '응원 파도타기 시작', commentary: '3루 관중석부터 파도타기가 넘어옵니다. 타이밍에 맞춰 점프하세요!', type: 'wave' },
  { id: 3, time: '9회말 2아웃', title: '4번 타자 이민석 등장', commentary: '주자 1, 2루. 이민석이 타석에 들어섭니다. 결과를 예측해보세요.', type: 'bet' },
  { id: 4, time: '9회말', title: '이민석 홈런', commentary: '이민석이 강하게 받아칩니다! 공이 외야를 넘어갑니다!', type: 'homerun' },
  { id: 5, time: '경기 종료', title: '직관 데이터 분석', commentary: '오늘의 반응, 응원, 배팅, 채팅 리듬을 바탕으로 성향 카드가 업데이트됩니다.', type: 'report' },
];

const TEAM_CHAT_POOL = [
  { team: 'samsung', msg: '오늘 이민석 스윙 괜찮은데?' },
  { team: 'nc', msg: '여기서 막으면 진짜 끝난다' },
  { team: 'samsung', msg: '응원봉 흔들자!!!' },
  { team: 'system', msg: '현재 응원 열기 83%' },
  { team: 'samsung', msg: '홈런 하나만 제발' },
  { team: 'nc', msg: '불펜 진짜 잘 던진다 ㄷㄷ' },
  { team: 'samsung', msg: '이민석 믿는다' },
  { team: 'nc', msg: '여기 잡으면 우리 승' },
  { team: 'samsung', msg: '아 심장 떨려' },
  { team: 'system', msg: '관중 12,847명 동시 응원 중' },
  { team: 'samsung', msg: '오늘 직관 온 보람이 있다' },
  { team: 'nc', msg: '치킨 시켰는데 안 와ㅠ' },
  { team: 'samsung', msg: 'ㅋㅋㅋ 분위기 미쳤다' },
  { team: 'nc', msg: '집중 집중!' },
  { team: 'samsung', msg: '오늘 9회말 뭔가 다르다' },
  { team: 'system', msg: '응원 동조율 91%' },
];

// =========================================================
// Error Boundary
// =========================================================
class ThreeErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err) {
    console.error('Three.js error:', err);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// =========================================================
// 3D 경기장 (React Three Fiber)
// =========================================================
function BaseballField({ homerunStage }) {
  // homerunStage: 0 idle, 1 pitch, 2 swing, 3 flash, 4 ball-up, 5 done
  const ballRef = useRef();
  const batRef = useRef();
  const tRef = useRef(0);

  useFrame((state, delta) => {
    tRef.current += delta;
    const t = tRef.current;

    // 공 위치 애니메이션
    if (ballRef.current) {
      if (homerunStage === 0) {
        // idle - 마운드 위
        ballRef.current.position.set(0, 1.2, -2);
      } else if (homerunStage === 1) {
        // pitch - 마운드에서 홈으로
        const p = Math.min(1, (t % 1.2) / 0.7);
        ballRef.current.position.set(0, 1.2 - p * 0.4, -2 + p * 3.5);
      } else if (homerunStage === 2) {
        // swing 직전, 홈플레이트 근처
        ballRef.current.position.set(0, 0.9, 1.3);
      } else if (homerunStage === 3) {
        // flash - 공이 살짝 튀어오름
        ballRef.current.position.set(0, 1.5, 2);
      } else if (homerunStage === 4) {
        // ball up - 화면 앞으로, 위로 상승
        const p = Math.min(1, (t % 2) / 1.0);
        ballRef.current.position.set(0, 1.5 + p * 6, 2 + p * 5);
        ballRef.current.scale.setScalar(1 + p * 2.5);
      } else if (homerunStage === 5) {
        // done - 멀리 사라짐
        ballRef.current.position.set(0, 12, 10);
        ballRef.current.scale.setScalar(0.5);
      }
      ballRef.current.rotation.x += delta * 8;
      ballRef.current.rotation.y += delta * 6;
    }

    // 배트 스윙 애니메이션
    if (batRef.current) {
      if (homerunStage >= 2 && homerunStage <= 4) {
        const p = Math.min(1, (homerunStage - 2) / 2);
        batRef.current.rotation.z = -Math.PI / 4 + p * Math.PI * 1.2;
      } else if (homerunStage === 5) {
        batRef.current.rotation.z = Math.PI * 0.7;
      } else {
        batRef.current.rotation.z = -Math.PI / 4;
      }
    }
  });

  return (
    <>
      {/* 조명 */}
      <ambientLight intensity={0.55} />
      <directionalLight position={[8, 12, 8]} intensity={0.9} castShadow />
      <directionalLight position={[-8, 10, -4]} intensity={0.35} color="#88aaff" />

      {/* 그라운드 (잔디) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 30]} />
        <meshStandardMaterial color="#2d6a4f" />
      </mesh>

      {/* 인필드 흙 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[5.5, 32]} />
        <meshStandardMaterial color="#a0522d" />
      </mesh>

      {/* 외야 펜스 (호 형태로 박스 여러 개) */}
      {Array.from({ length: 24 }).map((_, i) => {
        const ang = (i / 24) * Math.PI - Math.PI;
        const r = 14;
        const x = Math.cos(ang) * r;
        const z = Math.sin(ang) * r;
        return (
          <mesh key={i} position={[x, 1.2, z]}>
            <boxGeometry args={[1.5, 2.4, 0.3]} />
            <meshStandardMaterial color="#1b3a2c" />
          </mesh>
        );
      })}

      {/* 마운드 */}
      <mesh position={[0, 0.15, -2]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.2, 24]} />
        <meshStandardMaterial color="#c8895a" />
      </mesh>
      <mesh position={[0, 0.25, -2]}>
        <cylinderGeometry args={[0.7, 1.0, 0.3, 24]} />
        <meshStandardMaterial color="#b87a4a" />
      </mesh>

      {/* 홈플레이트 */}
      <mesh position={[0, 0.05, 1.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <boxGeometry args={[0.6, 0.6, 0.01]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* 베이스 1루 / 2루 / 3루 */}
      <mesh position={[3.5, 0.07, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 4]}>
        <boxGeometry args={[0.5, 0.5, 0.02]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 0.07, -3.5]} rotation={[-Math.PI / 2, 0, Math.PI / 4]}>
        <boxGeometry args={[0.5, 0.5, 0.02]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-3.5, 0.07, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 4]}>
        <boxGeometry args={[0.5, 0.5, 0.02]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* 투수 */}
      <group position={[0, 0, -2]}>
        {/* 몸통 */}
        <mesh position={[0, 1.0, 0]}>
          <boxGeometry args={[0.7, 1.0, 0.4]} />
          <meshStandardMaterial color="#3a5a7f" />
        </mesh>
        {/* 머리 */}
        <mesh position={[0, 1.75, 0]}>
          <sphereGeometry args={[0.28, 16, 16]} />
          <meshStandardMaterial color="#f1c27d" />
        </mesh>
        {/* 모자 */}
        <mesh position={[0, 1.95, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.15, 16]} />
          <meshStandardMaterial color="#1a3a5a" />
        </mesh>
        {/* 다리 */}
        <mesh position={[-0.2, 0.3, 0]}>
          <boxGeometry args={[0.22, 0.7, 0.22]} />
          <meshStandardMaterial color="#1a2a3a" />
        </mesh>
        <mesh position={[0.2, 0.3, 0]}>
          <boxGeometry args={[0.22, 0.7, 0.22]} />
          <meshStandardMaterial color="#1a2a3a" />
        </mesh>
      </group>

      {/* 타자 이민석 */}
      <group position={[-0.6, 0, 1.5]}>
        {/* 몸통 */}
        <mesh position={[0, 1.0, 0]}>
          <boxGeometry args={[0.7, 1.0, 0.4]} />
          <meshStandardMaterial color="#c41e3a" />
        </mesh>
        {/* 머리 */}
        <mesh position={[0, 1.75, 0]}>
          <sphereGeometry args={[0.28, 16, 16]} />
          <meshStandardMaterial color="#f1c27d" />
        </mesh>
        {/* 헬멧 */}
        <mesh position={[0, 1.95, 0]}>
          <sphereGeometry args={[0.32, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#1a3a5a" metalness={0.4} roughness={0.4} />
        </mesh>
        {/* 다리 */}
        <mesh position={[-0.2, 0.3, 0]}>
          <boxGeometry args={[0.22, 0.7, 0.22]} />
          <meshStandardMaterial color="#1a2a3a" />
        </mesh>
        <mesh position={[0.2, 0.3, 0]}>
          <boxGeometry args={[0.22, 0.7, 0.22]} />
          <meshStandardMaterial color="#1a2a3a" />
        </mesh>
        {/* 배트 - 회전축이 어깨에 오도록 group 사용 */}
        <group position={[0.35, 1.3, 0]}>
          <mesh ref={batRef} position={[0.5, 0, 0]} rotation={[0, 0, -Math.PI / 4]}>
            <cylinderGeometry args={[0.05, 0.07, 1.1, 12]} />
            <meshStandardMaterial color="#8b4513" />
          </mesh>
        </group>
      </group>

      {/* 포수 */}
      <group position={[0.5, 0, 2.5]}>
        <mesh position={[0, 0.7, 0]}>
          <boxGeometry args={[0.75, 0.8, 0.4]} />
          <meshStandardMaterial color="#1a3a5a" />
        </mesh>
        <mesh position={[0, 1.4, 0]}>
          <sphereGeometry args={[0.28, 16, 16]} />
          <meshStandardMaterial color="#f1c27d" />
        </mesh>
        {/* 캐처 마스크 */}
        <mesh position={[0, 1.4, 0.22]}>
          <boxGeometry args={[0.35, 0.35, 0.05]} />
          <meshStandardMaterial color="#222222" />
        </mesh>
        <mesh position={[-0.15, 0.25, 0]}>
          <boxGeometry args={[0.22, 0.5, 0.22]} />
          <meshStandardMaterial color="#1a2a3a" />
        </mesh>
        <mesh position={[0.15, 0.25, 0]}>
          <boxGeometry args={[0.22, 0.5, 0.22]} />
          <meshStandardMaterial color="#1a2a3a" />
        </mesh>
      </group>

      {/* 야구공 */}
      <mesh ref={ballRef} position={[0, 1.2, -2]} castShadow>
        <sphereGeometry args={[0.15, 20, 20]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive={homerunStage >= 3 ? '#ffeb3b' : '#000000'}
          emissiveIntensity={homerunStage >= 3 ? 0.8 : 0}
        />
      </mesh>

      {/* 전광판 */}
      <group position={[0, 6, -13]}>
        <mesh>
          <boxGeometry args={[8, 3, 0.4]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>
        <mesh position={[0, 0, 0.21]}>
          <planeGeometry args={[7.6, 2.6]} />
          <meshStandardMaterial color="#1a1a1a" emissive="#ff3030" emissiveIntensity={0.4} />
        </mesh>
      </group>

      {/* 플래시 효과 (타격 순간) */}
      {homerunStage === 3 && (
        <pointLight position={[-0.6, 1.3, 1.5]} intensity={4} distance={6} color="#ffeb3b" />
      )}
    </>
  );
}

function BaseballScene({ homerunStage }) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 3.5, 8], fov: 48 }}
      gl={{ antialias: true, alpha: false }}
      onCreated={({ gl, camera }) => {
        gl.setClearColor('#0b1828');
        camera.lookAt(0, 0.8, -1);
      }}
    >
      <Suspense fallback={null}>
        <fog attach="fog" args={['#0b1828', 12, 28]} />
        <BaseballField homerunStage={homerunStage} />
      </Suspense>
    </Canvas>
  );
}

// =========================================================
// Fallback 화면 (Three 실패시)
// =========================================================
function FieldFallback({ homerunStage }) {
  return (
    <div className="field-fallback">
      <div className="ff-sky">
        <div className="ff-stadium">
          <div className="ff-board">
            <div className="ff-board-row">SAMSUNG 3 : 4 NC</div>
            <div className="ff-board-row small">9회말 2아웃</div>
          </div>
          <div className="ff-field">
            <div className="ff-diamond"></div>
            <div className="ff-mound"></div>
            <div className={`ff-player ff-pitcher`}>🧢</div>
            <div className={`ff-player ff-batter ${homerunStage >= 2 ? 'swing' : ''}`}>🏏</div>
            <div className={`ff-player ff-catcher`}>🧤</div>
            <div className={`ff-ball ff-ball-stage-${homerunStage}`}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================
// 응원석 화면 (CSS)
// =========================================================
function Stands({ myJump, minjiJump, waveJumps }) {
  return (
    <div className="stands">
      <div className="stands-bg">
        <div className="stands-view">
          {/* 앞좌석 관중 (파도타기 대상) */}
          <div className="row row-front">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className={`crowd crowd-front ${waveJumps[i] ? 'jump' : ''}`}>
                <div className="crowd-head" style={{ background: ['#e63946', '#f4a261', '#2a9d8f', '#e76f51', '#264653'][i] }}></div>
                <div className="crowd-body" style={{ background: ['#c1121f', '#e76f51', '#1d7874', '#bc4749', '#1d3557'][i] }}></div>
                <div className="crowd-stick"></div>
              </div>
            ))}
          </div>

          {/* 내 자리 줄 (가운데 큰) */}
          <div className="row row-me">
            {/* 좌측 관중 */}
            <div className="crowd crowd-side">
              <div className="crowd-head" style={{ background: '#f4a261' }}></div>
              <div className="crowd-body" style={{ background: '#bc6c25' }}></div>
            </div>

            {/* 내 캐릭터 (유꾸 골드) */}
            <div className={`me-character ${myJump ? 'jump' : ''}`}>
              <div className="me-stick"></div>
              <div className="me-hat"></div>
              <div className="me-head"></div>
              <div className="me-body">
                <div className="me-pattern"></div>
                <div className="me-medal">★</div>
              </div>
              <div className="me-tag">YOU · 유꾸</div>
            </div>

            {/* 민지 (블루) */}
            <div className={`minji-character ${minjiJump ? 'jump' : ''}`}>
              <div className="minji-stick"></div>
              <div className="minji-hair"></div>
              <div className="minji-head"></div>
              <div className="minji-body">
                <div className="minji-number">07</div>
              </div>
              <div className="minji-tag">민지 · 불펜 에이스형</div>
            </div>

            {/* 우측 관중 */}
            <div className="crowd crowd-side">
              <div className="crowd-head" style={{ background: '#2a9d8f' }}></div>
              <div className="crowd-body" style={{ background: '#264653' }}></div>
            </div>
          </div>

          {/* 좌석 줄 시각화 */}
          <div className="seat-bar"></div>
        </div>
      </div>
    </div>
  );
}

// =========================================================
// 메인 App
// =========================================================
function App() {
  const [timelineIdx, setTimelineIdx] = useState(0);
  const [phase, setPhase] = useState('game'); // game | report | postgame | pubs | done

  const score = useMemo(() => (timelineIdx >= 4 ? { home: 6, away: 4 } : { home: 3, away: 4 }), [timelineIdx]);

  // 캐릭터 점프
  const [myJump, setMyJump] = useState(false);
  const [minjiJump, setMinjiJump] = useState(false);
  const [waveJumps, setWaveJumps] = useState([false, false, false, false, false]);
  const [waveSuccess, setWaveSuccess] = useState(false);
  const [waveParticipated, setWaveParticipated] = useState(false);

  // 이모티콘
  const [emojiCounts, setEmojiCounts] = useState({ sleep: 0, meme: 0, cheer: 0, fire: 0 });
  const totalEmoji = emojiCounts.sleep + emojiCounts.meme + emojiCounts.cheer + emojiCounts.fire;

  // 채팅
  const [chatMessages, setChatMessages] = useState([
    { from: 'minji', text: '오늘 직관 진짜 오랜만이에요 ㅎㅎ' },
    { from: 'me', text: '저도요. 이민석 폼 어때 보여요?' },
    { from: 'minji', text: '스윙 타이밍 좋아 보이는데요?' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatCount, setChatCount] = useState(0);
  const chatRef = useRef(null);

  // 팀 라이브 토크
  const [teamChat, setTeamChat] = useState(TEAM_CHAT_POOL.slice(0, 5));
  const teamChatRef = useRef(null);

  // 배팅
  const [betChoice, setBetChoice] = useState(null);
  const [betPlaced, setBetPlaced] = useState(false);
  const [points, setPoints] = useState(10000);
  const [showBetModal, setShowBetModal] = useState(false);

  // 홈런 연출
  const [homerunStage, setHomerunStage] = useState(0);
  const [showHomerunOverlay, setShowHomerunOverlay] = useState(false);
  const [showBettingResult, setShowBettingResult] = useState(false);

  // 결제 / 펍
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPub, setSelectedPub] = useState(null);
  const [showCardTypes, setShowCardTypes] = useState(null);
  const [paymentDone, setPaymentDone] = useState(false);

  // 간맥콜
  const [gnaaemkSent, setGnaaemkSent] = useState(false);
  const [minjiOk, setMinjiOk] = useState(false);

  const current = TIMELINE[timelineIdx];

  // 팀 라이브 토크 자동 진행
  useEffect(() => {
    const t = setInterval(() => {
      setTeamChat((prev) => {
        const next = TEAM_CHAT_POOL[Math.floor(Math.random() * TEAM_CHAT_POOL.length)];
        const arr = [...prev, next];
        if (arr.length > 30) arr.shift();
        return arr;
      });
    }, 2200);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (teamChatRef.current) teamChatRef.current.scrollTop = teamChatRef.current.scrollHeight;
  }, [teamChat]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chatMessages]);

  // bet 단계 진입 시 모달
  useEffect(() => {
    if (current.type === 'bet' && !betPlaced) {
      setShowBetModal(true);
    }
    if (current.type === 'report') {
      setPhase('report');
    }
  }, [timelineIdx]);

  // 핸들러
  const nextTimeline = () => {
    if (timelineIdx < TIMELINE.length - 1) {
      // bet 단계에서는 배팅 후에만 진행
      if (current.type === 'bet' && !betPlaced) {
        setShowBetModal(true);
        return;
      }
      setTimelineIdx(timelineIdx + 1);
    }
  };

  const emojiClick = (key) => {
    setEmojiCounts((prev) => ({ ...prev, [key]: prev[key] + 1 }));
  };

  const doWaveJump = () => {
    setWaveParticipated(true);
    setMyJump(true);
    setMinjiJump(true);
    [0, 1, 2, 3, 4].forEach((i) => {
      setTimeout(() => setWaveJumps((p) => { const a = [...p]; a[i] = true; return a; }), i * 120);
      setTimeout(() => setWaveJumps((p) => { const a = [...p]; a[i] = false; return a; }), i * 120 + 500);
    });
    setTimeout(() => setMyJump(false), 600);
    setTimeout(() => setMinjiJump(false), 700);
    setTimeout(() => setWaveSuccess(true), 800);
  };

  const sendChat = () => {
    const text = chatInput.trim();
    if (!text) return;
    setChatMessages((p) => [...p, { from: 'me', text }]);
    setChatInput('');
    setChatCount((c) => c + 1);
    setTimeout(() => {
      let reply = '저도 그렇게 생각해요 ㅋㅋ 지금 흐름 좋아요.';
      if (text.includes('간맥') || text.includes('맥주')) reply = '좋아요. 경기 끝나고 근처 야구펍 가요!';
      else if (text.includes('홈런')) reply = '저도요 ㅋㅋ 오늘 스윙 타이밍 좋아 보여요.';
      else if (text.includes('지루')) reply = 'ㅋㅋㅋ 투수 교체 너무 오래 걸리네요.';
      setChatMessages((p) => [...p, { from: 'minji', text: reply }]);
    }, 900);
  };

  const placeBet = () => {
    setBetPlaced(true);
    setPoints(0);
    setShowBetModal(false);
    runHomerunSequence();
  };

  const runHomerunSequence = () => {
    setShowHomerunOverlay(true);
    setHomerunStage(1);
    setTimeout(() => setHomerunStage(2), 700);
    setTimeout(() => setHomerunStage(3), 1100);
    setTimeout(() => setHomerunStage(4), 1400);
    setTimeout(() => {
      setHomerunStage(5);
      setMyJump(true);
      setMinjiJump(true);
      setTimeout(() => setMyJump(false), 600);
      setTimeout(() => setMinjiJump(false), 700);
      setPoints(20000);
      setTimelineIdx(4);
    }, 2600);
    setTimeout(() => {
      setShowHomerunOverlay(false);
      setShowBettingResult(true);
    }, 4500);
  };

  const sendGnaaemk = () => {
    setGnaaemkSent(true);
    setTimeout(() => setMinjiOk(true), 1200);
  };

  // ========== 리포트 데이터 ==========
  const report = useMemo(() => {
    const sync = waveParticipated ? 87 : 62;
    return {
      reaction: waveParticipated
        ? '홈런/파도타기 상황에서 평균 1.2초 안에 반응했습니다.'
        : '주요 상황 반응 속도가 평균보다 느렸습니다.',
      wave: waveParticipated
        ? '민지와 거의 같은 타이밍에 점프했습니다. 응원 동조율 +18'
        : '응원 파도타기에 참여하지 않았습니다.',
      emoji: totalEmoji >= 3
        ? `경기 지연 구간에서 이모티콘 반응이 ${totalEmoji}회 있었습니다. 즉각 자극 반응형 성향이 강화되었습니다.`
        : '경기 지연 구간에서 차분한 편이었습니다.',
      bet: betPlaced
        ? '이민석 홈런을 예측했고, 10,000P를 20,000P로 더블 적립했습니다.'
        : '예측 배팅에 참여하지 않았습니다.',
      chat: chatCount >= 1
        ? `경기 흐름에 맞춰 민지와 짧고 빠른 대화를 ${chatCount + 3}회 주고받았습니다.`
        : '민지와의 채팅이 거의 없었습니다.',
      sync: `${sync}% — 응원 타이밍과 경기 몰입 구간이 유사합니다.`,
      syncValue: sync,
    };
  }, [waveParticipated, totalEmoji, betPlaced, chatCount]);

  // ========== 펍 데이터 ==========
  const PUBS = [
    {
      id: 'pub1',
      name: '잠실 야구호프 1호점',
      walk: '도보 6분',
      price: { orig: 28000, sale: 22000, label: '2인 간맥 세트' },
      tags: ['삼성팬 많음', '가벼운 후토크', '치킨+생맥'],
      attendees: [
        { type: '불펜 에이스형', count: 5 },
        { type: '클러치 응원형', count: 4 },
        { type: '응원단장형', count: 7 },
      ],
    },
    {
      id: 'pub2',
      name: '라이온즈 블루펍',
      walk: '도보 9분',
      price: { orig: 36000, sale: 29000, label: '직관 커플 플래터' },
      tags: ['응원가 가능', '스크린 중계', '커플석'],
      attendees: [
        { type: '클러치 응원형', count: 6 },
        { type: '꾸준한 2번 타자형', count: 3 },
        { type: '대주자형', count: 4 },
      ],
    },
    {
      id: 'pub3',
      name: '끝내기 간맥집',
      walk: '도보 4분',
      price: { orig: 24000, sale: 18000, label: '맥주 2잔 + 안주 1개' },
      tags: ['조용한 대화', '라이트 팬 추천', '할인율 높음'],
      attendees: [
        { type: '불펜 에이스형', count: 3 },
        { type: '클러치 응원형', count: 2 },
        { type: '꾸준한 2번 타자형', count: 5 },
      ],
    },
  ];

  // ========== 렌더 ==========
  return (
    <div className="app">
      {/* 헤더 */}
      <header className="header">
        <div className="brand">
          <div className="brand-logo">
            <span className="brand-name">야만추</span>
            <span className="brand-hanja">野慢追</span>
          </div>
          <div className="brand-sub">직관 응원석 데모</div>
        </div>
        <div className="header-center">
          <button className="next-btn" onClick={nextTimeline} disabled={phase !== 'game'}>
            다음 상황 →
          </button>
        </div>
        <div className="scoreboard">
          <div className="sb-team">
            <span className="sb-name">SAMSUNG</span>
            <span className="sb-score">{score.home}</span>
          </div>
          <span className="sb-vs">:</span>
          <div className="sb-team">
            <span className="sb-score">{score.away}</span>
            <span className="sb-name">NC</span>
          </div>
          <div className="sb-inning">{current.time}</div>
        </div>
      </header>

      {/* 메인 그리드 */}
      <main className="main-grid">
        {/* 왼쪽 메인 영역 */}
        <section className="left-col">
          {/* 상단: 메인 경기 화면 */}
          <div className="field-area">
            <ThreeErrorBoundary fallback={<FieldFallback homerunStage={homerunStage} />}>
              <BaseballScene homerunStage={homerunStage} />
            </ThreeErrorBoundary>

            {/* 경기 화면 위 정보 오버레이 */}
            <div className="field-overlay-top">
              <div className="commentary-badge">
                <span className="cb-time">{current.time}</span>
                <span className="cb-title">{current.title}</span>
              </div>
            </div>
            <div className="field-overlay-bottom">
              <div className="commentary-text">{current.commentary}</div>
            </div>

            {/* 홈런 연출 오버레이 */}
            {showHomerunOverlay && (
              <div className="homerun-overlay">
                {homerunStage >= 3 && (
                  <div className="homerun-flash"></div>
                )}
                {homerunStage >= 4 && (
                  <>
                    <div className="homerun-text">이민석 홈런!</div>
                    <div className="homerun-sub">정답 빵빠레! 🎉</div>
                  </>
                )}
                {homerunStage === 5 && (
                  <div className="homerun-points">10,000P → 20,000P 더블 적립</div>
                )}
              </div>
            )}
          </div>

          {/* 액션 영역 */}
          <div className="action-area">
            {current.type === 'normal' && (
              <div className="action-msg">
                <span className="dot"></span>
                경기 진행 중 · 응원과 채팅으로 분위기를 즐겨보세요
              </div>
            )}

            {current.type === 'bored' && (
              <div className="emoji-panel">
                <div className="ep-title">
                  😴 경기 지연 중 — 지금 기분은?
                  <span className="ep-count">반응 {totalEmoji}회</span>
                </div>
                <div className="ep-buttons">
                  <button onClick={() => emojiClick('sleep')}>😴 지루해 <b>{emojiCounts.sleep}</b></button>
                  <button onClick={() => emojiClick('meme')}>😂 밈 보내기 <b>{emojiCounts.meme}</b></button>
                  <button onClick={() => emojiClick('cheer')}>📣 응원봉 <b>{emojiCounts.cheer}</b></button>
                  <button onClick={() => emojiClick('fire')}>🔥 가보자 <b>{emojiCounts.fire}</b></button>
                </div>
              </div>
            )}

            {current.type === 'wave' && (
              <div className="wave-panel">
                <div className="wp-title">🌊 응원 파도타기가 왔습니다! 타이밍에 맞춰 점프하세요</div>
                <div className="wp-actions">
                  <button className="jump-btn" onClick={doWaveJump} disabled={waveSuccess}>
                    {waveSuccess ? '✓ 성공!' : '점프! 🦘'}
                  </button>
                  {waveSuccess && (
                    <div className="wp-success">
                      파도타기 성공! 민지와 같은 타이밍에 점프했습니다. <b>응원 동조율 +18</b>
                    </div>
                  )}
                </div>
              </div>
            )}

            {current.type === 'bet' && betPlaced && (
              <div className="action-msg success">
                ✓ 홈런 배팅 완료 — 10,000P 베팅. 결과를 지켜보세요!
              </div>
            )}

            {current.type === 'homerun' && (
              <div className="action-msg success">
                🎯 적중! 다음으로 진행해서 결과 분석을 확인하세요
              </div>
            )}
          </div>

          {/* 하단: 응원석 */}
          <Stands myJump={myJump} minjiJump={minjiJump} waveJumps={waveJumps} />
        </section>

        {/* 오른쪽 사이드바 */}
        <aside className="right-col">
          {/* 유꾸 미니 카드 */}
          <div className="yukku-card">
            <div className="yk-head">
              <span className="yk-label">MY 유꾸</span>
              <span className="yk-tier">★ GOLD</span>
            </div>
            <div className="yk-body">
              <div className="yk-avatar">
                <div className="yk-avatar-hat"></div>
                <div className="yk-avatar-head"></div>
                <div className="yk-avatar-body"></div>
              </div>
              <div className="yk-info">
                <div className="yk-name">꾸준한 2번 타자형</div>
                <div className="yk-points">💎 {points.toLocaleString()}P</div>
                <div className="yk-items">베르사체 유니폼 · 골드 응원봉</div>
              </div>
            </div>
          </div>

          {/* 팀 라이브 토크 */}
          <div className="team-chat">
            <div className="tc-head">
              <span className="tc-title">⚡ 팀별 라이브 토크</span>
              <span className="tc-live"><span className="live-dot"></span>LIVE</span>
            </div>
            <div className="tc-body" ref={teamChatRef}>
              {teamChat.map((m, i) => (
                <div key={i} className={`tc-msg tc-${m.team}`}>
                  <span className="tc-tag">
                    {m.team === 'samsung' ? '[삼성팬]' : m.team === 'nc' ? '[NC팬]' : '[야만추]'}
                  </span>
                  <span className="tc-text">{m.msg}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 민지 채팅 */}
          <div className="minji-chat">
            <div className="mc-head">
              <div className="mc-avatar"></div>
              <div className="mc-info">
                <div className="mc-name">민지</div>
                <div className="mc-status">옆자리 · 불펜 에이스형 · online</div>
              </div>
            </div>
            <div className="mc-body" ref={chatRef}>
              {chatMessages.map((m, i) => (
                <div key={i} className={`mc-msg mc-${m.from}`}>
                  <div className="mc-bubble">{m.text}</div>
                </div>
              ))}
            </div>
            <div className="mc-input">
              <input
                type="text"
                placeholder="민지에게 메시지..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendChat()}
              />
              <button onClick={sendChat}>↑</button>
            </div>
          </div>
        </aside>
      </main>

      {/* ============ 배팅 모달 ============ */}
      {showBetModal && (
        <div className="modal-backdrop">
          <div className="modal bet-modal">
            <div className="modal-title">⚡ 돌발 예측 배팅</div>
            <div className="modal-sub">4번 타자 이민석의 결과는?</div>
            <div className="bet-options">
              {['안타', '홈런', '삼진'].map((opt) => (
                <button
                  key={opt}
                  className={`bet-opt ${betChoice === opt ? 'selected' : ''} ${opt === '홈런' ? 'recommended' : ''}`}
                  onClick={() => setBetChoice(opt)}
                >
                  <div className="bet-opt-name">{opt}</div>
                  {opt === '홈런' && <div className="bet-opt-hint">★ 추천</div>}
                </button>
              ))}
            </div>
            {betChoice && (
              <div className="bet-summary">
                <div>선택한 결과: <b>{betChoice}</b></div>
                <div>보유 포인트: <b>10,000P</b></div>
                <div>배팅 금액: <b>10,000P</b></div>
              </div>
            )}
            <button
              className="bet-confirm"
              disabled={!betChoice}
              onClick={placeBet}
            >
              10,000P 배팅하기
            </button>
          </div>
        </div>
      )}

      {/* ============ 배팅 결과 그래프 ============ */}
      {showBettingResult && (
        <div className="modal-backdrop">
          <div className="modal result-modal">
            <div className="modal-title">🎯 배팅 결과 — 홈런 적중!</div>
            <div className="result-stats">
              {[
                { label: '안타', votes: 960, mine: betChoice === '안타' },
                { label: '홈런', votes: 100, mine: betChoice === '홈런', win: true },
                { label: '삼진', votes: 240, mine: betChoice === '삼진' },
              ].map((row) => {
                const max = 960;
                const w = (row.votes / max) * 100;
                return (
                  <div key={row.label} className={`rs-row ${row.win ? 'win' : ''} ${row.mine ? 'mine' : ''}`}>
                    <span className="rs-label">{row.label}</span>
                    <div className="rs-bar-wrap">
                      <div className="rs-bar" style={{ width: `${w}%` }}></div>
                    </div>
                    <span className="rs-votes">{row.votes}표</span>
                    {row.mine && <span className="rs-mine">MY</span>}
                  </div>
                );
              })}
            </div>
            <div className="reward-box">
              <div className="rb-line big">홈런 예측 성공!</div>
              <div className="rb-line">소수 선택 보너스 적용</div>
              <div className="rb-line gold big">10,000P → 20,000P 더블 적립</div>
              <div className="rb-line small">추후 유꾸 상점에서 사용 가능합니다.</div>
            </div>
            <button className="modal-close" onClick={() => setShowBettingResult(false)}>
              확인하고 계속하기
            </button>
          </div>
        </div>
      )}

      {/* ============ 리포트 화면 ============ */}
      {phase === 'report' && (
        <div className="report-overlay">
          <div className="report-panel">
            <div className="report-head">
              <div className="rp-title">오늘의 직관 감정 리포트</div>
              <div className="rp-sub">9회말 끝내기 홈런으로 경기가 종료되었습니다 · SAMSUNG 6 : 4 NC</div>
            </div>

            <div className="report-grid">
              <div className="rep-item">
                <div className="rep-icon">⚡</div>
                <div className="rep-body">
                  <div className="rep-label">반응속도</div>
                  <div className="rep-text">{report.reaction}</div>
                </div>
              </div>
              <div className="rep-item">
                <div className="rep-icon">🌊</div>
                <div className="rep-body">
                  <div className="rep-label">응원 파도타기 참여</div>
                  <div className="rep-text">{report.wave}</div>
                </div>
              </div>
              <div className="rep-item">
                <div className="rep-icon">😂</div>
                <div className="rep-body">
                  <div className="rep-label">지루할 때 이모티콘 반복 경향</div>
                  <div className="rep-text">{report.emoji}</div>
                </div>
              </div>
              <div className="rep-item">
                <div className="rep-icon">🎯</div>
                <div className="rep-body">
                  <div className="rep-label">예측 배팅 참여</div>
                  <div className="rep-text">{report.bet}</div>
                </div>
              </div>
              <div className="rep-item">
                <div className="rep-icon">💬</div>
                <div className="rep-body">
                  <div className="rep-label">옆자리 대화 리듬</div>
                  <div className="rep-text">{report.chat}</div>
                </div>
              </div>
              <div className="rep-item highlight">
                <div className="rep-icon">💞</div>
                <div className="rep-body">
                  <div className="rep-label">민지와 동조율</div>
                  <div className="rep-text big">{report.sync}</div>
                  <div className="sync-bar">
                    <div className="sync-bar-fill" style={{ width: `${report.syncValue}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* 성향 카드 비교 */}
            <div className="card-update-section">
              <div className="cus-title">성향 카드 업데이트</div>
              <div className="cards-flex">
                <div className="persona-card old">
                  <div className="pc-label">BEFORE</div>
                  <div className="pc-emoji">🎩</div>
                  <div className="pc-name">꾸준한 2번 타자형</div>
                  <div className="pc-desc">안정적이고 신뢰감 있는 연애 스타일</div>
                </div>
                <div className="card-arrow">→</div>
                <div className="persona-card new">
                  <div className="pc-label gold">AFTER</div>
                  <div className="pc-emoji">⚡</div>
                  <div className="pc-name">클러치 응원형</div>
                  <div className="pc-desc">
                    경기 후반부와 돌발 상황에서 반응이 빠르고, 응원 파도타기와 예측 배팅에 적극적으로 참여하는 타입.
                    옆자리 사람과 짧고 빠른 대화 리듬이 잘 맞는 직관 메이트입니다.
                  </div>
                  <div className="pc-tags">
                    <span className="pc-tag">#후반_집중</span>
                    <span className="pc-tag">#즉각_반응</span>
                    <span className="pc-tag">#응원_동조</span>
                    <span className="pc-tag">#간맥_친화</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              className="report-cta"
              onClick={() => { setPhase('postgame'); sendGnaaemk(); }}
            >
              민지에게 "간맥콜?" 보내기 🍺
            </button>
          </div>
        </div>
      )}

      {/* ============ 간맥콜 화면 ============ */}
      {phase === 'postgame' && (
        <div className="report-overlay">
          <div className="postgame-panel">
            <div className="pg-title">🍺 경기 후 간맥콜</div>
            <div className="pg-chat">
              <div className="pg-msg me">
                <div className="pg-bubble">민지님, 간맥콜? 🍻</div>
                <div className="pg-time">방금 전</div>
              </div>
              {minjiOk ? (
                <div className="pg-msg minji">
                  <div className="pg-bubble">좋아요 ㅋㅋ 오늘 홈런 맞췄으니까 한 잔 가야죠!</div>
                  <div className="pg-time">민지 · 방금 전</div>
                </div>
              ) : (
                <div className="pg-msg minji">
                  <div className="pg-bubble typing">민지가 입력 중...</div>
                </div>
              )}
            </div>
            {minjiOk && (
              <button className="report-cta" onClick={() => setPhase('pubs')}>
                민지 OK 확인 → 주변 펍 보기
              </button>
            )}
          </div>
        </div>
      )}

      {/* ============ 펍 추천 ============ */}
      {phase === 'pubs' && (
        <div className="report-overlay">
          <div className="pubs-panel">
            <div className="pubs-head">
              <div className="ph-title">🍻 민지와 함께 가기 좋은 야구펍</div>
              <div className="ph-sub">잠실 종합운동장 인근 제휴 매장 · 직관 인증 할인 적용</div>
            </div>
            <div className="pubs-grid">
              {PUBS.map((pub) => (
                <div key={pub.id} className="pub-card">
                  <div className="pub-name">{pub.name}</div>
                  <div className="pub-walk">📍 {pub.walk}</div>
                  <div className="pub-price">
                    <span className="pub-price-label">{pub.price.label}</span>
                    <div className="pub-price-nums">
                      <span className="pp-orig">{pub.price.orig.toLocaleString()}원</span>
                      <span className="pp-sale">{pub.price.sale.toLocaleString()}원</span>
                    </div>
                  </div>
                  <div className="pub-tags">
                    {pub.tags.map((t) => <span key={t} className="pub-tag">{t}</span>)}
                  </div>
                  {showCardTypes === pub.id && (
                    <div className="pub-attendees">
                      <div className="pa-title">이 매장 정모 참여 성향</div>
                      {pub.attendees.map((a) => (
                        <div key={a.type} className="pa-row">
                          <span>{a.type}</span><b>{a.count}명</b>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="pub-actions">
                    <button
                      className="pub-btn ghost"
                      onClick={() => setShowCardTypes(showCardTypes === pub.id ? null : pub.id)}
                    >
                      {showCardTypes === pub.id ? '접기' : '참여 카드 유형 보기'}
                    </button>
                    <button
                      className="pub-btn primary"
                      onClick={() => { setSelectedPub(pub); setShowPaymentModal(true); }}
                    >
                      제휴 할인 결제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============ 결제 모달 ============ */}
      {showPaymentModal && selectedPub && (
        <div className="modal-backdrop">
          <div className="modal payment-modal">
            {!paymentDone ? (
              <>
                <div className="modal-title">제휴 할인 패키지 결제</div>
                <div className="payment-info">
                  <div className="pi-row"><span>매장</span><b>{selectedPub.name}</b></div>
                  <div className="pi-row"><span>패키지</span><b>{selectedPub.price.label}</b></div>
                  <div className="pi-row"><span>정상가</span><span className="strike">{selectedPub.price.orig.toLocaleString()}원</span></div>
                  <div className="pi-row big"><span>할인가</span><b className="gold">{selectedPub.price.sale.toLocaleString()}원</b></div>
                </div>
                <div className="payment-note">* 실제 결제는 연동되지 않은 데모입니다.</div>
                <div className="modal-actions">
                  <button className="btn ghost" onClick={() => setShowPaymentModal(false)}>취소</button>
                  <button className="btn primary" onClick={() => setPaymentDone(true)}>결제하기</button>
                </div>
              </>
            ) : (
              <>
                <div className="payment-done-icon">✓</div>
                <div className="modal-title">결제 완료</div>
                <div className="payment-done-text">
                  제휴 할인 패키지 결제가 완료되었습니다.<br />
                  민지와의 경기 후 간맥 코스가 생성되었습니다.
                </div>
                <div className="payment-note">* 실제 결제는 연동되지 않은 데모입니다.</div>
                <button className="btn primary full" onClick={() => { setShowPaymentModal(false); setPaymentDone(false); }}>
                  확인
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================
// 마운트
// =========================================================
const root = createRoot(document.getElementById('root'));
root.render(<App />);
