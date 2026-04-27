import { useState } from "react";

// ── 샘플 데이터 (실제 스킬에서는 Persistent Storage에서 로드) ──────────────
const SESSIONS = [
  { date:"2026-04-03", tool:"Code",    category:"PRD·설계",   type:"2pager-표준",       desc:"이구위크 구매 리워드 제품화 2-Pager 초안",           hours:32, link:"https://wiki.team.musinsa.com" },
  { date:"2026-04-04", tool:"Code",    category:"Jira",       type:"Initiative",        desc:"이구위크 이니셔티브 구조 정의",                         hours:4,  link:"https://jira.team.musinsa.com" },
  { date:"2026-04-05", tool:"Desktop", category:"전략·기획",  type:"전략B",             desc:"브랜드홈 방향성 검토",                                  hours:8,  link:"" },
  { date:"2026-04-07", tool:"Code",    category:"Jira",       type:"Epic",              desc:"#1 구매 리워드 제품화 Epic",                            hours:2,  link:"https://jira.team.musinsa.com" },
  { date:"2026-04-07", tool:"Code",    category:"Jira",       type:"Epic",              desc:"#2 브랜드홈 배너 알림신청 고도화 Epic",                 hours:2,  link:"https://jira.team.musinsa.com" },
  { date:"2026-04-08", tool:"Code",    category:"Jira",       type:"Epic",              desc:"#3 CMS 전략 컬렉션 생성 Epic",                          hours:2,  link:"https://jira.team.musinsa.com" },
  { date:"2026-04-09", tool:"Code",    category:"Jira",       type:"Epic",              desc:"#6 세일즈캠페인 원브랜드데이 Epic",                     hours:2,  link:"https://jira.team.musinsa.com" },
  { date:"2026-04-10", tool:"Code",    category:"PRD·설계",   type:"PRD-일반",          desc:"PRD: 이구위크 #1 구매 리워드 제품화",                   hours:20, link:"https://wiki.team.musinsa.com" },
  { date:"2026-04-11", tool:"Code",    category:"PRD·설계",   type:"PRD-일반",          desc:"PRD: 세일즈캠페인 모듈 확장 4개 모듈 통합",             hours:20, link:"https://wiki.team.musinsa.com" },
  { date:"2026-04-12", tool:"Desktop", category:"데이터 분석","type":"Databricks-분석", desc:"커스텀탭 이용/미이용 유저 비교 분석 — 리텐션 20%p·GGMV +33%", hours:13, link:"" },
  { date:"2026-04-14", tool:"Code",    category:"PRD·설계",   type:"PRD-일반",          desc:"PRD: CMS 전략 컬렉션 생성 기능 이구위크 #3",            hours:20, link:"https://wiki.team.musinsa.com" },
  { date:"2026-04-15", tool:"Desktop", category:"전략·기획",  type:"프로토타입",        desc:"이구위크 구매 리워드 프로토타입 v2 — 5개 화면 HTML 제작", hours:5, link:"" },
  { date:"2026-04-16", tool:"Code",    category:"문서화",     type:"정책·가이드",       desc:"랭킹탭 선물 탭 이벤트 로그 정의서 4/1 배포",            hours:2,  link:"https://wiki.team.musinsa.com" },
  { date:"2026-04-17", tool:"Code",    category:"Jira",       type:"Epic",              desc:"#10 세일즈캠페인 모듈 확장 어드민 Epic",                hours:2,  link:"https://jira.team.musinsa.com" },
  { date:"2026-04-18", tool:"Desktop", category:"전략·기획",  type:"전략B",             desc:"원브랜드데이 성별 전환 토글 프로토타입 제작",            hours:5,  link:"" },
  { date:"2026-04-21", tool:"Code",    category:"PRD·설계",   type:"PRD-일반",          desc:"PRD: 이구위크 #11 UX/UI 고도화",                        hours:20, link:"https://wiki.team.musinsa.com" },
  { date:"2026-04-22", tool:"Desktop", category:"데이터 분석","type":"Amplitude-퍼널",  desc:"CMS 전략 컬렉션 PRD↔프로토타입 Gap 분석",              hours:3,  link:"" },
];

