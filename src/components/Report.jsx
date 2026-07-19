import React, { useState } from 'react';
import { FileText, CheckCircle, Award, Printer, ChevronLeft, Sparkles, AlertCircle } from 'lucide-react';

function Report({ scannedData, prevPhase }) {
  const [studentInfo, setStudentInfo] = useState({
    name: '',
    studentId: '',
  });

  // Table inputs for lambda max
  const [lambdaInputs, setLambdaInputs] = useState({
    blank: '없음 (증류수 바탕 시료)',
    c1: '',
    c2: '',
    c3: '',
  });

  // Descriptive answers
  const [answers, setAnswers] = useState({
    q1: '',
    q2: '',
    q3: '',
    q4: '',
    q5: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [evaluation, setEvaluation] = useState(null);

  // AI evaluation logic (keyword analysis)
  const evaluateReport = () => {
    if (!studentInfo.name || !studentInfo.studentId) {
      alert("이름과 학번을 먼저 입력해 주세요!");
      return;
    }

    let score = 0;
    const feedbacks = [];

    // Table verification (approximate lambda max values)
    const t1 = parseFloat(lambdaInputs.c1);
    const t2 = parseFloat(lambdaInputs.c2);
    const t3 = parseFloat(lambdaInputs.c3);

    const isC1Correct = t1 >= 730 && t1 <= 750;
    const isC2Correct = t2 >= 600 && t2 <= 620;
    const isC3Correct = t3 >= 620 && t3 <= 640;

    let tableScore = 0;
    if (isC1Correct) tableScore += 10;
    if (isC2Correct) tableScore += 10;
    if (isC3Correct) tableScore += 10;
    score += tableScore;

    feedbacks.push({
      title: "최대 흡수 파장 데이터 테이블 검증",
      passed: isC1Correct && isC2Correct && isC3Correct,
      desc: `실험값 매칭 결과: 
        - NaCl 반응(①): ${t1} nm (${isC1Correct ? '정확함 - 이론치 약 740 nm' : '오차 있음 - 이론치 740 nm'})
        - 암모니아 반응(②): ${t2} nm (${isC2Correct ? '정확함 - 이론치 약 610 nm' : '오차 있음 - 이론치 610 nm'})
        - 글라이신 반응(③): ${t3} nm (${isC3Correct ? '정확함 - 이론치 약 630 nm' : '오차 있음 - 이론치 630 nm'})`
    });

    // Q1 Evaluation: Complementary Colors
    const q1Keywords = ['보색', '흡수', '반사', '통과', '색상'];
    const q1Matches = q1Keywords.filter(kw => answers.q1.toLowerCase().includes(kw));
    const q1Score = q1Matches.length >= 2 ? 14 : q1Matches.length * 6;
    score += q1Score;
    feedbacks.push({
      title: "탐구 1: 보색 관계와 흡수 스펙트럼",
      score: q1Score,
      max: 14,
      matches: q1Matches,
      desc: q1Score >= 12 
        ? "훌륭합니다! 물질의 고유한 색상은 흡수된 빛의 '보색'에 해당하는 파장이 반사/투과되어 우리 눈에 보인다는 점을 명확히 설명했습니다."
        : "보색(Complementary Color)과 빛의 흡수/반사 메커니즘을 연관 지어 보완 설명해 보세요."
    });

    // Q2 Evaluation: Dilution (Beer-Lambert law)
    const q2Keywords = ['비어', '람베르트', '흡광도', '포화', '농도', '검출', '한계'];
    const q2Matches = q2Keywords.filter(kw => answers.q2.toLowerCase().includes(kw));
    const q2Score = q2Matches.length >= 2 ? 14 : q2Matches.length * 6;
    score += q2Score;
    feedbacks.push({
      title: "탐구 2: 용액을 희석한 이유 (비어-람베르트 법칙)",
      score: q2Score,
      max: 14,
      matches: q2Matches,
      desc: q2Score >= 12
        ? "잘 작성하셨습니다. 흡광도가 너무 높으면 빛이 대부분 흡수되어 분광 장비의 검출 한계를 넘어서(포화 상태) 농도와 흡광도의 비례 관계(비어-람베르트 법칙)가 깨진다는 핵심을 짚었습니다."
        : "흡광도가 너무 높을 때의 기기 측정 한계 및 농도-흡광도 법칙(Beer-Lambert Law)을 서술해 주세요."
    });

    // Q3 Evaluation: Spectrochemical series order
    const q3Answers = ['cl', 'h2o', 'gly', 'nh3'];
    const q3AnsNorm = answers.q3.replace(/\s+/g, '').toLowerCase();
    
    // Check if the order is correct (e.g. Cl- < H2O < Gly < NH3)
    const orderCorrect = q3AnsNorm.includes('cl') && q3AnsNorm.includes('h2o') && q3AnsNorm.includes('gly') && q3AnsNorm.includes('nh3') &&
                         q3AnsNorm.indexOf('cl') < q3AnsNorm.indexOf('h2o') &&
                         q3AnsNorm.indexOf('h2o') < q3AnsNorm.indexOf('gly') &&
                         q3AnsNorm.indexOf('gly') < q3AnsNorm.indexOf('nh3');
                         
    const q3Score = orderCorrect ? 14 : 0;
    score += q3Score;
    feedbacks.push({
      title: "탐구 3: 분광화학적 계열과 리간드 장 세기",
      score: q3Score,
      max: 14,
      passed: orderCorrect,
      desc: orderCorrect
        ? "정확합니다! 리간드의 d오비탈 갈라짐 에너지 세기 순서는 Cl⁻ < H₂O < Glycine < NH₃ 순서입니다. 파장이 짧을수록 에너지가 크므로 갈라짐이 큰 강한 장 리간드입니다."
        : "스펙트럼의 피크 파장(λ_max)이 짧을수록 에너지가 큽니다. 에너지가 클수록 d오비탈 갈라짐이 큰 강한 장 리간드이므로 순서를 다시 검토해 보세요."
    });

    // Q4 Evaluation: Le Chatelier Principle
    const q4Keywords = ['평형', '르샤틀리에', '역반응', '왼쪽', '푸른', '하늘', '감소'];
    const q4Matches = q4Keywords.filter(kw => answers.q4.toLowerCase().includes(kw));
    const q4Score = q4Matches.length >= 2 ? 14 : q4Matches.length * 6;
    score += q4Score;
    feedbacks.push({
      title: "탐구 4: 물 추가 시 변화 (르샤틀리에 원리)",
      score: q4Score,
      max: 14,
      matches: q4Matches,
      desc: q4Score >= 12
        ? "뛰어난 해석입니다! 증류수를 많이 가하면 물 분자의 농도가 크게 높아져 평형이 역반응(왼쪽)으로 이동하게 되고, 이에 따라 녹색/황록색에서 다시 하늘색 푸른빛([Cu(H₂O)₆]²⁺)으로 돌아갑니다."
        : "르샤틀리에 원리에 따라 용매인 물을 대량 가했을 때 평형 이동의 방향과 수용액의 색깔 복원 여부를 확인해 보세요."
    });

    // Q5 Evaluation: Chelate Effect
    const q5Keywords = ['킬레이트', '두자리', '고리', '안정', '엔트로피', '배위'];
    const q5Matches = q5Keywords.filter(kw => answers.q5.toLowerCase().includes(kw));
    const q5Score = q5Matches.length >= 2 ? 14 : q5Matches.length * 6;
    score += q5Score;
    feedbacks.push({
      title: "탐구 5: 킬레이트 효과 (글라이신 배위)",
      score: q5Score,
      max: 14,
      matches: q5Matches,
      desc: q5Score >= 12
        ? "매우 훌륭합니다. 글라이신은 한 분자에 두 배위 원자(N, O)를 가져 금속 이온을 고리 형태로 감싸는 '두자리 킬레이트 리간드'를 형성하여, 한자리 리간드인 암모니아에 비해 엔트로피적/구조적으로 훨씬 안정한 착화합물을 만든다는 킬레이트 효과를 정교히 파악했습니다."
        : "글라이신이 왜 '두자리 리간드'인지, 킬레이트 효과(Chelate Effect)가 착화합물 안정성에 어떤 기여를 하는지 적어 보세요."
    });

    setEvaluation({
      totalScore: score,
      feedbacks: feedbacks
    });
    setSubmitted(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="report-grid">
      {/* Report Form */}
      <div className="glass-card report-form">
        <div>
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={24} color="var(--accent-purple)" />
            <span>화학부 실험 탐구 활동 보고서</span>
          </h2>
          <p className="card-subtitle">황산구리 수용액의 리간드 교환 반응에 따른 분광학적 분석 결과 리포트</p>
        </div>

        {/* Student identification */}
        <div className="report-section student-info">
          <div className="input-group">
            <label className="input-label">학생 이름</label>
            <input 
              type="text" 
              placeholder="예: 홍길동"
              className="text-input"
              value={studentInfo.name}
              onChange={(e) => setStudentInfo(prev => ({ ...prev, name: e.target.value }))}
              disabled={submitted}
            />
          </div>
          <div className="input-group">
            <label className="input-label">학번 (또는 조 이름)</label>
            <input 
              type="text" 
              placeholder="예: 20101"
              className="text-input"
              value={studentInfo.studentId}
              onChange={(e) => setStudentInfo(prev => ({ ...prev, studentId: e.target.value }))}
              disabled={submitted}
            />
          </div>
        </div>

        {/* Part 1: Data Table */}
        <div className="report-section">
          <div className="section-num-title">
            <span className="section-num">1</span>
            <span>최대 흡수 파장 (λ_max) 측정 결과 표</span>
          </div>
          <p className="question-text" style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem' }}>
            가상 UV-Vis 분석 장치에서 스펙트럼 피크를 확인하여 각 수용액의 최대 흡수 파장을 정수로 기록하세요.
          </p>

          <div className="table-wrapper">
            <table className="report-table">
              <thead>
                <tr>
                  <th>구분</th>
                  <th>석영 큐벳에 넣은 물질</th>
                  <th>관찰된 용액 색상</th>
                  <th>최대 흡수 파장 (λ_max, nm)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>B (바탕 시료)</b></td>
                  <td>증류수 (D.W.)</td>
                  <td>무색 투명</td>
                  <td>
                    <input 
                      type="text" 
                      className="table-input" 
                      value={lambdaInputs.blank} 
                      disabled
                    />
                  </td>
                </tr>
                <tr>
                  <td><b>수용액 ①</b></td>
                  <td>0.1M CuSO₄ + 포화 NaCl</td>
                  <td>황록색</td>
                  <td>
                    <input 
                      type="number" 
                      placeholder="숫자 입력"
                      className="table-input"
                      value={lambdaInputs.c1}
                      onChange={(e) => setLambdaInputs(prev => ({ ...prev, c1: e.target.value }))}
                      disabled={submitted}
                    />
                  </td>
                </tr>
                <tr>
                  <td><b>수용액 ②</b></td>
                  <td>0.1M CuSO₄ + 과량 NH₃ (10배 희석)</td>
                  <td>청람색 (짙은 파랑)</td>
                  <td>
                    <input 
                      type="number" 
                      placeholder="숫자 입력"
                      className="table-input"
                      value={lambdaInputs.c2}
                      onChange={(e) => setLambdaInputs(prev => ({ ...prev, c2: e.target.value }))}
                      disabled={submitted}
                    />
                  </td>
                </tr>
                <tr>
                  <td><b>수용액 ③</b></td>
                  <td>0.1M CuSO₄ + 글라이신 (10배 희석)</td>
                  <td>보라색 / 파란색</td>
                  <td>
                    <input 
                      type="number" 
                      placeholder="숫자 입력"
                      className="table-input"
                      value={lambdaInputs.c3}
                      onChange={(e) => setLambdaInputs(prev => ({ ...prev, c3: e.target.value }))}
                      disabled={submitted}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Part 2: Descriptive Questions */}
        <div className="report-section">
          <div className="section-num-title">
            <span className="section-num">2</span>
            <span>결과 해석 및 서술형 탐구 질문</span>
          </div>

          {/* Q1 */}
          <div className="question-card">
            <p className="question-text">
              <b>Q1.</b> 각 수용액이 실제로 띠는 색상(예: 황록색, 청람색)과 UV-Vis 스펙트럼에서 확인한 최대 흡수 파장의 색상 사이에는 어떤 관계가 있는가? <b>'보색(Complementary color)'</b>의 개념을 사용하여 설명하시오.
            </p>
            <textarea 
              className="textarea-input"
              placeholder="답변을 작성해 주세요..."
              value={answers.q1}
              onChange={(e) => setAnswers(prev => ({ ...prev, q1: e.target.value }))}
              disabled={submitted}
            />
          </div>

          {/* Q2 */}
          <div className="question-card">
            <p className="question-text">
              <b>Q2.</b> 포화 NaCl 수용액을 넣은 용액과 달리, 진한 암모니아수와 글라이신 수용액을 넣은 용액은 측정 전 왜 증류수로 10배 희석해야만 했는가? (<b>몰흡광계수</b>와 <b>비어-람베르트 법칙</b>을 참고할 것)
            </p>
            <textarea 
              className="textarea-input"
              placeholder="답변을 작성해 주세요..."
              value={answers.q2}
              onChange={(e) => setAnswers(prev => ({ ...prev, q2: e.target.value }))}
              disabled={submitted}
            />
          </div>

          {/* Q3 */}
          <div className="question-card">
            <p className="question-text">
              <b>Q3.</b> 실험 데이터를 바탕으로 결합한 네 가지 리간드(H₂O, Cl⁻, NH₃, 글라이신)를 d 오비탈을 크게 갈라지게 하는 <b>'강한 장 리간드'부터 '약한 장 리간드'</b> 순서대로 나열해 보시오. (예: NH3 &gt; 글라이신 &gt; H2O &gt; Cl- 와 같이 부등호 기입)
            </p>
            <textarea 
              className="textarea-input"
              placeholder="예: NH3 > Glycine > H2O > Cl- "
              value={answers.q3}
              onChange={(e) => setAnswers(prev => ({ ...prev, q3: e.target.value }))}
              disabled={submitted}
            />
          </div>

          {/* Q4 */}
          <div className="question-card">
            <p className="question-text">
              <b>Q4.</b> 포화 NaCl 수용액을 가해 황록색으로 변한 용액(①번 용액)에 다시 다량의 증류수를 붓는다면 수용액의 색과 UV-Vis 스펙트럼의 피크 위치는 어떻게 변할지 예측하고, <b>르샤틀리에 원리</b>를 적용하여 설명하시오.
            </p>
            <textarea 
              className="textarea-input"
              placeholder="답변을 작성해 주세요..."
              value={answers.q4}
              onChange={(e) => setAnswers(prev => ({ ...prev, q4: e.target.value }))}
              disabled={submitted}
            />
          </div>

          {/* Q5 */}
          <div className="question-card">
            <p className="question-text">
              <b>Q5.</b> 암모니아(NH₃)와 글라이신은 둘 다 질소(N)의 비공유 전자쌍을 제공하는 리간드임에도 불구하고 최대 흡수 파장과 착합물 안정성에 차이가 발생했다. 글라이신만의 구조적 특징(<b>킬레이트 결합</b>)이 착화합물에 어떤 영향을 미치는지 서술하시오.
            </p>
            <textarea 
              className="textarea-input"
              placeholder="답변을 작성해 주세요..."
              value={answers.q5}
              onChange={(e) => setAnswers(prev => ({ ...prev, q5: e.target.value }))}
              disabled={submitted}
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button className="control-btn" onClick={prevPhase} disabled={submitted}>
            <ChevronLeft size={14} style={{ marginRight: '4px' }} />
            <span>이전 단계로 이동</span>
          </button>
          {!submitted ? (
            <button className="control-btn primary" onClick={evaluateReport}>
              <Sparkles size={16} style={{ marginRight: '6px' }} />
              <span>보고서 제출 및 AI 피드백 확인</span>
            </button>
          ) : (
            <button className="control-btn" onClick={() => setSubmitted(false)}>
              <RefreshCw size={14} style={{ marginRight: '4px' }} />
              <span>답안 수정</span>
            </button>
          )}
          {submitted && (
            <button className="control-btn primary" onClick={handlePrint} style={{ background: '#7c3aed', color: '#fff' }}>
              <Printer size={16} style={{ marginRight: '6px' }} />
              <span>인쇄 및 PDF로 보고서 내보내기</span>
            </button>
          )}
        </div>
      </div>

      {/* AI Evaluation Sidebar */}
      <div className="feedback-sidebar">
        {!submitted ? (
          <div className="feedback-status glass-card">
            <AlertCircle size={32} style={{ color: 'var(--accent-purple)', margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#fff', marginBottom: '0.5rem' }}>AI 채점 대기</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>
              좌측의 보고서 양식을 다 채워넣으신 후 <b>'보고서 제출 및 AI 피드백 확인'</b> 버튼을 눌러주세요.
            </p>
          </div>
        ) : (
          <div className="feedback-card">
            <div className="feedback-title">
              <Award size={20} />
              <span>AI 종합 평가 및 학업 성취도</span>
            </div>

            <div className="score-display">
              <span className="score-num">{evaluation.totalScore}</span>
              <span className="score-total">/ 100 점</span>
            </div>

            <div className="feedback-list">
              {evaluation.feedbacks.map((f, idx) => (
                <div key={idx} className="feedback-item">
                  <div style={{ fontWeight: 'bold', color: '#fff', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                    {f.title}
                  </div>
                  {f.matches && f.matches.length > 0 && (
                    <div style={{ marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>검출된 학술 핵심 키워드: </span>
                      {f.matches.map((kw, kidx) => (
                        <span key={kidx} className="feedback-keyword-match" style={{ fontSize: '0.75rem', marginRight: '4px', background: 'rgba(52,211,153,0.1)', padding: '1px 4px', borderRadius: '4px' }}>
                          #{kw}
                        </span>
                      ))}
                    </div>
                  )}
                  <p style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>{f.desc}</p>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4 }}>
              <span style={{ fontWeight: 'bold', color: '#cbd5e1' }}>💡 학업 도움 팁:</span> 인쇄 또는 PDF 저장 버튼을 눌러 피드백 내용까지 보고서로 출력해 동아리 활동 기록으로 제출할 수 있습니다.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Report;
