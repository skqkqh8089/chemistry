import React, { useState } from 'react';
import './App.css';
import { ShieldCheck, Pipette, Activity, FileSpreadsheet, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import LabBench from './components/LabBench';
import Spectroscopy from './components/Spectroscopy';
import Report from './components/Report';

function App() {
  // Navigation step state
  // 0: Safety, 1: Prep CuSO4, 2: Reactions (NaCl, NH3, Glycine), 3: UV-Vis, 4: Report
  const [currentStep, setCurrentStep] = useState(0);
  
  // Safety equipment status
  const [safety, setSafety] = useState({
    goggles: false,
    mask: false,
    gloves: false,
  });

  // Lab progress state
  const [labProgress, setLabProgress] = useState({
    cuso4Prepared: false,   // 0.1M CuSO4 solution made
    naclFinished: false,    // Reaction 1 done (c1 ready)
    nh3Finished: false,     // Reaction 2 done (c2 ready)
    glycineFinished: false, // Reaction 3 done (c3 ready)
  });

  // Cuvette statuses (slots: 0 = Blank(water), 1 = NaCl, 2 = NH3(diluted), 3 = Glycine(diluted))
  const [cuvettesInRack, setCuvettesInRack] = useState({
    blank: true, // Blank (water) is always ready
    c1: false,   // NaCl solution
    c2: false,   // NH3 solution
    c3: false,   // Glycine solution
  });

  // Spectrometer status
  const [scannedData, setScannedData] = useState({
    blank: false,
    c1: false,
    c2: false,
    c3: false,
  });

  const isSafetyAllEquipped = safety.goggles && safety.mask && safety.gloves;

  // Toggle safety gear
  const toggleSafety = (item) => {
    setSafety(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  // Skip or go to step if safety is all equipped
  const navigateToStep = (step) => {
    if (!isSafetyAllEquipped && step > 0) {
      alert("실험을 시작하기 전에 보안경, 마스크, 실험용 장갑을 모두 착용해야 합니다!");
      return;
    }
    setCurrentStep(step);
  };

  // Define steps
  const stepsList = [
    { id: 0, label: "안전 장비 착용", icon: <ShieldCheck size={18} /> },
    { id: 1, label: "실험 및 시약 제조", icon: <Pipette size={18} /> },
    { id: 2, label: "UV-Vis 분광 분석", icon: <Activity size={18} /> },
    { id: 3, label: "보고서 및 AI 피드백", icon: <FileSpreadsheet size={18} /> },
  ];

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="logo-section">
          <div className="logo-icon">
            <Activity size={32} />
          </div>
          <div className="logo-text">
            <h1>황산구리 리간드 교환 반응</h1>
            <p>휘문고등학교 화학 동아리 가상 실험실</p>
          </div>
        </div>

        {/* Steps navigation */}
        <nav className="nav-steps">
          {stepsList.map((step) => {
            const isActive = currentStep === step.id;
            const isCompleted = isSafetyAllEquipped && (
              (step.id === 0) ||
              (step.id === 1 && labProgress.naclFinished && labProgress.nh3Finished && labProgress.glycineFinished) ||
              (step.id === 2 && scannedData.c1 && scannedData.c2 && scannedData.c3)
            );
            
            return (
              <button
                key={step.id}
                onClick={() => navigateToStep(step.id)}
                className={`step-btn ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                disabled={step.id > 0 && !isSafetyAllEquipped}
              >
                {step.icon}
                <span>{step.label}</span>
              </button>
            );
          })}
        </nav>
      </header>

      {/* Main Workspace */}
      <main className="app-content">
        {/* Phase 0: Safety Gear */}
        {currentStep === 0 && (
          <div className="glass-card safety-layout">
            <h2 className="card-title">안전한 실험을 위한 준비</h2>
            <p className="card-subtitle">실험에 참여하기 전, 안전 수칙을 준수하기 위해 개인 보호구(PPE)를 반드시 착용해 주세요.</p>
            
            <div className="safety-grid">
              <div 
                className={`safety-item ${safety.goggles ? 'equipped' : ''}`}
                onClick={() => toggleSafety('goggles')}
              >
                <div className="safety-icon-wrapper">🥽</div>
                <h3>보안경 (Goggles)</h3>
                <p>화학 물질이 눈에 튀는 것을 방지합니다.</p>
                <span style={{ fontSize: '0.8rem', marginTop: '8px', color: safety.goggles ? 'var(--accent-green)' : '#ef4444', fontWeight: 'bold' }}>
                  {safety.goggles ? '착용 완료' : '착용 필요'}
                </span>
              </div>

              <div 
                className={`safety-item ${safety.mask ? 'equipped' : ''}`}
                onClick={() => toggleSafety('mask')}
              >
                <div className="safety-icon-wrapper">😷</div>
                <h3>실험용 마스크 (Mask)</h3>
                <p>진한 암모니아수 증기 등 유해 가스 흡입을 예방합니다.</p>
                <span style={{ fontSize: '0.8rem', marginTop: '8px', color: safety.mask ? 'var(--accent-green)' : '#ef4444', fontWeight: 'bold' }}>
                  {safety.mask ? '착용 완료' : '착용 필요'}
                </span>
              </div>

              <div 
                className={`safety-item ${safety.gloves ? 'equipped' : ''}`}
                onClick={() => toggleSafety('gloves')}
              >
                <div className="safety-icon-wrapper">🧤</div>
                <h3>니트릴 장갑 (Gloves)</h3>
                <p>강산/강염기 및 화학 반응물로부터 손을 보호합니다.</p>
                <span style={{ fontSize: '0.8rem', marginTop: '8px', color: safety.gloves ? 'var(--accent-green)' : '#ef4444', fontWeight: 'bold' }}>
                  {safety.gloves ? '착용 완료' : '착용 필요'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              {!isSafetyAllEquipped && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-rose)', fontSize: '0.85rem' }}>
                  <AlertTriangle size={16} />
                  <span>모든 안전 장비를 클릭하여 착용해야 실험실에 입장할 수 있습니다.</span>
                </div>
              )}
              <button
                className="action-btn"
                disabled={!isSafetyAllEquipped}
                onClick={() => setCurrentStep(1)}
              >
                <CheckCircle size={18} />
                <span>가상 실험실 입장</span>
              </button>
            </div>
          </div>
        )}

        {/* Phase 1: Lab Bench (Solution Preparation and Ligand exchange) */}
        {currentStep === 1 && (
          <LabBench 
            progress={labProgress}
            setProgress={setLabProgress}
            setCuvettes={setCuvettesInRack}
            nextPhase={() => setCurrentStep(2)}
          />
        )}

        {/* Phase 2: UV-Vis Spectroscopy */}
        {currentStep === 2 && (
          <Spectroscopy 
            cuvettes={cuvettesInRack}
            scannedData={scannedData}
            setScannedData={setScannedData}
            nextPhase={() => setCurrentStep(3)}
            prevPhase={() => setCurrentStep(1)}
          />
        )}

        {/* Phase 3: Reports & AI evaluation */}
        {currentStep === 3 && (
          <Report 
            scannedData={scannedData}
            prevPhase={() => setCurrentStep(2)}
          />
        )}
      </main>
    </div>
  );
}

export default App;