const CAT_META = {
  "PRD·설계":   { color:"#6366f1", icon:"📋" },
  "Jira":       { color:"#06b6d4", icon:"🎫" },
  "전략·기획":  { color:"#f59e0b", icon:"🧭" },
  "데이터 분석":{ color:"#10b981", icon:"📊" },
  "문서화":     { color:"#8b5cf6", icon:"📄" },
  "경쟁·리서치":{ color:"#f43f5e", icon:"🔍" },
};

const TOOL_COLOR = { Code:"#6366f1", Desktop:"#10b981" };

// ── 집계 헬퍼 ───────────────────────────────────────────────────────────────
function sum(arr, key) { return arr.reduce((a,b)=>a+(b[key]||0),0); }
function groupBy(arr, key) {
  return arr.reduce((m,x)=>{ m[x[key]]=(m[x[key]]||[]); m[x[key]].push(x); return m; },{});
}

export default function App() {
  const [tab, setTab]     = useState("overview");
  const [toolF, setToolF] = useState("전체");
  const [catF, setCatF]   = useState("전체");
  const [sort, setSort]   = useState("date");

  const filtered = SESSIONS.filter(s=>
    (toolF==="전체" || s.tool===toolF) &&
    (catF==="전체"  || s.category===catF)
  );
  const totalH   = sum(SESSIONS,"hours");
  const totalMD  = (totalH/8).toFixed(1);
  const catGroups= groupBy(SESSIONS,"category");
  const toolGroups=groupBy(SESSIONS,"tool");

  // 주차별 집계
  const weeks = {};
  SESSIONS.forEach(s=>{
    const d=new Date(s.date); const w=`${Math.ceil(d.getDate()/7)}주`;
    if(!weeks[w]) weeks[w]={Code:0,Desktop:0};
    weeks[w][s.tool]=(weeks[w][s.tool]||0)+s.hours;
  });

  const TABS = ["overview","카테고리","타임라인","전체내역"];

  return (
    <div style={{fontFamily:"'Pretendard','Apple SD Gothic Neo',sans-serif",background:"#0f1117",minHeight:"100vh",color:"#e2e8f0",padding:"0"}}>

      {/* 헤더 */}
      <div style={{background:"linear-gradient(135deg,#1e1b4b 0%,#0f1117 60%)",borderBottom:"1px solid #1e293b",padding:"20px 24px 0"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
          <div>
            <div style={{fontSize:11,color:"#6366f1",fontWeight:600,letterSpacing:2,marginBottom:6}}>29CM PM · AI 활용 성과 리포트</div>
            <h1 style={{fontSize:22,fontWeight:700,color:"#f8fafc",margin:0}}>📊 2026년 4월</h1>
            <div style={{fontSize:12,color:"#64748b",marginTop:4}}>김태호 · CE PM · 단가 기준 v2</div>
          </div>
          <div style={{background:"#1e293b",borderRadius:8,padding:"8px 14px",fontSize:12,color:"#94a3b8",border:"1px solid #334155"}}>
            AI-ASSISTED ✓
          </div>
        </div>

        {/* KPI 카드 */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
          {[
            {label:"총 AI 지원 건수",  val:`${SESSIONS.length}건`, sub:"전월 대비 +4건", color:"#6366f1"},
            {label:"절감 시간",        val:`${totalH}h`,           sub:`${totalMD} MD`,  color:"#10b981"},
            {label:"효율 배수",        val:"3.2×",                  sub:"평균 효율",       color:"#f59e0b"},
            {label:"산출물 링크",      val:`${SESSIONS.filter(s=>s.link).length}건`,sub:"Jira/Confluence", color:"#06b6d4"},
          ].map(k=>(
            <div key={k.label} style={{background:"#1e293b",borderRadius:10,padding:"14px 16px",borderTop:`2px solid ${k.color}`}}>
              <div style={{fontSize:11,color:"#64748b",marginBottom:6}}>{k.label}</div>
              <div style={{fontSize:22,fontWeight:700,color:k.color}}>{k.val}</div>
              <div style={{fontSize:11,color:"#475569",marginTop:4}}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* 탭 */}
        <div style={{display:"flex",gap:0,borderBottom:"1px solid #1e293b"}}>
          {[["overview","Overview"],["카테고리","카테고리별"],["타임라인","타임라인"],["전체내역","전체 내역"]].map(([v,l])=>(
            <button key={v} onClick={()=>setTab(v)} style={{
              background:"none",border:"none",padding:"10px 18px",fontSize:13,cursor:"pointer",
              color:tab===v?"#6366f1":"#64748b",
              borderBottom:tab===v?"2px solid #6366f1":"2px solid transparent",
              fontWeight:tab===v?600:400,transition:"all .15s"
            }}>{l}</button>
          ))}
        </div>
      </div>

      {/* 바디 */}
      <div style={{padding:24}}>

        {/* Overview */}
        {tab==="overview" && (
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>

            {/* 카테고리별 */}
            <div style={{background:"#1e293b",borderRadius:12,padding:20}}>
              <div style={{fontSize:13,fontWeight:600,marginBottom:16,color:"#cbd5e1"}}>카테고리별 절감 시간</div>
              {Object.entries(catGroups).sort((a,b)=>sum(b[1],"hours")-sum(a[1],"hours")).map(([cat,rows])=>{
                const h=sum(rows,"hours"); const pct=Math.round(h/totalH*100);
                const meta=CAT_META[cat]||{color:"#94a3b8",icon:"•"};
                return (
                  <div key={cat} style={{marginBottom:12}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:5}}>
                      <span>{meta.icon} {cat}</span>
                      <span style={{color:meta.color,fontWeight:600}}>{h}h · {rows.length}건</span>
                    </div>
                    <div style={{height:6,background:"#334155",borderRadius:3}}>
                      <div style={{width:`${pct}%`,height:"100%",background:meta.color,borderRadius:3,transition:"width .4s"}}/>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 도구별 */}
            <div style={{background:"#1e293b",borderRadius:12,padding:20}}>
              <div style={{fontSize:13,fontWeight:600,marginBottom:16,color:"#cbd5e1"}}>도구별 분석</div>
              {Object.entries(toolGroups).map(([tool,rows])=>{
                const h=sum(rows,"hours"); const pct=Math.round(h/totalH*100);
                const color=TOOL_COLOR[tool]||"#94a3b8";
                return (
                  <div key={tool} style={{marginBottom:16}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:6}}>
                      <span style={{fontWeight:600,color}}>{tool}</span>
                      <span>{h}h · {rows.length}건 ({pct}%)</span>
                    </div>
                    <div style={{height:8,background:"#334155",borderRadius:4}}>
                      <div style={{width:`${pct}%`,height:"100%",background:color,borderRadius:4}}/>
                    </div>
                    <div style={{fontSize:11,color:"#475569",marginTop:6}}>
                      주요: {[...new Set(rows.map(r=>r.category))].slice(0,2).join(" · ")}
                    </div>
                  </div>
                );
              })}

              {/* 하이라이트 */}
              <div style={{marginTop:16,padding:14,background:"#0f1117",borderRadius:8,border:"1px solid #334155"}}>
                <div style={{fontSize:11,color:"#6366f1",fontWeight:600,marginBottom:8}}>✨ 이달의 하이라이트</div>
                <div style={{fontSize:12,color:"#94a3b8",lineHeight:1.7}}>
                  이구위크 Q2 이니셔티브 PRD 3건 + Epic 5건을 AI와 병렬 작성.<br/>
                  CMS 전략 컬렉션은 PRD → 와이어프레임 → Gap 분석까지 1일 내 완결.<br/>
                  프로토타입 3건 HTML 직접 구현으로 디자인 핸드오프 전 인터랙션 검증 완료.
                </div>
              </div>
            </div>

            {/* 절감 단가 근거 */}
            <div style={{background:"#1e293b",borderRadius:12,padding:20,gridColumn:"1/-1"}}>
              <div style={{fontSize:13,fontWeight:600,marginBottom:14,color:"#cbd5e1"}}>절감 시간 추정 근거</div>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                  <thead>
                    <tr style={{borderBottom:"1px solid #334155",color:"#64748b"}}>
                      {["유형","건수","단가","소계","비중"].map(h=>(
                        <th key={h} style={{padding:"8px 12px",textAlign:"left",fontWeight:500}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {type:"2-Pager 표준",   cnt:1, rate:32,  sub:32},
                      {type:"PRD 일반",        cnt:4, rate:20,  sub:80},
                      {type:"Initiative",     cnt:1, rate:4,   sub:4},
                      {type:"Epic",           cnt:5, rate:2,   sub:10},
                      {type:"Databricks 분석",cnt:1, rate:13,  sub:13},
                      {type:"Amplitude 퍼널", cnt:1, rate:3,   sub:3},
                      {type:"전략B 문서",     cnt:2, rate:8.5, sub:17},
                      {type:"정책·가이드",    cnt:1, rate:2,   sub:2},
                    ].map(r=>(
                      <tr key={r.type} style={{borderBottom:"1px solid #1e293b"}}>
                        <td style={{padding:"8px 12px",color:"#cbd5e1"}}>{r.type}</td>
                        <td style={{padding:"8px 12px"}}>{r.cnt}건</td>
                        <td style={{padding:"8px 12px",color:"#64748b"}}>{r.rate}h</td>
                        <td style={{padding:"8px 12px",color:"#6366f1",fontWeight:600}}>{r.sub}h</td>
                        <td style={{padding:"8px 12px",color:"#475569"}}>{Math.round(r.sub/totalH*100)}%</td>
                      </tr>
                    ))}
                    <tr style={{background:"#0f1117",fontWeight:700}}>
                      <td colSpan={3} style={{padding:"10px 12px",color:"#cbd5e1"}}>합계</td>
                      <td style={{padding:"10px 12px",color:"#10b981",fontSize:14}}>{totalH}h</td>
                      <td style={{padding:"10px 12px",color:"#64748b"}}>100%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div style={{fontSize:11,color:"#475569",marginTop:10}}>
                ※ 절감 시간 = AI 없이 동일 산출물 직접 작성 시 예상 소요 시간 기준 추정치.<br/>
                단가 기준: <a href="https://wiki.team.musinsa.com/wiki/spaces/~shin.han/pages/383353087" style={{color:"#6366f1"}}>29CM PM AI 활용 공통 가이드 v2</a>
              </div>
            </div>
          </div>
        )}

        {/* 카테고리별 */}
        {tab==="카테고리" && (
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:14}}>
            {Object.entries(catGroups).map(([cat,rows])=>{
              const meta=CAT_META[cat]||{color:"#94a3b8",icon:"•"};
              const h=sum(rows,"hours");
              return (
                <div key={cat} style={{background:"#1e293b",borderRadius:12,padding:18,borderLeft:`3px solid ${meta.color}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                    <div style={{fontSize:14,fontWeight:600}}>{meta.icon} {cat}</div>
                    <div style={{fontSize:12,color:meta.color,fontWeight:700}}>{h}h · {rows.length}건</div>
                  </div>
                  {rows.slice(0,3).map((r,i)=>(
                    <div key={i} style={{fontSize:12,color:"#94a3b8",padding:"5px 0",borderBottom:"1px solid #334155",display:"flex",justifyContent:"space-between"}}>
                      <span style={{flex:1,marginRight:8,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.desc}</span>
                      <span style={{color:meta.color,whiteSpace:"nowrap"}}>{r.hours}h</span>
                    </div>
                  ))}
                  {rows.length>3 && <div style={{fontSize:11,color:"#475569",marginTop:8}}>외 {rows.length-3}건</div>}
                </div>
              );
            })}
          </div>
        )}

        {/* 타임라인 */}
        {tab==="타임라인" && (
          <div style={{background:"#1e293b",borderRadius:12,padding:20}}>
            <div style={{fontSize:13,fontWeight:600,marginBottom:20,color:"#cbd5e1"}}>주차별 절감 시간 추이</div>
            {Object.entries(weeks).map(([w,data])=>{
              const total=data.Code+data.Desktop; const max=Math.max(...Object.values(weeks).map(d=>d.Code+d.Desktop));
              return (
                <div key={w} style={{marginBottom:16}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:6}}>
                    <span style={{color:"#94a3b8"}}>{w}</span>
                    <span style={{color:"#cbd5e1",fontWeight:600}}>{total}h</span>
                  </div>
                  <div style={{height:20,background:"#334155",borderRadius:4,display:"flex",overflow:"hidden"}}>
                    <div style={{width:`${data.Code/max*100}%`,background:"#6366f1",transition:"width .4s"}}/>
                    <div style={{width:`${data.Desktop/max*100}%`,background:"#10b981",transition:"width .4s"}}/>
                  </div>
                  <div style={{display:"flex",gap:12,fontSize:11,color:"#475569",marginTop:5}}>
                    <span>🟣 Code {data.Code}h</span>
                    <span>🟢 Desktop {data.Desktop}h</span>
                  </div>
                </div>
              );
            })}
            <div style={{display:"flex",gap:20,marginTop:16,padding:"12px 16px",background:"#0f1117",borderRadius:8,fontSize:12}}>
              <span>🟣 Claude Code: {sum(toolGroups["Code"]||[],"hours")}h</span>
              <span>🟢 Claude Desktop: {sum(toolGroups["Desktop"]||[],"hours")}h</span>
            </div>
          </div>
        )}

        {/* 전체 내역 */}
        {tab==="전체내역" && (
          <div>
            <div style={{display:"flex",gap:10,marginBottom:16}}>
              {["전체","Code","Desktop"].map(v=>(
                <button key={v} onClick={()=>setToolF(v)} style={{
                  background:toolF===v?"#6366f1":"#1e293b",border:"1px solid",
                  borderColor:toolF===v?"#6366f1":"#334155",
                  color:toolF===v?"white":"#94a3b8",
                  padding:"6px 14px",borderRadius:6,fontSize:12,cursor:"pointer"
                }}>{v}</button>
              ))}
              <select onChange={e=>setCatF(e.target.value)} value={catF} style={{
                background:"#1e293b",border:"1px solid #334155",color:"#94a3b8",
                padding:"6px 12px",borderRadius:6,fontSize:12,marginLeft:"auto"
              }}>
                {["전체",...Object.keys(CAT_META)].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={{background:"#1e293b",borderRadius:12,overflow:"hidden"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead>
                  <tr style={{background:"#0f1117",color:"#64748b"}}>
                    {["날짜","도구","카테고리","유형/스코프","작업 내용","절감시간","링크"].map(h=>(
                      <th key={h} style={{padding:"10px 12px",textAlign:"left",fontWeight:500}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r,i)=>{
                    const meta=CAT_META[r.category]||{color:"#94a3b8"};
                    return (
                      <tr key={i} style={{borderBottom:"1px solid #1a2332",transition:"background .1s"}}
                        onMouseEnter={e=>e.currentTarget.style.background="#243044"}
                        onMouseLeave={e=>e.currentTarget.style.background=""}>
                        <td style={{padding:"9px 12px",color:"#64748b",whiteSpace:"nowrap"}}>{r.date.slice(5)}</td>
                        <td style={{padding:"9px 12px"}}>
                          <span style={{background:TOOL_COLOR[r.tool]+"22",color:TOOL_COLOR[r.tool],padding:"2px 7px",borderRadius:4,fontSize:11,fontWeight:600}}>{r.tool}</span>
                        </td>
                        <td style={{padding:"9px 12px",color:meta.color}}>{r.category}</td>
                        <td style={{padding:"9px 12px",color:"#64748b",fontSize:11}}>{r.type}</td>
                        <td style={{padding:"9px 12px",color:"#cbd5e1",maxWidth:260,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.desc}</td>
                        <td style={{padding:"9px 12px",color:meta.color,fontWeight:600}}>{r.hours}h</td>
                        <td style={{padding:"9px 12px"}}>
                          {r.link ? <a href={r.link} style={{color:"#6366f1",fontSize:11}}>↗</a> : <span style={{color:"#334155"}}>-</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div style={{padding:"10px 12px",fontSize:12,color:"#475569",borderTop:"1px solid #334155"}}>
                {filtered.length}건 표시 중 / 전체 {SESSIONS.length}건 · 합계 {sum(filtered,"hours")}h
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
