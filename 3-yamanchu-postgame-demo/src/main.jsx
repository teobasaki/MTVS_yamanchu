import React, {useEffect, useMemo, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {motion, AnimatePresence} from 'framer-motion';
import {
  MapPin, Users, Sparkles, MessageCircle, CreditCard, Utensils, Beer,
  CalendarCheck, ChevronRight, Search, Ticket, Trophy, HeartHandshake,
  Radio, Zap, Flame, Coffee, Wine, Music, Camera, Send, Bot, Star
} from 'lucide-react';
import './style.css';

/* ============================================================
   DATA
============================================================ */
const game = {
  away: {team:'NC', short:'NC', color:'nc', score:[0,1,0,0,2,0,1,0,0], r:4, h:8, e:1},
  home: {team:'SS', short:'삼성', color:'ss', score:[1,0,2,0,0,1,0,1,'X'], r:5, h:11, e:0},
  date: '2026.05.20 (화)',
  stadium: '대구 라이온즈파크',
  mvp: {name:'구자욱', role:'좌익수 · 4타수 3안타 1홈런', stats:[['타율','.421'],['홈런','1'],['타점','3']]},
  highlights: [
    {label:'결승타', val:'7회말 적시타'},
    {label:'관중수', val:'24,123'},
    {label:'경기시간', val:'3:14'},
    {label:'직관 매칭', val:'1,842쌍'},
  ]
};

const courses = [
  {id:'romantic', title:'달달한 후토크 데이트 코스', tag:'데이트 추천', filter:'데이트', price:39000, original:52000, distance:'도보 6분', mood:'조용한 대화 · 사진 잘 나옴',
    cards:['불펜 에이스형','꾸준한 2번 타자형'], sync:92,
    radar:{대화:9,응원성향:6,술음식:7,활동량:5,분위기:9},
    places:[
      {type:'DINNER', name:'잠실 그릴하우스', detail:'스테이크 플래터 + 하이볼 2잔', discount:'25% 제휴 할인', time:'19:40', x:25, y:35, icon:'utensils'},
      {type:'CAFE',   name:'루프탑 9회말',   detail:'야경 좌석 예약 + 디저트 세트',   discount:'전용 좌석',   time:'21:00', x:55, y:55, icon:'coffee'},
      {type:'WALK',   name:'탄천 야경 산책', detail:'경기 리뷰 질문 카드 제공',       discount:'무료',         time:'22:20', x:80, y:30, icon:'camera'},
    ]},
  {id:'hype', title:'응원 열기 그대로 호프 코스', tag:'후토크 정모형', filter:'정모', price:24000, original:33000, distance:'도보 4분', mood:'시끌벅적 · 팀 응원가 · 단체석',
    cards:['응원단장형','9회말 심장폭격기형'], sync:78,
    radar:{대화:6,응원성향:10,술음식:9,활동량:9,분위기:7},
    places:[
      {type:'PUB',   name:'야구호프 1982', detail:'치킨 반반 + 생맥 2잔',          discount:'28% 제휴 할인', time:'19:30', x:20, y:50, icon:'beer'},
      {type:'EVENT', name:'오늘의 MVP 토크', detail:'같은 팀 팬 테이블 자동 배정', discount:'참여 무료',     time:'21:10', x:50, y:40, icon:'music'},
      {type:'GAME',  name:'미니 배팅 챌린지', detail:'점수 맞히면 응원봉 쿠폰',   discount:'쿠폰 제공',     time:'22:30', x:80, y:55, icon:'flame'},
    ]},
  {id:'data', title:'차분한 분석러 코스', tag:'야구 대화 집중', filter:'데이트', price:31000, original:43000, distance:'도보 9분', mood:'조용함 · 기록 이야기 · 깊은 대화',
    cards:['냉정한 데이터 단장형','클러치 응원형'], sync:85,
    radar:{대화:10,응원성향:5,술음식:6,활동량:4,분위기:8},
    places:[
      {type:'DINING', name:'세이버메트릭스 바', detail:'안주 플래터 + 논알콜 옵션',     discount:'20% 제휴 할인', time:'19:45', x:22, y:40, icon:'wine'},
      {type:'LOUNGE', name:'리플레이 라운지',   detail:'하이라이트 보며 경기 복기',     discount:'스크린 좌석',   time:'21:20', x:55, y:60, icon:'radio'},
      {type:'QUIZ',   name:'오늘 경기 분석 카드', detail:'AI 대화창 질문 프롬프트 제공', discount:'무료',           time:'22:40', x:82, y:35, icon:'sparkles'},
    ]},
];

const meetups = [
  {id:1, name:'삼성팬 후토크 정모', pub:'야구호프 1982', count:13, max:20, distance:'도보 4분', mood:'응원가 크게 부르는 분위기',
    cards:[['응원단장형',5],['9회말 심장폭격기형',4],['불펜 에이스형',2],['꾸준한 2번 타자형',2]], host:'태현'},
  {id:2, name:'차분한 경기 복기 모임', pub:'세이버메트릭스 바', count:8, max:12, distance:'도보 9분', mood:'기록·전술 얘기 중심',
    cards:[['냉정한 데이터 단장형',4],['클러치 응원형',2],['불펜 에이스형',2]], host:'서연'},
  {id:3, name:'라이트팬 입문 후토크', pub:'루프탑 9회말', count:6, max:10, distance:'도보 7분', mood:'야알못 환영 · 가벼운 대화',
    cards:[['대주자형',3],['꾸준한 2번 타자형',2],['응원단장형',1]], host:'민지'},
];

const menuData = {
  '잠실 그릴하우스': [['스테이크 플래터','32,000원'],['트러플 감자튀김','9,000원'],['하이볼','8,000원'],['야만추 2인 세트','39,000원']],
  '야구호프 1982':  [['반반치킨','21,000원'],['생맥주','4,500원'],['응원봉 감튀','8,000원'],['야만추 후토크 세트','24,000원']],
  '세이버메트릭스 바':[['시그니처 플래터','26,000원'],['논알콜 모히또','7,000원'],['데이터 단장 세트','31,000원']],
  '루프탑 9회말':    [['디저트 세트','18,000원'],['커플 에이드','12,000원'],['루프탑 좌석 패키지','29,000원']],
};

/* ============================================================
   ICON HELPER
============================================================ */
const ICONS = {utensils:Utensils, coffee:Coffee, camera:Camera, beer:Beer, music:Music, flame:Flame, wine:Wine, radio:Radio, sparkles:Sparkles};
function StopIcon({name, size=18, color}){const C = ICONS[name] || MapPin; return <C size={size} color={color}/>;}

/* ============================================================
   APP
============================================================ */
function App(){
  const [view, setView] = useState('home');
  const [selectedCourse, setSelectedCourse] = useState(courses[0]);
  const [selectedMeet, setSelectedMeet] = useState(meetups[0]);
  const [paid, setPaid] = useState(false);
  const [confetti, setConfetti] = useState(false);

  function pay(){
    setPaid(true);
    setConfetti(true);
    setTimeout(()=>setConfetti(false), 3500);
  }

  return (
    <div className="app">
      <div className="scanline"/>
      <Header view={view} setView={setView}/>
      {view==='home'     && <Home setView={setView} setSelectedCourse={setSelectedCourse}/>}
      {view==='date'     && <DateCourse selectedCourse={selectedCourse} setSelectedCourse={setSelectedCourse} paid={paid} setPaid={setPaid} pay={pay}/>}
      {view==='ai'       && <AIChat setSelectedCourse={setSelectedCourse} setView={setView}/>}
      {view==='community'&& <Community selectedMeet={selectedMeet} setSelectedMeet={setSelectedMeet}/>}
      {confetti && <Confetti/>}
    </div>
  );
}

/* ============================================================
   HEADER
============================================================ */
function Header({view, setView}){
  const tabs = [
    ['home', '경기 후 허브'],
    ['date', '데이트 코스'],
    ['ai',   'AI 코스 상담'],
    ['community','정모 커뮤니티'],
  ];
  return (
    <header className="header">
      <div className="brand">
        <div className="logo-led"><span>野</span></div>
        <div>
          <b>야만추 · 野慢追</b>
          <small>POST · GAME · HUB</small>
        </div>
      </div>
      <nav>
        {tabs.map(([k,v]) => (
          <button key={k} onClick={()=>setView(k)} className={view===k?'active':''}>{v}</button>
        ))}
      </nav>
      <div className="live-pill">LIVE · 경기 종료</div>
    </header>
  );
}

/* ============================================================
   SCOREBOARD
============================================================ */
function Scoreboard(){
  const [tick, setTick] = useState(0);
  useEffect(()=>{const t=setInterval(()=>setTick(x=>x+1),1000);return ()=>clearInterval(t);},[]);

  // 후토크까지 countdown (mock)
  const start = useMemo(()=>Date.now(),[]);
  const elapsed = Math.floor((Date.now()-start)/1000) + tick*0; // tick triggers rerender
  const totalMin = 20;
  const remainSec = Math.max(0, totalMin*60 - Math.floor((Date.now()-start)/1000));
  const m = String(Math.floor(remainSec/60)).padStart(2,'0');
  const s = String(remainSec%60).padStart(2,'0');

  const innings = Array.from({length:9}, (_,i)=>i+1);

  return (
    <div className="scoreboard">
      <div className="scoreboard-top">
        <span className="lbl">★ JAMSIL BASEBALL PARK ★</span>
        <span className="date">{game.date.replace(/\./g,'·')}</span>
      </div>

      <div className="scoreboard-grid">
        <div></div>
        {innings.map(n => <div key={n} className="head">{n}</div>)}
        <div className="head total">R</div>
        <div className="head total">H</div>
        <div className="head total">E</div>

        <div className="team">
          <div className={`badge ${game.away.color}`}>{game.away.team}</div>
          <div className="nm">{game.away.team}</div>
        </div>
        {game.away.score.map((v,i)=>(
          <motion.div key={i} initial={{opacity:0,y:-6}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}
            className={`cell ${v===0?'zero':''}`}>{v}</motion.div>
        ))}
        <div className="cell total">{game.away.r}</div>
        <div className="cell total">{game.away.h}</div>
        <div className="cell total">{game.away.e}</div>

        <div className="team">
          <div className={`badge ${game.home.color}`}>SS</div>
          <div className="nm">{game.home.team}</div>
        </div>
        {game.home.score.map((v,i)=>(
          <motion.div key={i} initial={{opacity:0,y:-6}} animate={{opacity:1,y:0}} transition={{delay:0.5+i*0.06}}
            className={`cell ${v===0?'zero':''}`}>{v}</motion.div>
        ))}
        <div className="cell total win">{game.home.r}</div>
        <div className="cell total">{game.home.h}</div>
        <div className="cell total">{game.home.e}</div>
      </div>

      <div className="scoreboard-bottom">
        <span className="final">★ FINAL ★ {game.home.team} {game.home.r} : {game.away.r} {game.away.team}</span>
        <span className="countdown">
          <Radio size={18}/> 후토크 모임 OPEN <b>{m}:{s}</b>
        </span>
      </div>
    </div>
  );
}

/* ============================================================
   HOME
============================================================ */
function Home({setView, setSelectedCourse}){
  return (
    <main className="page">
      <Scoreboard/>

      <div className="stats-strip">
        {game.highlights.map((h,i)=>(
          <motion.div key={h.label} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.1+i*0.05}}
            className="stat-cell" style={{'--w':`${30+i*15}%`}}>
            <div className="lbl">{h.label}</div>
            <div className="val">{h.val}</div>
            <div className="sub">{i===0?'7회말 박병호 적시타':i===1?'홈 구단 기준':i===2?'정규이닝':'KBO 직관 매칭 누적'}</div>
          </motion.div>
        ))}
      </div>

      <div className="hero-grid">
        <motion.section initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} className="panel hero-copy">
          <span className="kicker">▶ POST · GAME · CONNECT</span>
          <h1>뜨거운 직관 이후,<br/><em>관계가 이어지는</em> 다음 장면.</h1>
          <p>방금 같이 응원한 사람과 바로 흩어지지 않도록, 야만추는 경기 후 데이트 코스·제휴 할인·정모 커뮤니티를 연결합니다.</p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={()=>setView('date')}><Utensils size={16}/> 데이트 코스 보기</button>
            <button className="btn btn-led" onClick={()=>setView('community')}><Users size={16}/> 정모 참여하기</button>
            <button className="btn btn-ghost" onClick={()=>setView('ai')}><Bot size={16}/> AI 상담</button>
          </div>
        </motion.section>

        <motion.section initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} className="panel mvp-card">
          <div className="mvp-head">
            <span className="ttl">★ TODAY'S MVP</span>
            <span className="nm">#7</span>
          </div>
          <div className="mvp-body">
            <h3 className="player">{game.mvp.name}</h3>
            <div className="role">{game.mvp.role}</div>
            <div className="mvp-stats">
              {game.mvp.stats.map(([k,v])=>(
                <div className="mvp-stat" key={k}>
                  <div className="k">{k}</div>
                  <div className="v">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>
      </div>

      <div className="section-title">경기 후 핵심 기능 <small>· FEATURES</small></div>
      <section className="features">
        <Feature icon={<HeartHandshake/>}    title="직관 매칭 후 데이트" text="성향 카드와 감정 동조율을 바탕으로 두 사람에게 맞는 맛집·카페·산책 코스를 추천합니다." n="01"/>
        <Feature icon={<CreditCard/>}         title="제휴 할인 패키지"     text="KBO·상권 제휴 상황을 가정해 할인된 2인 패키지 가격과 결제 mock을 보여줍니다."           n="02"/>
        <Feature icon={<MessageCircle/>}      title="커뮤니티 정모"        text="데이트가 부담스러운 사용자는 카드 유형별 참여자 구성을 보고 후토크 정모에 참여합니다."     n="03"/>
      </section>

      <div className="section-title">오늘의 추천 코스 <small>· TOP PICKS</small></div>
      <section className="course-row">
        {courses.map(c => (
          <CourseCard key={c.id} course={c} onClick={()=>{setSelectedCourse(c); setView('date');}}/>
        ))}
      </section>
    </main>
  );
}

function Feature({icon, title, text, n}){
  return (
    <motion.div whileHover={{y:-3}} className="feature">
      <span className="corner">FEATURE / {n}</span>
      <div className="ic">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </motion.div>
  );
}

function CourseCard({course, onClick, active}){
  return (
    <motion.div whileHover={{y:-2}} className={`course-card ${active?'active':''}`} onClick={onClick}>
      <span className="tag">{course.tag}</span>
      <h3>{course.title}</h3>
      <p className="mood">{course.mood}</p>
      <div className="chips">
        {course.cards.map(c => <em key={c}>{c}</em>)}
      </div>
      <div className="meta">
        <div className="price">
          <del>{course.original.toLocaleString()}</del>
          <strong>{course.price.toLocaleString()}<span style={{fontSize:14,opacity:.7,marginLeft:2}}>원</span></strong>
        </div>
        <div className="dist">{course.distance}</div>
      </div>
    </motion.div>
  );
}

/* ============================================================
   COURSE MAP (interactive SVG timeline)
============================================================ */
function CourseMap({course, focused, setFocused}){
  // Stadium fixed at left-bottom
  const stadium = {x:8, y:78};
  const stops = course.places.map(p=>({...p}));
  // Build path
  const points = [stadium, ...stops];

  return (
    <div className="panel map-panel">
      <div className="map-head">
        <span className="ttl">▣ COURSE MAP · {course.title.replace('코스','').trim()}</span>
        <span className="legend">총 {stops.length+1}개 지점</span>
      </div>
      <div className="map-svg-wrap">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="map-svg">
          {/* dashed path */}
          <motion.polyline
            points={points.map(p=>`${p.x},${p.y}`).join(' ')}
            fill="none" stroke="#ffb627" strokeWidth="0.6"
            strokeDasharray="2 1.5"
            initial={{pathLength:0}} animate={{pathLength:1}} transition={{duration:1.4,ease:'easeInOut'}}
            style={{filter:'drop-shadow(0 0 2px rgba(255,182,39,.5))'}}
          />
          {/* moving dot animation along path */}
          <motion.circle r="1.2" fill="#3aff7c"
            initial={{cx:stadium.x, cy:stadium.y}}
            animate={{cx:stops.map(s=>s.x), cy:stops.map(s=>s.y)}}
            transition={{duration:6, repeat:Infinity, ease:'easeInOut', repeatDelay:0.5}}
            style={{filter:'drop-shadow(0 0 4px #3aff7c)'}}
          />
          {/* stadium */}
          <g>
            <circle cx={stadium.x} cy={stadium.y} r="3.5" fill="#1a2540" stroke="#5ec8ff" strokeWidth="0.5"/>
            <text x={stadium.x} y={stadium.y+0.8} textAnchor="middle" fontSize="3" fill="#5ec8ff" fontFamily="VT323">⚾</text>
            <text x={stadium.x} y={stadium.y+7} textAnchor="middle" fontSize="2.8" fill="#5ec8ff" fontFamily="DotGothic16">잠실구장</text>
          </g>
          {/* stops */}
          {stops.map((s,i)=>(
            <g key={s.name} className="map-stop" onClick={()=>setFocused(i)} style={{cursor:'pointer'}}>
              <motion.circle
                cx={s.x} cy={s.y} r={focused===i?5:3.5}
                fill={focused===i?'#ffb627':'#0d1626'} stroke="#ffb627" strokeWidth="0.6"
                className="map-stop-bg"
                initial={{scale:0}} animate={{scale:1}} transition={{delay:0.3+i*0.2}}
                style={{filter:focused===i?'drop-shadow(0 0 6px #ffb627)':''}}
              />
              <text x={s.x} y={s.y+1} textAnchor="middle" fontSize="3.2" fill={focused===i?'#0b1020':'#ffb627'} fontFamily="VT323">{i+1}</text>
              <text x={s.x} y={s.y-5} textAnchor="middle" fontSize="2.6" fill="#f4ecd8" fontFamily="DotGothic16">{s.name}</text>
              <text x={s.x} y={s.y+7.5} textAnchor="middle" fontSize="2.3" fill="#3aff7c" fontFamily="VT323">{s.time}</text>
            </g>
          ))}
        </svg>
      </div>
      <div className="map-foot">
        <div className="stop-cell">
          <div className="t">19:00</div>
          <div className="n">⚾ 잠실구장</div>
          <div className="x">경기 종료</div>
        </div>
        {stops.map((s,i)=>(
          <div key={s.name} className={`stop-cell ${focused===i?'on':''}`} onClick={()=>setFocused(i)}>
            <div className="t">{s.time}</div>
            <div className="n">
              <StopIcon name={s.icon} size={13} color="#ffb627"/> {s.name}
            </div>
            <div className="x">{s.type}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   EMOTION SYNC GAUGE + RADAR
============================================================ */
function SyncGauge({course}){
  const [sync, setSync] = useState(0);
  useEffect(()=>{
    setSync(0);
    const target = course.sync;
    let v = 0;
    const t = setInterval(()=>{
      v += Math.ceil((target-v)/8);
      if (v >= target){v = target; clearInterval(t);}
      setSync(v);
    }, 60);
    return ()=>clearInterval(t);
  },[course]);

  const r = 70;
  const c = 2*Math.PI*r;
  const off = c - (sync/100)*c;

  return (
    <div className="panel sync-wrap">
      <div className="sync-head">
        <h3 className="panel-title"><Zap size={16}/> 감정 동조율 매칭</h3>
        <span className="kicker">▶ SYNC · ANALYSIS</span>
      </div>
      <div className="sync-grid">
        <div className="sync-card">
          <div className="role">PERSON · A</div>
          <div className="ic"><HeartHandshake size={22} color="#ffb627"/></div>
          <div className="nm">{course.cards[0]}</div>
          <div className="type">너의 직관 동행</div>
        </div>

        <div className="sync-center">
          <div className="sync-circle">
            <svg viewBox="0 0 160 160">
              <circle cx="80" cy="80" r={r} stroke="#1f2c4d" strokeWidth="10" fill="none"/>
              <motion.circle cx="80" cy="80" r={r} stroke="url(#syncGrad)" strokeWidth="10" fill="none"
                strokeLinecap="round"
                strokeDasharray={c} strokeDashoffset={off}
                style={{filter:'drop-shadow(0 0 6px rgba(255,182,39,.5))'}}
                transition={{type:'spring'}}/>
              <defs>
                <linearGradient id="syncGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ffb627"/>
                  <stop offset="100%" stopColor="#3aff7c"/>
                </linearGradient>
              </defs>
            </svg>
            <div className="pct">{sync}<span className="small">%</span></div>
          </div>
          <div className="sync-label">{sync>=85?'★ 최고의 매칭':sync>=70?'좋은 매칭':'무난한 매칭'}</div>
        </div>

        <div className="sync-card right">
          <div className="role">PERSON · B</div>
          <div className="ic"><Star size={22} color="#5ec8ff"/></div>
          <div className="nm">{course.cards[1]||course.cards[0]}</div>
          <div className="type">상대의 성향 카드</div>
        </div>
      </div>

      <Radar data={course.radar}/>
    </div>
  );
}

function Radar({data}){
  const keys = Object.keys(data);
  const cx = 150, cy = 120, R = 88;
  const angles = keys.map((_,i)=> (Math.PI*2*i/keys.length) - Math.PI/2);
  const pts = keys.map((k,i)=>{
    const v = data[k]/10;
    return [cx + Math.cos(angles[i])*R*v, cy + Math.sin(angles[i])*R*v];
  });
  const polyStr = pts.map(([x,y])=>`${x},${y}`).join(' ');

  return (
    <div className="radar-wrap">
      <div className="ttl">▣ COMPATIBILITY RADAR <span style={{color:'var(--led-green)'}}>· 5 AXIS</span></div>
      <svg viewBox="0 0 300 240" className="radar-svg">
        {[0.25,0.5,0.75,1].map(s=>(
          <polygon key={s}
            points={keys.map((_,i)=>{
              return `${cx+Math.cos(angles[i])*R*s},${cy+Math.sin(angles[i])*R*s}`;
            }).join(' ')}
            fill="none" stroke="#2c3754" strokeWidth="0.7"
            strokeDasharray={s===1?'0':'2 2'}/>
        ))}
        {keys.map((_,i)=>(
          <line key={i} x1={cx} y1={cy}
            x2={cx+Math.cos(angles[i])*R}
            y2={cy+Math.sin(angles[i])*R}
            stroke="#2c3754" strokeWidth="0.5"/>
        ))}
        <motion.polygon
          points={polyStr}
          fill="rgba(255,182,39,.18)" stroke="#ffb627" strokeWidth="1.5"
          initial={{opacity:0,scale:0.6}} animate={{opacity:1,scale:1}}
          transition={{duration:0.7}}
          style={{transformOrigin:`${cx}px ${cy}px`,filter:'drop-shadow(0 0 6px rgba(255,182,39,.4))'}}/>
        {pts.map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r="3" fill="#ffb627" style={{filter:'drop-shadow(0 0 4px #ffb627)'}}/>
        ))}
        {keys.map((k,i)=>{
          const x = cx + Math.cos(angles[i])*(R+18);
          const y = cy + Math.sin(angles[i])*(R+18);
          return <text key={k} x={x} y={y+3} textAnchor="middle" fontSize="11" fill="#f4ecd8" fontFamily="DotGothic16">{k}</text>;
        })}
      </svg>
    </div>
  );
}

/* ============================================================
   DATE COURSE
============================================================ */
function DateCourse({selectedCourse, setSelectedCourse, paid, setPaid, pay}){
  const [filter, setFilter] = useState('전체');
  const [focused, setFocused] = useState(0);
  const list = useMemo(()=> filter==='전체' ? courses : courses.filter(c=>c.filter===filter), [filter]);

  useEffect(()=>{setFocused(0);},[selectedCourse]);

  return (
    <main className="page split">
      <aside className="side">
        <h2>경기 후 데이트 코스</h2>
        <p className="desc">직관을 함께 본 두 사람에게 맞는 제휴 맛집·카페·산책 코스입니다.</p>
        <div className="filter">
          {['전체','데이트','정모'].map(f=>(
            <button key={f} className={filter===f?'on':''} onClick={()=>setFilter(f)}>{f}</button>
          ))}
        </div>
        {list.map(c => (
          <div key={c.id} className={`mini ${selectedCourse.id===c.id?'on':''}`} onClick={()=>setSelectedCourse(c)}>
            <h4>{c.title}</h4>
            <div style={{fontSize:11,color:'#9aa6c5'}}>{c.mood}</div>
            <div className="row">
              <span className="dist">{c.distance}</span>
              <span className="price">{c.price.toLocaleString()}원</span>
            </div>
          </div>
        ))}
      </aside>

      <section className="detail">
        <div className="panel detail-head">
          <span className="tag">▶ {selectedCourse.tag}</span>
          <h1>{selectedCourse.title}</h1>
          <div className="mood-row">
            <span><Sparkles size={14}/> {selectedCourse.mood}</span>
            <span className="dot"/>
            <span><MapPin size={14}/> {selectedCourse.distance}</span>
            <span className="dot"/>
            <span><Users size={14}/> 2인 패키지</span>
          </div>
        </div>

        <CourseMap course={selectedCourse} focused={focused} setFocused={setFocused}/>

        <div className="panel" style={{padding:0}}>
          <div style={{padding:'16px 22px',borderBottom:'1px solid var(--line)'}}>
            <h3 className="panel-title" style={{margin:0}}><CalendarCheck size={16}/> 코스 타임라인</h3>
          </div>
          <div className="route">
            {selectedCourse.places.map((p,i)=>(
              <motion.div key={p.name}
                className={`route-item ${focused===i?'on':''}`}
                onClick={()=>setFocused(i)}
                initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:i*0.1}}>
                <div className="num">{i+1}</div>
                <div className="body">
                  <span className="type">{p.type} · {p.time}</span>
                  <h4 className="name">{p.name}</h4>
                  <p className="det">{p.detail}</p>
                  <span className="disc">▶ {p.discount}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <SyncGauge course={selectedCourse}/>

        <div className="paybox">
          <div>
            <div className="lbl">▶ 제휴 패키지 · 결제 데모</div>
            <div className="price">
              <del>{selectedCourse.original.toLocaleString()}원</del>
              <strong>{selectedCourse.price.toLocaleString()}<span>원</span></strong>
            </div>
            <p className="note">노쇼 시 서비스 이용이 제한될 수 있습니다. 발표용 데모이며 실제 결제는 연동되지 않습니다.</p>
          </div>
          <button className="btn btn-primary" onClick={pay}><CreditCard size={16}/> 패키지 결제하기</button>
        </div>

        <AnimatePresence>
          {paid && (
            <Modal onClose={()=>setPaid(false)}>
              <div className="ic"><CalendarCheck size={32}/></div>
              <h2>★ 결제 완료 ★</h2>
              <p>{selectedCourse.title} 예약이 생성되었습니다.</p>
              <p style={{fontSize:12,color:'#9aa6c5'}}>실제 서비스에서는 제휴 매장 예약·결제 API와 연결됩니다.</p>
              <div className="receipt">
                <div className="row"><span>코스</span><b>{selectedCourse.title.length>14?selectedCourse.title.slice(0,12)+'…':selectedCourse.title}</b></div>
                <div className="row"><span>인원</span><b>2명</b></div>
                <div className="row"><span>할인</span><b>-{(selectedCourse.original-selectedCourse.price).toLocaleString()}원</b></div>
                <div className="row"><span>결제</span><b>{selectedCourse.price.toLocaleString()}원</b></div>
              </div>
              <button className="btn btn-primary ok" onClick={()=>setPaid(false)}>확인</button>
            </Modal>
          )}
        </AnimatePresence>
      </section>
    </main>
  );
}

/* ============================================================
   AI CHAT (with streaming, typing, reply chips, inline cards)
============================================================ */
const QUICK_REPLIES = [
  '데이트 맛집 추천해줘',
  '조용한 코스 원해',
  '메뉴와 가격 보여줘',
  '정모 참여하고 싶어',
  '가까운 코스만',
  '예산 3만원대',
];

function buildAnswer(q){
  const text = q.toLowerCase();
  let course = null;
  let answer = '';
  let chips = [];

  if (q.includes('조용')||q.includes('차분')||q.includes('분석')){
    course = courses.find(c=>c.id==='data');
    answer = '시끄러운 호프보다 차분한 대화가 좋다면 "차분한 분석러 코스"를 추천드릴게요. 리플레이 라운지에서 하이라이트를 보며 경기 복기하는 흐름이에요. 동조율은 85%로 높은 편입니다.';
    chips = ['이 코스로 결제할게','다른 코스도 보여줘','메뉴 가격 알려줘'];
  } else if (q.includes('메뉴')||q.includes('가격')||q.includes('얼마')){
    answer = '제휴 매장 메뉴판 기준으로 야만추 패키지 가격을 정리했어요. 실제 서비스에서는 매장 메뉴판 크롤링 또는 제휴 API로 당일 가격을 가져와 결합합니다.';
    chips = ['잠실 그릴하우스 메뉴','야구호프 1982 메뉴','루프탑 9회말 메뉴'];
  } else if (q.includes('정모')||q.includes('커뮤니티')||q.includes('모임')){
    answer = '정모를 원하면 카드 유형별 참여자 구성을 보고 들어갈 수 있어요. 응원단장형이 많은 모임은 활발하고, 데이터 단장형이 많은 모임은 경기 복기 중심이에요.';
    chips = ['응원단장형 모임 보여줘','입문자 모임 보여줘','정모 페이지로 이동'];
  } else if (q.includes('데이트')||q.includes('맛집')||q.includes('추천')){
    course = courses.find(c=>c.id==='romantic');
    answer = '두 분의 성향이 불펜 에이스형 · 꾸준한 2번 타자형이라면 조용히 대화가 이어지는 "달달한 후토크 데이트 코스"를 추천드려요. 도보 6분, 2인 제휴 39,000원이고 동조율은 92%로 최고 수준입니다.';
    chips = ['이 코스 자세히 보기','다른 분위기 추천','정모도 알려줘'];
  } else if (q.includes('가까운')||q.includes('빨리')){
    course = courses.find(c=>c.id==='hype');
    answer = '도보 4분, 가장 가까운 옵션은 "응원 열기 그대로 호프 코스"입니다. 시끌벅적한 후토크에 가장 잘 맞아요.';
    chips = ['결제할게','조용한 코스 비교','정모 보여줘'];
  } else if (q.includes('예산')||q.includes('3만')||q.includes('저렴')){
    course = courses.find(c=>c.id==='hype');
    answer = '예산 3만 원대라면 24,000원에 호프 + 단체석이 포함된 "응원 열기 그대로 호프 코스"가 가장 가성비가 좋습니다.';
    chips = ['이 코스로 결제','조용한 코스 비교','음식 메뉴 보여줘'];
  } else {
    answer = '좋아요. 오늘 경기 후 분위기와 두 분의 성향 카드 기준으로 가까운 제휴 코스를 추천해드릴게요. 원하는 분위기를 알려주시면 더 정확합니다.';
    chips = ['조용한 분위기','시끌벅적 호프','데이터·전술 토크'];
  }

  return {answer, course, chips};
}

function AIChat({setSelectedCourse, setView}){
  const [chat, setChat] = useState([
    {role:'ai', text:'경기 끝났어요. 지금부터는 목적을 골라주세요. 데이트 코스 추천, 제휴 할인 패키지, 또는 정모 참여가 가능합니다.', chips:['데이트 맛집 추천해줘','조용한 코스 원해','메뉴와 가격 보여줘','정모 참여하고 싶어']}
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(()=>{
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  },[chat, typing]);

  async function ask(q){
    const text = (q || input).trim();
    if (!text) return;
    setInput('');
    setChat(c => [...c, {role:'user', text}]);
    setTyping(true);

    await new Promise(r => setTimeout(r, 700 + Math.random()*500));

    const {answer, course, chips} = buildAnswer(text);

    // Streaming effect
    setTyping(false);
    setChat(c => [...c, {role:'ai', text:'', course:null, chips:[], streaming:true}]);

    let i = 0;
    const step = ()=>{
      i += Math.max(2, Math.floor(Math.random()*4));
      const partial = answer.slice(0, i);
      setChat(c => {
        const last = c[c.length-1];
        const updated = {...last, text: partial};
        if (i >= answer.length){
          updated.streaming = false;
          updated.course = course;
          updated.chips = chips;
        }
        return [...c.slice(0,-1), updated];
      });
      if (i < answer.length) setTimeout(step, 24);
    };
    step();
  }

  function pickCourse(c){
    setSelectedCourse(c);
    setView('date');
  }

  return (
    <main className="page chat-page">
      <section className="panel chat-info">
        <span className="kicker">▶ AI · POST-GAME · ASSISTANT</span>
        <h1>AI 코스 상담</h1>
        <p>발표용 데모에서는 미리 설계된 프롬프트 흐름으로 답변합니다. 실제 서비스에서는 제휴 매장 메뉴판 크롤링·당일 할인·동조율 모델을 결합해 응답합니다.</p>

        <div className="quick">
          {QUICK_REPLIES.map(q => (
            <button key={q} onClick={()=>ask(q)}>▸ {q}</button>
          ))}
        </div>

        <h3 className="panel-title"><Utensils size={14}/> 제휴 메뉴판 샘플</h3>
        <div className="menu-board">
          {Object.entries(menuData).map(([k,v])=>(
            <details key={k}>
              <summary>{k}</summary>
              <div className="menu-list">
                {v.map(([n,p])=>(
                  <div className="row" key={n}>
                    <span>{n}</span>
                    <span className="price">{p}</span>
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="panel chatbox">
        <div className="messages" ref={scrollRef}>
          {chat.map((m,i) => (
            <motion.div key={i} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className={`msg ${m.role}`}>
              {m.text}
              {m.streaming && <span className="cursor"/>}
              {m.course && !m.streaming && (
                <div className="inline-card" onClick={()=>pickCourse(m.course)} style={{cursor:'pointer'}}>
                  <div>
                    <div className="nm">▸ {m.course.title}</div>
                    <div className="dt">{m.course.mood} · {m.course.distance}</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div className="pr">{m.course.price.toLocaleString()}원</div>
                    <div style={{fontFamily:'var(--font-pixel-kr)',fontSize:11,color:'var(--led-green)'}}>자세히 보기 ▸</div>
                  </div>
                </div>
              )}
              {m.chips && m.chips.length>0 && !m.streaming && (
                <div className="reply-chips">
                  {m.chips.map(c=>(
                    <button key={c} onClick={()=>ask(c)}>{c}</button>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
          {typing && (
            <div className="typing"><span/><span/><span/></div>
          )}
        </div>
        <div className="input-row">
          <input
            value={input}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{if(e.key==='Enter')ask();}}
            placeholder="예: 조용한 데이트 코스 원해 / 메뉴 가격 알려줘 / 정모 추천해줘"
          />
          <button onClick={()=>ask()}><Send size={14}/> 전송</button>
        </div>
      </section>
    </main>
  );
}

/* ============================================================
   COMMUNITY
============================================================ */
function Community({selectedMeet, setSelectedMeet}){
  const [joined, setJoined] = useState(false);

  useEffect(()=>{setJoined(false);},[selectedMeet]);

  return (
    <main className="page split">
      <aside className="side">
        <h2>후토크 정모</h2>
        <p className="desc">데이트보다 커뮤니티를 원하는 사용자는 참여자 카드 구성을 보고 정모를 선택합니다.</p>
        {meetups.map(m => (
          <div key={m.id} className={`meet-mini ${selectedMeet.id===m.id?'on':''}`} onClick={()=>setSelectedMeet(m)}>
            <h4>{m.name}</h4>
            <div style={{fontSize:11,color:'#9aa6c5'}}>{m.pub} · {m.distance}</div>
            <div className="row">
              <span>{m.mood}</span>
              <span className="count">{m.count}/{m.max}</span>
            </div>
          </div>
        ))}
      </aside>

      <section className="detail">
        <div className="panel detail-head">
          <span className="tag">▶ 참여자 {selectedMeet.count}/{selectedMeet.max}</span>
          <h1>{selectedMeet.name}</h1>
          <div className="mood-row">
            <span><MapPin size={14}/> {selectedMeet.pub}</span>
            <span className="dot"/>
            <span>{selectedMeet.distance}</span>
            <span className="dot"/>
            <span>{selectedMeet.mood}</span>
          </div>
        </div>

        <div className="panel">
          <h3 className="panel-title"><Users size={16}/> 참여자 카드 구성</h3>
          <div className="card-bars">
            {selectedMeet.cards.map(([name,n],i)=>(
              <motion.div key={name} className="bar" initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:i*0.08}}>
                <span className="lbl">{name}</span>
                <div className="track">
                  <motion.div className="fill"
                    initial={{width:0}}
                    animate={{width:`${n/selectedMeet.max*100}%`}}
                    transition={{duration:0.9,ease:'easeOut'}}/>
                </div>
                <span className="v">{n}명</span>
              </motion.div>
            ))}
          </div>

          <div className="host-card">
            <div className="av">{selectedMeet.host[0]}</div>
            <div className="info">
              <b>{selectedMeet.host}님이 정모를 열었습니다</b>
              <span>경기 종료 직후 ★ {selectedMeet.pub}에서 모입니다.</span>
            </div>
          </div>

          <button className="btn btn-primary" onClick={()=>setJoined(true)}><Ticket size={14}/> 정모 참여하기</button>
          <AnimatePresence>
            {joined && (
              <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="joined">
                <CalendarCheck size={18}/> 참여 완료! 경기 후 20분 뒤 모임 위치 안내가 표시됩니다.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}

/* ============================================================
   MODAL + CONFETTI
============================================================ */
function Modal({children, onClose}){
  return (
    <motion.div className="modal-back"
      initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      onClick={onClose}>
      <motion.div className="modal"
        initial={{scale:0.9, y:20}} animate={{scale:1, y:0}} exit={{scale:0.9, opacity:0}}
        onClick={e=>e.stopPropagation()}>
        {children}
      </motion.div>
    </motion.div>
  );
}

function Confetti(){
  const pieces = Array.from({length:80}, (_,i)=>{
    const colors = ['#ffb627','#3aff7c','#5ec8ff','#ff7ac8','#ff4d4d','#ffd23f'];
    const c = colors[i%colors.length];
    const left = Math.random()*100;
    const delay = Math.random()*0.8;
    const dur = 2.5 + Math.random()*1.5;
    const rot = Math.random()*360;
    return <i key={i} style={{
      left:`${left}%`,
      background:c,
      animationDuration:`${dur}s`,
      animationDelay:`${delay}s`,
      transform:`rotate(${rot}deg)`,
      boxShadow:`0 0 8px ${c}`
    }}/>;
  });
  return <div className="confetti">{pieces}</div>;
}

createRoot(document.getElementById('root')).render(<App/>);
