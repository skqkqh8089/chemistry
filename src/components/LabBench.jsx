import React, { useState, useEffect } from 'react';
import { HelpCircle, ChevronRight, RefreshCw, AlertCircle, Droplet, Sparkles, Scale, Info } from 'lucide-react';

function LabBench({ progress, setProgress, setCuvettes, nextPhase }) {
  // Current active sub-experiment
  // 0: CuSO4 Prep, 1: NaCl Rx, 2: NH3 Rx, 3: Glycine Rx
  const [activeTab, setActiveTab] = useState(0);
  
  // Sub-step indicator inside each tab
  const [subStep, setSubStep] = useState(0);
  
  // Interaction animation and temporary states
  const [loading, setLoading] = useState(false);
  const [dropAnimation, setDropAnimation] = useState(false);
  const [dropColor, setDropColor] = useState('var(--accent-blue)');
  const [liquidLevel, setLiquidLevel] = useState(0); // 0 to 100
  const [liquidColor, setLiquidColor] = useState('var(--color-water)');
  const [stirring, setStirring] = useState(false);
  
  // Animation states
  const [isTransferringSolid, setIsTransferringSolid] = useState(false);
  const [isPouring, setIsPouring] = useState(false);
  const [isPipetting, setIsPipetting] = useState(false);
  const [isPouringGlycine, setIsPouringGlycine] = useState(false);
  const [hasSolidInBeaker, setHasSolidInBeaker] = useState(false);
  
  // Specific states for CuSO4 Prep (activeTab 0)
  const [scaleState, setScaleState] = useState({
    power: false,
    tare: false,
    weight: 0.00, // g
  });
  const [beakerLiquid, setBeakerLiquid] = useState(0); // mL
  const [flaskLiquid, setFlaskLiquid] = useState(0); // mL
  const [rinseCount, setRinseCount] = useState(0);
  const [shaken, setShaken] = useState(false);
  const [isPipetting1, setIsPipetting1] = useState(false);
  const [isPipetting2, setIsPipetting2] = useState(false);
  const [dilutionBeakerLiquid, setDilutionBeakerLiquid] = useState(0);
  const [dilutionBeakerColor, setDilutionBeakerColor] = useState('transparent');
  const [pipetteLiquidHeight, setPipetteLiquidHeight] = useState(0);
  const [waterPipetteHeight, setWaterPipetteHeight] = useState(70);

  // Specific states for NaCl Rx (activeTab 1)
  const [naclState, setNaclState] = useState({
    cuAdded: false,
    naclDrops: 0,
    solutionColor: 'var(--color-cuso4)',
    inCuvette: false
  });

  // Specific states for NH3 Rx (activeTab 2)
  const [nh3State, setNh3State] = useState({
    cuAdded: false,
    nh3Drops: 0,
    hasPrecipitate: false,
    isComplexFormed: false,
    solutionColor: 'var(--color-cuso4)',
    diluted: false,
    inCuvette: false
  });

  // Specific states for Glycine Rx (activeTab 3)
  const [glycineState, setGlycineState] = useState({
    cuAdded: false,
    phAdjusted: false,
    phTestColor: '#fde047', // Yellow (neutral-ish acid)
    phTestResult: 'pH 4 (산성)',
    glyPrepared: false,
    mixed: false,
    diluted: false,
    solutionColor: 'var(--color-cuso4)',
    inCuvette: false
  });

  // Initialize liquid view when switching tabs
  useEffect(() => {
    resetTempStates();
  }, [activeTab]);

  const resetTempStates = () => {
    setSubStep(0);
    setStirring(false);
    setDropAnimation(false);
    setLoading(false);
    setIsTransferringSolid(false);
    setIsPouring(false);
    setIsPipetting(false);
    setIsPouringGlycine(false);
    setHasSolidInBeaker(false);
    setIsPipetting1(false);
    setIsPipetting2(false);
    setDilutionBeakerLiquid(0);
    setDilutionBeakerColor('transparent');
  };

  // Helper: Trigger liquid drop animation
  const triggerDrop = (color, callback) => {
    setDropColor(color);
    setDropAnimation(true);
    setTimeout(() => {
      setDropAnimation(false);
      callback();
    }, 600);
  };

  // --- TAB 0: CuSO4 Preparation Logic ---
  const handleScalePower = () => {
    setScaleState(prev => ({
      ...prev,
      power: !prev.power,
      weight: !prev.power ? 0.00 : 0
    }));
  };

  const handleScaleTare = () => {
    if (!scaleState.power) return;
    setScaleState(prev => ({
      ...prev,
      tare: true,
      weight: 0.00
    }));
    if (subStep === 0) setSubStep(1);
  };

  const adjustWeight = (amount) => {
    if (!scaleState.power || !scaleState.tare) return;
    setScaleState(prev => {
      const nextWeight = Math.max(0, prev.weight + amount);
      return { ...prev, weight: parseFloat(nextWeight.toFixed(2)) };
    });
  };

  const verifyWeight = () => {
    if (scaleState.weight === 6.24) {
      setLoading(true);
      setIsTransferringSolid(true);
      setTimeout(() => {
        setHasSolidInBeaker(true);
        setIsTransferringSolid(false);
        setLoading(false);
        setSubStep(2);
      }, 2000);
    } else {
      alert("황산구리 5수화물의 질량을 정확히 6.24g으로 맞춰주세요!");
    }
  };

  const pourWaterToBeaker = () => {
    setLoading(true);
    setTimeout(() => {
      setBeakerLiquid(50); // Add 50mL water
      setLiquidColor('var(--color-cuso4)'); // Slowly turns light blue
      setLoading(false);
      setSubStep(3);
    }, 1000);
  };

  const stirBeaker = () => {
    setStirring(true);
    setTimeout(() => {
      setStirring(false);
      setSubStep(4);
    }, 1500);
  };

  const transferToFlask = () => {
    setLoading(true);
    setIsPouring(true);
    setTimeout(() => {
      setFlaskLiquid(prev => Math.min(prev + beakerLiquid, 250));
      setBeakerLiquid(0);
    }, 700);
    setTimeout(() => {
      setIsPouring(false);
      setLoading(false);
      setSubStep(5);
    }, 1800);
  };

  const rinseBeaker = () => {
    if (rinseCount >= 2) return;
    setLoading(true);
    setBeakerLiquid(15); // Show spray liquid in beaker first
    setTimeout(() => {
      setIsPouring(true);
      setTimeout(() => {
        setFlaskLiquid(prev => Math.min(prev + 15, 250));
        setBeakerLiquid(0);
      }, 700);
      
      setTimeout(() => {
        setIsPouring(false);
        setRinseCount(prev => {
          const nextRinse = prev + 1;
          if (nextRinse === 2) {
            setSubStep(6);
          }
          return nextRinse;
        });
        setLoading(false);
      }, 1800);
    }, 500);
  };

  const addWaterToFlaskTwoThirds = () => {
    setLoading(true);
    setTimeout(() => {
      setFlaskLiquid(160); // Roughly 2/3 of 250mL
      setLoading(false);
      setSubStep(7);
    }, 1000);
  };

  const shakeFlask = () => {
    setLoading(true);
    setTimeout(() => {
      setShaken(true);
      setLoading(false);
      setSubStep(8);
    }, 1200);
  };

  const fillToMark = (val) => {
    setFlaskLiquid(val);
    if (val === 250) {
      setProgress(prev => ({ ...prev, cuso4Prepared: true }));
      setSubStep(9);
    }
  };

  // --- TAB 1: NaCl Reaction Logic ---
  const naclAddCuSO4 = () => {
    setLoading(true);
    setIsPipetting(true);
    setTimeout(() => {
      setNaclState(prev => ({ ...prev, cuAdded: true }));
    }, 2000);
    setTimeout(() => {
      setIsPipetting(false);
      setLoading(false);
      setSubStep(1);
    }, 2800);
  };

  const addNaClDrop = () => {
    triggerDrop('rgba(255,255,255,0.7)', () => {
      setNaclState(prev => {
        const drops = prev.naclDrops + 1;
        let color = 'var(--color-cuso4)';
        if (drops === 1) color = 'rgba(74, 222, 128, 0.7)'; // 녹색
        if (drops >= 2) color = 'var(--color-nacl-reaction)'; // 황록색 [CuCl4]2-
        
        return {
          ...prev,
          naclDrops: drops,
          solutionColor: color
        };
      });
      if (naclState.naclDrops === 0) setSubStep(2);
      if (naclState.naclDrops === 1) setSubStep(3);
    });
  };

  const pourNaClToCuvette = () => {
    setLoading(true);
    setIsPouring(true);
    setTimeout(() => {
      setNaclState(prev => ({ ...prev, inCuvette: true }));
      setCuvettes(prev => ({ ...prev, c1: true }));
      setProgress(prev => ({ ...prev, naclFinished: true }));
    }, 700);
    setTimeout(() => {
      setIsPouring(false);
      setLoading(false);
      setSubStep(4);
    }, 1800);
  };

  // --- TAB 2: NH3 Reaction Logic ---
  const nh3AddCuSO4 = () => {
    setLoading(true);
    setIsPipetting(true);
    setTimeout(() => {
      setNh3State(prev => ({ ...prev, cuAdded: true }));
    }, 2000);
    setTimeout(() => {
      setIsPipetting(false);
      setLoading(false);
      setSubStep(1);
    }, 2800);
  };

  const addNH3Drop = () => {
    triggerDrop('rgba(147, 197, 253, 0.4)', () => {
      setNh3State(prev => {
        const drops = prev.nh3Drops + 1;
        let color = prev.solutionColor;
        let hasPpt = prev.hasPrecipitate;
        let isComplex = prev.isComplexFormed;
        
        if (drops === 1) {
          hasPpt = true; // Cu(OH)2 PPT
          color = 'rgba(56, 189, 248, 0.5)';
        } else if (drops >= 3) {
          hasPpt = false; // PPT dissolves
          isComplex = true; // [Cu(NH3)4(H2O)2]2+
          color = 'var(--color-nh3-deep)'; // 짙은 청람색
        }
        
        return {
          ...prev,
          nh3Drops: drops,
          hasPrecipitate: hasPpt,
          isComplexFormed: isComplex,
          solutionColor: color
        };
      });
      
      if (nh3State.nh3Drops === 0) setSubStep(2);
      if (nh3State.nh3Drops === 2) setSubStep(3);
    });
  };

  const diluteNH3 = () => {
    setLoading(true);
    setIsPipetting1(true);
    setPipetteLiquidHeight(0);
    setWaterPipetteHeight(70);
    
    // Pipette 1 draws liquid
    setTimeout(() => {
      setPipetteLiquidHeight(70);
    }, 800);

    // Pipette 1 dispenses into dilution beaker
    setTimeout(() => {
      setPipetteLiquidHeight(0);
      setDilutionBeakerLiquid(10);
      setDilutionBeakerColor('var(--color-nh3-deep)');
    }, 2400);

    // Pipette 1 ends, Pipette 2 starts
    setTimeout(() => {
      setIsPipetting1(false);
      setIsPipetting2(true);
    }, 3200);

    // Pipette 2 dispenses distilled water
    setTimeout(() => {
      setWaterPipetteHeight(0);
      setDilutionBeakerLiquid(35);
      setDilutionBeakerColor('rgba(59, 130, 246, 0.8)');
    }, 3200 + 1500);

    // Pipette 2 ends, dilution completes
    setTimeout(() => {
      setIsPipetting2(false);
      setNh3State(prev => ({ 
        ...prev, 
        diluted: true,
        solutionColor: 'rgba(59, 130, 246, 0.8)' 
      }));
      setLoading(false);
      setSubStep(4);
    }, 3200 + 3200);
  };

  const pourNH3ToCuvette = () => {
    setLoading(true);
    setIsPouring(true);
    setTimeout(() => {
      setNh3State(prev => ({ ...prev, inCuvette: true }));
      setCuvettes(prev => ({ ...prev, c2: true }));
      setProgress(prev => ({ ...prev, nh3Finished: true }));
    }, 700);
    setTimeout(() => {
      setIsPouring(false);
      setLoading(false);
      setSubStep(5);
    }, 1800);
  };

  // --- TAB 3: Glycine Reaction Logic ---
  const glycineAddCuSO4 = () => {
    setLoading(true);
    setIsPipetting(true);
    setTimeout(() => {
      setGlycineState(prev => ({ ...prev, cuAdded: true }));
    }, 2000);
    setTimeout(() => {
      setIsPipetting(false);
      setLoading(false);
      setSubStep(1);
    }, 2800);
  };

  const addNaOHDrop = () => {
    triggerDrop('rgba(255, 255, 255, 0.3)', () => {
      setGlycineState(prev => ({ 
        ...prev, 
        phAdjusted: true,
        phTestColor: '#22c55e', // Green (pH 8-9)
        phTestResult: 'pH 8.5 (약염기성)'
      }));
      setSubStep(2);
    });
  };

  const prepareGlycine = () => {
    setLoading(true);
    setTimeout(() => {
      setGlycineState(prev => ({ ...prev, glyPrepared: true }));
      setLoading(false);
      setSubStep(3);
    }, 1000);
  };

  const mixGlycine = () => {
    setLoading(true);
    setIsPouringGlycine(true);
    setTimeout(() => {
      setGlycineState(prev => ({ 
        ...prev, 
        mixed: true,
        solutionColor: 'var(--color-glycine)' // Purple [Cu(Gly)2]
      }));
    }, 700);
    setTimeout(() => {
      setIsPouringGlycine(false);
      setLoading(false);
      setSubStep(4);
    }, 1800);
  };

  const diluteGlycine = () => {
    setLoading(true);
    setIsPipetting1(true);
    setPipetteLiquidHeight(0);
    setWaterPipetteHeight(70);
    
    // Pipette 1 draws liquid
    setTimeout(() => {
      setPipetteLiquidHeight(70);
    }, 800);

    // Pipette 1 dispenses into dilution beaker
    setTimeout(() => {
      setPipetteLiquidHeight(0);
      setDilutionBeakerLiquid(10);
      setDilutionBeakerColor('var(--color-glycine)');
    }, 2400);

    // Pipette 1 ends, Pipette 2 starts
    setTimeout(() => {
      setIsPipetting1(false);
      setIsPipetting2(true);
    }, 3200);

    // Pipette 2 dispenses distilled water
    setTimeout(() => {
      setWaterPipetteHeight(0);
      setDilutionBeakerLiquid(35);
      setDilutionBeakerColor('rgba(167, 139, 250, 0.7)');
    }, 3200 + 1500);

    // Pipette 2 ends, dilution completes
    setTimeout(() => {
      setIsPipetting2(false);
      setGlycineState(prev => ({ 
        ...prev, 
        diluted: true,
        solutionColor: 'rgba(167, 139, 250, 0.7)' 
      }));
      setLoading(false);
      setSubStep(5);
    }, 3200 + 3200);
  };

  const pourGlyToCuvette = () => {
    setLoading(true);
    setIsPouring(true);
    setTimeout(() => {
      setGlycineState(prev => ({ ...prev, inCuvette: true }));
      setCuvettes(prev => ({ ...prev, c3: true }));
      setProgress(prev => ({ ...prev, glycineFinished: true }));
    }, 700);
    setTimeout(() => {
      setIsPouring(false);
      setLoading(false);
      setSubStep(6);
    }, 1800);
  };

  const isAllReactionsFinished = progress.naclFinished && progress.nh3Finished && progress.glycineFinished;

  return (
    <div className="lab-layout">
      {/* Guide Panel */}
      <div className="guide-panel">
        <div className="glass-card" style={{ padding: '1.25rem', marginBottom: 0 }}>
          <h3 className="card-title" style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>실험 단계 선택</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              onClick={() => setActiveTab(0)}
              className={`step-btn ${activeTab === 0 ? 'active' : ''} ${progress.cuso4Prepared ? 'completed' : ''}`}
              style={{ width: '100%', justifyContent: 'flex-start', borderRadius: '8px' }}
            >
              <span>0.1M CuSO₄ 수용액 제조</span>
            </button>
            <button
              onClick={() => setActiveTab(1)}
              disabled={!progress.cuso4Prepared}
              className={`step-btn ${activeTab === 1 ? 'active' : ''} ${progress.naclFinished ? 'completed' : ''}`}
              style={{ width: '100%', justifyContent: 'flex-start', borderRadius: '8px' }}
            >
              <span>실험 ①: 포화 NaCl 반응</span>
            </button>
            <button
              onClick={() => setActiveTab(2)}
              disabled={!progress.cuso4Prepared}
              className={`step-btn ${activeTab === 2 ? 'active' : ''} ${progress.nh3Finished ? 'completed' : ''}`}
              style={{ width: '100%', justifyContent: 'flex-start', borderRadius: '8px' }}
            >
              <span>실험 ②: 진한 암모니아 반응</span>
            </button>
            <button
              onClick={() => setActiveTab(3)}
              disabled={!progress.cuso4Prepared}
              className={`step-btn ${activeTab === 3 ? 'active' : ''} ${progress.glycineFinished ? 'completed' : ''}`}
              style={{ width: '100%', justifyContent: 'flex-start', borderRadius: '8px' }}
            >
              <span>실험 ③: 글라이신 반응</span>
            </button>
          </div>
        </div>

        {/* INSTRUCTIONS BY ACTIVE TAB */}
        <div className="instruction-box">
          <h3 style={{ fontSize: '1rem', color: '#fff', marginBottom: '0.75rem', fontWeight: 600 }}>가이드 및 지시사항</h3>
          
          {/* TAB 0: CuSO4 PREP INSTRUCTIONS */}
          {activeTab === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className={`instruction-step ${subStep >= 0 ? '' : 'opacity-40'}`}>
                <div className="step-num">1</div>
                <div className="step-desc">전자저울의 전원을 켜고, 약포지를 올린 뒤 <b>Tare(영점)</b>을 조절하세요.</div>
              </div>
              <div className={`instruction-step ${subStep >= 1 ? '' : 'opacity-40'}`}>
                <div className="step-num">2</div>
                <div className="step-desc">약수저를 이용하여 CuSO₄·5H₂O 결정을 정확히 <b>6.24 g</b> 계량하세요.</div>
              </div>
              <div className={`instruction-step ${subStep >= 2 ? '' : 'opacity-40'}`}>
                <div className="step-num">3</div>
                <div className="step-desc">계량한 고체를 50mL 비커에 넣고 증류수를 넣어 <b>유리막대</b>로 완전히 녹이세요.</div>
              </div>
              <div className={`instruction-step ${subStep >= 4 ? '' : 'opacity-40'}`}>
                <div className="step-num">4</div>
                <div className="step-desc">녹인 용액을 <b>250mL 부피 플라스크</b>로 모두 깔끔하게 옮기세요.</div>
              </div>
              <div className={`instruction-step ${subStep >= 5 ? '' : 'opacity-40'}`}>
                <div className="step-num">5</div>
                <div className="step-desc">비커를 씻기병으로 <b>2회 헹구어</b> 남은 황산구리 이온까지 완전히 플라스크에 넣습니다.</div>
              </div>
              <div className={`instruction-step ${subStep >= 6 ? '' : 'opacity-40'}`}>
                <div className="step-num">6</div>
                <div className="step-desc">플라스크의 2/3 지점까지 증류수를 넣고 <b>마개를 닫아 가볍게 흔들어</b> 섞으세요.</div>
              </div>
              <div className={`instruction-step ${subStep >= 8 ? '' : 'opacity-40'}`}>
                <div className="step-num">7</div>
                <div className="step-desc">슬라이더를 조작하여 눈높이를 맞추고 정확히 <b>250 mL 빨간 눈금선(표선)</b>까지 눈금을 맞추세요.</div>
              </div>
            </div>
          )}

          {/* TAB 1: NaCl Rx INSTRUCTIONS */}
          {activeTab === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className={`instruction-step ${subStep >= 0 ? '' : 'opacity-40'}`}>
                <div className="step-num">1</div>
                <div className="step-desc">제조해 둔 0.1M CuSO₄ 용액 <b>3mL를 피펫</b>으로 취해 50mL 비커로 옮깁니다.</div>
              </div>
              <div className={`instruction-step ${subStep >= 1 ? '' : 'opacity-40'}`}>
                <div className="step-num">2</div>
                <div className="step-desc">스포이트를 눌러 <b>포화 NaCl 수용액을 1mL씩 총 3회</b> 가해 줍니다.</div>
              </div>
              <div className={`instruction-step ${subStep >= 3 ? '' : 'opacity-40'}`}>
                <div className="step-num">3</div>
                <div className="step-desc">용액의 색깔 변화(하늘색 → 녹색 → 황록색)를 확인하고 <b>큐벳 ①</b>에 나누어 담습니다.</div>
              </div>
            </div>
          )}

          {/* TAB 2: NH3 Rx INSTRUCTIONS */}
          {activeTab === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className={`instruction-step ${subStep >= 0 ? '' : 'opacity-40'}`}>
                <div className="step-num">1</div>
                <div className="step-desc">0.1M CuSO₄ 용액 <b>3mL</b>를 비커에 이송합니다.</div>
              </div>
              <div className={`instruction-step ${subStep >= 1 ? '' : 'opacity-40'}`}>
                <div className="step-num">2</div>
                <div className="step-desc"><b>진한 암모니아수</b>를 한 방울 가하여 <b>연푸른색 수산화구리(Cu(OH)₂) 앙금</b> 생성을 관찰합니다.</div>
              </div>
              <div className={`instruction-step ${subStep >= 2 ? '' : 'opacity-40'}`}>
                <div className="step-num">3</div>
                <div className="step-desc">암모니아수를 과량으로 계속 추가하여 앙금이 완전히 녹아 <b>짙은 청람색 착이온</b>이 될 때까지 넣어줍니다.</div>
              </div>
              <div className={`instruction-step ${subStep >= 3 ? '' : 'opacity-40'}`}>
                <div className="step-num">4</div>
                <div className="step-desc">제조된 짙은 청람색 용액을 피펫으로 <b>1mL 취해 증류수 9mL와 섞어</b> 10배 묽힙니다. (비어-람베르트 법칙 적용)</div>
              </div>
              <div className={`instruction-step ${subStep >= 4 ? '' : 'opacity-40'}`}>
                <div className="step-num">5</div>
                <div className="step-desc">묽힌 수용액을 <b>큐벳 ②</b>에 나누어 담아 분광 분석을 준비합니다.</div>
              </div>
            </div>
          )}

          {/* TAB 3: GLYCINE Rx INSTRUCTIONS */}
          {activeTab === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className={`instruction-step ${subStep >= 0 ? '' : 'opacity-40'}`}>
                <div className="step-num">1</div>
                <div className="step-desc">0.1M CuSO₄ 용액 <b>3mL</b>를 비커에 이송합니다.</div>
              </div>
              <div className={`instruction-step ${subStep >= 1 ? '' : 'opacity-40'}`}>
                <div className="step-num">2</div>
                <div className="step-desc">0.1M NaOH를 몇 방울 떨어뜨려 <b>pH 8~9(약염기성)</b>로 맞춘 후 pH 시험지로 검증하세요.</div>
              </div>
              <div className={`instruction-step ${subStep >= 2 ? '' : 'opacity-40'}`}>
                <div className="step-num">3</div>
                <div className="step-desc">다른 비커에 <b>글라이신 가루 0.15g</b>을 약숟가락으로 측정해 증류수 5mL에 넣어 녹입니다.</div>
              </div>
              <div className={`instruction-step ${subStep >= 3 ? '' : 'opacity-40'}`}>
                <div className="step-num">4</div>
                <div className="step-desc">두 비커의 수용액을 혼합하여 **보라색/파란색([Cu(Gly)₂])**으로 색이 변하는지 관찰합니다.</div>
              </div>
              <div className={`instruction-step ${subStep >= 4 ? '' : 'opacity-40'}`}>
                <div className="step-num">5</div>
                <div className="step-desc">제조된 보라색 수용액 <b>1mL를 취해 증류수 9mL</b>와 섞어 10배 묽힙니다.</div>
              </div>
              <div className={`instruction-step ${subStep >= 5 ? '' : 'opacity-40'}`}>
                <div className="step-num">6</div>
                <div className="step-desc">묽힌 수용액을 <b>큐벳 ③</b>에 담습니다.</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bench Display Panel */}
      <div className="bench-panel">
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>실험 벤치 (Virtual Lab Bench)</span>
          {loading && <span className="shimmer" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>진행 중...</span>}
        </div>

        {/* INTERACTION AREA */}
        <div className="bench-display">
          {isTransferringSolid && (
            <>
              <div className="weighing-paper-transfer animate-solid-transfer">
                <div className="weighing-paper-powder"></div>
              </div>
              <div className="powder-drop-particles animate-powder-drop">
                <div className="powder-particle"></div>
                <div className="powder-particle"></div>
                <div className="powder-particle"></div>
              </div>
            </>
          )}

          {isPipetting && (
            <div className="pipette-tool-animate animate-pipetting">
              <div className="pipette-bulb"></div>
              <div className="pipette-liquid-content" style={{ height: '70%' }}></div>
            </div>
          )}

          {isPipetting1 && (
            <div className="pipette-tool-animate animate-dilution-pipette-1" style={{ left: 'calc(50% - 130px)' }}>
              <div className="pipette-bulb"></div>
              <div id="dilution-pipette-1-liquid" className="pipette-liquid-content" style={{ height: `${pipetteLiquidHeight}%`, backgroundColor: activeTab === 2 ? 'var(--color-nh3-deep)' : 'var(--color-glycine)', transition: 'height 0.8s ease' }}></div>
            </div>
          )}

          {isPipetting2 && (
            <div className="pipette-tool-animate animate-dilution-pipette-2" style={{ left: 'calc(50% + 30px)' }}>
              <div className="pipette-bulb"></div>
              <div className="pipette-liquid-content" style={{ height: `${waterPipetteHeight}%`, backgroundColor: 'rgba(241, 245, 249, 0.45)', transition: 'height 1.2s ease' }}></div>
            </div>
          )}



          {/* TAB 0 RENDERING */}
          {activeTab === 0 && (
            <>
              {/* Electronic Scale */}
              {(subStep <= 1 || isTransferringSolid) && (
                <div className="scale-container" style={{ opacity: isTransferringSolid ? 0.4 : 1, transition: 'opacity 0.5s' }}>
                  <div className="lab-scale">
                    <div className="scale-plate"></div>
                    <div className="scale-display">
                      {scaleState.power ? `${scaleState.weight.toFixed(2)} g` : 'OFF'}
                    </div>
                  </div>
                  {!isTransferringSolid && (
                    <>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <button onClick={handleScalePower} className="control-btn">전원</button>
                        <button onClick={handleScaleTare} disabled={!scaleState.power} className="control-btn">영점(Tare)</button>
                        <button onClick={() => adjustWeight(1.25)} disabled={!scaleState.power || !scaleState.tare} className="control-btn">
                          기본 스푼 (+1.25g)
                        </button>
                      </div>
                      {scaleState.power && scaleState.tare && (
                        <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '100%' }}>
                          <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                            <button onClick={() => adjustWeight(1.0)} className="control-btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>+1.00g</button>
                            <button onClick={() => adjustWeight(0.1)} className="control-btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>+0.10g</button>
                            <button onClick={() => adjustWeight(0.01)} className="control-btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>+0.01g</button>
                          </div>
                          <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                            <button onClick={() => adjustWeight(-1.0)} disabled={scaleState.weight <= 0} className="control-btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>-1.00g</button>
                            <button onClick={() => adjustWeight(-0.1)} disabled={scaleState.weight <= 0} className="control-btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>-0.10g</button>
                            <button onClick={() => adjustWeight(-0.01)} disabled={scaleState.weight <= 0} className="control-btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>-0.01g</button>
                          </div>
                        </div>
                      )}
                      {scaleState.weight === 6.24 && subStep === 1 && (
                        <button onClick={verifyWeight} className="control-btn primary" style={{ marginTop: '0.5rem' }}>
                          계량 완료
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Beaker with solution */}
              {((subStep >= 2 && subStep <= 3) || isTransferringSolid) && (
                <div className="beaker-container" style={{ transition: 'all 0.5s' }}>
                  {stirring && <div className="stirring-rod stirring"></div>}
                  {!stirring && subStep === 3 && <div className="stirring-rod"></div>}
                  <div className="beaker">
                    {hasSolidInBeaker && (
                      <div className="solid-powder-pile" style={{
                        transform: stirring ? 'scale(0.2) translateY(5px)' : 'scale(1)',
                        opacity: beakerLiquid > 0 && stirring ? 0.2 : 1
                      }}></div>
                    )}
                    <div className="liquid" style={{ height: `${beakerLiquid}%`, backgroundColor: beakerLiquid > 0 ? 'var(--color-cuso4)' : 'transparent' }}>
                      {beakerLiquid > 0 && <span style={{ fontSize: '0.65rem', color: '#fff', zIndex: 10 }}>50mL</span>}
                    </div>
                  </div>
                  {!isTransferringSolid && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                      {subStep === 2 && (
                        <button onClick={pourWaterToBeaker} disabled={loading} className="control-btn primary">
                          증류수 50mL 추가
                        </button>
                      )}
                      {subStep === 3 && (
                        <button onClick={stirBeaker} disabled={stirring} className="control-btn primary">
                          유리막대로 젓기
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Transfer Beaker -> Volumetric Flask */}
              {subStep >= 4 && subStep <= 8 && (
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-end', position: 'relative' }}>
                  {/* Beaker (emptying/rinsing) */}
                  <div className={`beaker-container ${isPouring ? 'animate-pouring-beaker' : ''}`} style={{ opacity: subStep >= 5 ? 0.6 : 1, transition: 'all 0.3s' }}>
                    <div className="beaker">
                      <div className="liquid" style={{ height: `${beakerLiquid}%`, backgroundColor: beakerLiquid > 0 ? 'rgba(56, 189, 248, 0.4)' : 'transparent' }}></div>
                    </div>
                    <span style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>비커</span>
                  </div>

                  {/* Volumetric Flask */}
                  <div className="flask-container" style={{ position: 'relative' }}>
                    {isPouring && (
                      <div className="liquid-pour-stream active" style={{ left: '53px', top: '0', height: '60px', backgroundColor: beakerLiquid > 0 ? 'var(--color-cuso4)' : 'rgba(56, 189, 248, 0.4)', zIndex: 5 }}></div>
                    )}
                    <div className="volumetric-flask">
                      <div className="flask-neck">
                        <div className="flask-neck-line"></div>
                        <div id="flask-liquid-neck" className="flask-liquid" style={{ height: `${((flaskLiquid - 160) / 90) * 30}px`, width: '100%', left: 0, display: flaskLiquid > 160 ? 'block' : 'none', transition: 'none' }}></div>
                      </div>
                      <div className="flask-body">
                        <div className="flask-liquid" style={{ height: `${Math.min((flaskLiquid / 160) * 100, 100)}%` }}></div>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>부피 플라스크 ({flaskLiquid}mL)</span>

                    {/* Sliders for fine measurement */}
                    {subStep === 8 && (
                      <div style={{ position: 'absolute', left: '130px', bottom: '20px', width: '220px', background: 'rgba(15,23,42,0.95)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--glass-border)', zIndex: 40 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                          <span>증류수 미세 조절</span>
                          <span style={{ color: 'var(--accent-rose)', fontWeight: 'bold' }}>{flaskLiquid} / 250 mL</span>
                        </div>
                        <input
                          type="range"
                          min="240"
                          max="250"
                          value={flaskLiquid}
                          onChange={(e) => fillToMark(parseInt(e.target.value))}
                          style={{ width: '100%', cursor: 'pointer' }}
                        />
                        <p style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.25rem', textAlign: 'center', lineHeight: 1.3 }}>
                          슬라이더를 조작하여 눈금선에 맞추세요.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Sub-step action button triggers */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                {subStep === 4 && (
                  <button onClick={transferToFlask} disabled={loading} className="control-btn primary">
                    플라스크로 이송
                  </button>
                )}
                {subStep === 5 && (
                  <button onClick={rinseBeaker} disabled={loading} className="control-btn primary">
                    비커 씻기병 헹굼액 이송 ({rinseCount}/2회)
                  </button>
                )}
                {subStep === 6 && (
                  <button onClick={addWaterToFlaskTwoThirds} disabled={loading} className="control-btn primary">
                    증류수 2/3 채우기
                  </button>
                )}
                {subStep === 7 && (
                  <button onClick={shakeFlask} disabled={loading} className="control-btn primary">
                    마개 닫고 흔들어 섞기
                  </button>
                )}
              </div>

              {subStep === 9 && (
                <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(52, 211, 153, 0.1)', border: '1px solid var(--accent-green)', borderRadius: '8px' }}>
                  <h4 style={{ color: 'var(--accent-green)', fontWeight: 'bold', marginBottom: '0.25rem' }}>0.1M CuSO₄ 표준 용액 제조 완료!</h4>
                  <p style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>성공적으로 표준 용액을 제조하였습니다. 상단 실험 단계 탭에서 실험 ①을 이어서 진행하세요.</p>
                </div>
              )}
            </>
          )}

          {/* TAB 1 RENDERING (NaCl Rx) */}
          {activeTab === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
              <div style={{ display: 'flex', gap: '3rem', alignItems: 'flex-end', position: 'relative' }}>
                {/* CuSO4 standard solution */}
                <div className="flask-container" style={{ opacity: 0.5 }}>
                  <div className="volumetric-flask">
                    <div className="flask-neck"></div>
                    <div className="flask-body">
                      <div className="flask-liquid" style={{ height: '100%' }}></div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.7rem' }}>0.1M CuSO₄ 수용액</span>
                </div>

                {/* Reaction Beaker */}
                <div className={`beaker-container ${isPouring ? 'animate-pouring-to-cuvette' : ''}`} style={{ transition: 'all 0.3s', position: 'relative' }}>
                  {dropAnimation && (
                    <div className="dropper-wrapper" style={{ position: 'absolute', top: '-110px', left: 'calc(50% - 12px)', zIndex: 30 }}>
                      <div className="dropper-bulb"></div>
                      <div className="dropper-tube">
                        <div className="dropper-liquid" style={{ height: '30%', backgroundColor: dropColor }}></div>
                      </div>
                      <div className="dropper-tip"></div>
                      <div className="chemical-drop" style={{ backgroundColor: dropColor }}></div>
                    </div>
                  )}
                  <div className="beaker">
                    {naclState.cuAdded && (
                      <div className="liquid" style={{ height: '35%', backgroundColor: naclState.solutionColor }}>
                        <span style={{ fontSize: '0.65rem', color: '#fff', zIndex: 10 }}>{naclState.cuAdded && `${3 + naclState.naclDrops} mL`}</span>
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: 'bold' }}>반응 비커</span>
                </div>

                {/* Cuvette 1 */}
                <div className="cuvette-rack" style={{ padding: '0.5rem', background: 'rgba(0,0,0,0.2)', position: 'relative' }}>
                  {isPouring && (
                    <div className="liquid-pour-stream active" style={{ left: '25px', top: '0', height: '60px', backgroundColor: naclState.solutionColor, zIndex: 5 }}></div>
                  )}
                  <div className="cuvette" style={{ opacity: naclState.inCuvette ? 1 : 0.2 }}>
                    {naclState.inCuvette && <div className="cuvette-liquid" style={{ backgroundColor: 'var(--color-nacl-reaction)' }}></div>}
                    <div className="cuvette-label">①</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {!naclState.cuAdded && (
                  <button onClick={naclAddCuSO4} className="control-btn primary">
                    피펫으로 0.1M CuSO₄ 수용액 3mL 분주
                  </button>
                )}
                {naclState.cuAdded && naclState.naclDrops < 3 && (
                  <button onClick={addNaClDrop} disabled={dropAnimation} className="control-btn primary">
                    포화 NaCl 수용액 1mL 첨가 ({naclState.naclDrops}/3mL)
                  </button>
                )}
                {naclState.naclDrops >= 3 && !naclState.inCuvette && (
                  <button onClick={pourNaClToCuvette} disabled={loading} className="control-btn primary">
                    반응한 용액을 큐벳 ①에 이송
                  </button>
                )}
                {naclState.inCuvette && (
                  <div style={{ padding: '0.5rem 1rem', background: 'rgba(52, 211, 153, 0.1)', border: '1px solid var(--accent-green)', borderRadius: '8px', color: 'var(--accent-green)', fontWeight: 'bold', fontSize: '0.85rem' }}>
                    실험 ① 완료: 큐벳 ① 준비됨 (황록색 착이온 [CuCl₄]²⁻ 생성)
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2 RENDERING (NH3 Rx) */}
          {activeTab === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
              <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-end', position: 'relative' }}>
                {/* Reaction Beaker */}
                <div className="beaker-container" style={{ transition: 'all 0.3s', position: 'relative' }}>
                  {dropAnimation && (
                    <div className="dropper-wrapper" style={{ position: 'absolute', top: '-110px', left: 'calc(50% - 12px)', zIndex: 30 }}>
                      <div className="dropper-bulb"></div>
                      <div className="dropper-tube">
                        <div className="dropper-liquid" style={{ height: '30%', backgroundColor: dropColor }}></div>
                      </div>
                      <div className="dropper-tip"></div>
                      <div className="chemical-drop" style={{ backgroundColor: dropColor }}></div>
                    </div>
                  )}
                  <div className="beaker">
                    {nh3State.cuAdded && (
                      <div className="liquid" style={{ height: (nh3State.diluted || dilutionBeakerLiquid > 0) ? '23%' : '35%', backgroundColor: 'var(--color-nh3-deep)' }}>
                        <span style={{ fontSize: '0.65rem', color: '#fff', zIndex: 10 }}>
                          {(nh3State.diluted || dilutionBeakerLiquid > 0) ? '2 mL' : '3 mL'}
                        </span>
                      </div>
                    )}
                    {nh3State.hasPrecipitate && <div className="precipitate"></div>}
                  </div>
                  <span style={{ fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: 'bold' }}>반응 비커</span>
                </div>

                {/* Dilution Beaker */}
                {(nh3State.diluted || dilutionBeakerLiquid > 0) && (
                  <div className={`beaker-container ${isPouring ? 'animate-pouring-to-cuvette' : ''}`} style={{ transition: 'all 0.3s', position: 'relative' }}>
                    <div className="beaker" style={{ width: '100px', height: '120px' }}>
                      {dilutionBeakerLiquid > 0 && (
                        <div className="liquid" style={{ height: nh3State.inCuvette ? '0%' : `${dilutionBeakerLiquid}%`, backgroundColor: dilutionBeakerColor }}>
                          <span style={{ fontSize: '0.65rem', color: '#fff', zIndex: 10 }}>
                            {nh3State.inCuvette ? '0 mL' : (dilutionBeakerLiquid === 10 ? '1 mL' : '10 mL')}
                          </span>
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: 'bold' }}>희석 비커</span>
                  </div>
                )}

                {/* Cuvette 2 */}
                <div className="cuvette-rack" style={{ padding: '0.5rem', background: 'rgba(0,0,0,0.2)', position: 'relative' }}>
                  {isPouring && (
                    <div className="liquid-pour-stream active" style={{ left: '25px', top: '0', height: '60px', backgroundColor: nh3State.solutionColor, zIndex: 5 }}></div>
                  )}
                  <div className="cuvette" style={{ opacity: nh3State.inCuvette ? 1 : 0.2 }}>
                    {nh3State.inCuvette && <div className="cuvette-liquid" style={{ backgroundColor: 'rgba(59, 130, 246, 0.8)' }}></div>}
                    <div className="cuvette-label">②</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {!nh3State.cuAdded && (
                  <button onClick={nh3AddCuSO4} className="control-btn primary">
                    피펫으로 0.1M CuSO₄ 수용액 3mL 분주
                  </button>
                )}
                {nh3State.cuAdded && nh3State.nh3Drops < 4 && (
                  <button onClick={addNH3Drop} disabled={dropAnimation} className="control-btn primary">
                    진한 암모니아수 첨가 (
                    {nh3State.nh3Drops === 0 ? '소량 - 1방울' : `${nh3State.nh3Drops}/4방울`}
                    )
                  </button>
                )}
                {nh3State.isComplexFormed && !nh3State.diluted && (
                  <button onClick={diluteNH3} disabled={loading} className="control-btn primary">
                    용액 1mL를 피펫으로 취해 증류수 9mL로 10배 희석
                  </button>
                )}
                {nh3State.diluted && !nh3State.inCuvette && (
                  <button onClick={pourNH3ToCuvette} disabled={loading} className="control-btn primary">
                    희석된 용액을 큐벳 ②에 이송
                  </button>
                )}
                {nh3State.inCuvette && (
                  <div style={{ padding: '0.5rem 1rem', background: 'rgba(52, 211, 153, 0.1)', border: '1px solid var(--accent-green)', borderRadius: '8px', color: 'var(--accent-green)', fontWeight: 'bold', fontSize: '0.85rem' }}>
                    실험 ② 완료: 큐벳 ② 준비됨 (짙은 청람색 착이온 [Cu(NH₃)₄(H₂O)₂]²⁺ 생성)
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3 RENDERING (Glycine Rx) */}
          {activeTab === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-end', position: 'relative' }}>
                {/* pH Test Strip */}
                {glycineState.cuAdded && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <div className="ph-indicator-strip" style={{ backgroundColor: glycineState.phTestColor }}></div>
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{glycineState.phTestResult}</span>
                  </div>
                )}

                {/* Reaction Beaker */}
                <div className="beaker-container" style={{ transition: 'all 0.3s', position: 'relative' }}>
                  {isPouringGlycine && (
                    <div className="liquid-pour-stream active" style={{ left: '60px', top: '0', height: '60px', backgroundColor: 'rgba(255,255,255,0.2)', zIndex: 5 }}></div>
                  )}
                  {dropAnimation && (
                    <div className="dropper-wrapper" style={{ position: 'absolute', top: '-110px', left: 'calc(50% - 12px)', zIndex: 30 }}>
                      <div className="dropper-bulb"></div>
                      <div className="dropper-tube">
                        <div className="dropper-liquid" style={{ height: '30%', backgroundColor: dropColor }}></div>
                      </div>
                      <div className="dropper-tip"></div>
                      <div className="chemical-drop" style={{ backgroundColor: dropColor }}></div>
                    </div>
                  )}
                  <div className="beaker">
                    {glycineState.cuAdded && (
                      <div className="liquid" style={{ height: (glycineState.diluted || dilutionBeakerLiquid > 0) ? '57%' : (glycineState.mixed ? '65%' : '35%'), backgroundColor: glycineState.solutionColor }}>
                        <span style={{ fontSize: '0.65rem', color: '#fff', zIndex: 10 }}>
                          {(glycineState.diluted || dilutionBeakerLiquid > 0) ? '7 mL' : (glycineState.mixed ? '8 mL' : '3 mL')}
                        </span>
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: '0.7rem', marginTop: '0.5rem' }}>반응 비커</span>
                </div>

                {/* Glycine Beaker */}
                {(!glycineState.mixed || isPouringGlycine) && (
                  <div className={`beaker-container ${isPouringGlycine ? 'animate-pouring-glycine-beaker' : ''}`} style={{ opacity: glycineState.glyPrepared ? (glycineState.mixed ? 0.4 : 1) : 0.2, transition: 'all 0.3s' }}>
                    <div className="beaker" style={{ width: '80px', height: '100px' }}>
                      {glycineState.glyPrepared && !glycineState.mixed && (
                        <div className="liquid" style={{ height: '50%', backgroundColor: 'rgba(255,255,255,0.15)' }}></div>
                      )}
                    </div>
                    <span style={{ fontSize: '0.7rem', marginTop: '0.5rem' }}>글라이신 비커</span>
                  </div>
                )}

                {/* Dilution Beaker */}
                {(glycineState.diluted || dilutionBeakerLiquid > 0) && (
                  <div className={`beaker-container ${isPouring ? 'animate-pouring-to-cuvette' : ''}`} style={{ transition: 'all 0.3s', position: 'relative' }}>
                    <div className="beaker" style={{ width: '100px', height: '120px' }}>
                      {dilutionBeakerLiquid > 0 && (
                        <div className="liquid" style={{ height: glycineState.inCuvette ? '0%' : `${dilutionBeakerLiquid}%`, backgroundColor: dilutionBeakerColor }}>
                          <span style={{ fontSize: '0.65rem', color: '#fff', zIndex: 10 }}>
                            {glycineState.inCuvette ? '0 mL' : (dilutionBeakerLiquid === 10 ? '1 mL' : '10 mL')}
                          </span>
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: 'bold' }}>희석 비커</span>
                  </div>
                )}

                {/* Cuvette 3 */}
                <div className="cuvette-rack" style={{ padding: '0.5rem', background: 'rgba(0,0,0,0.2)', position: 'relative' }}>
                  {isPouring && (
                    <div className="liquid-pour-stream active" style={{ left: '25px', top: '0', height: '60px', backgroundColor: glycineState.solutionColor, zIndex: 5 }}></div>
                  )}
                  <div className="cuvette" style={{ opacity: glycineState.inCuvette ? 1 : 0.2 }}>
                    {glycineState.inCuvette && <div className="cuvette-liquid" style={{ backgroundColor: 'rgba(167, 139, 250, 0.7)' }}></div>}
                    <div className="cuvette-label">③</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {!glycineState.cuAdded && (
                  <button onClick={glycineAddCuSO4} className="control-btn primary">
                    피펫으로 0.1M CuSO₄ 수용액 3mL 분주
                  </button>
                )}
                {glycineState.cuAdded && !glycineState.phAdjusted && (
                  <button onClick={addNaOHDrop} disabled={dropAnimation} className="control-btn primary">
                    0.1M NaOH 수용액을 몇 방울 첨가하여 pH 조절
                  </button>
                )}
                {glycineState.phAdjusted && !glycineState.glyPrepared && (
                  <button onClick={prepareGlycine} disabled={loading} className="control-btn primary">
                    글라이신 고체 0.15g을 계량하여 증류수 5mL에 용해
                  </button>
                )}
                {glycineState.glyPrepared && !glycineState.mixed && (
                  <button onClick={mixGlycine} disabled={loading} className="control-btn primary">
                    제조한 두 용액 혼합
                  </button>
                )}
                {glycineState.mixed && !glycineState.diluted && (
                  <button onClick={diluteGlycine} disabled={loading} className="control-btn primary">
                    용액 1mL를 피펫으로 취해 증류수 9mL로 10배 희석
                  </button>
                )}
                {glycineState.diluted && !glycineState.inCuvette && (
                  <button onClick={pourGlyToCuvette} disabled={loading} className="control-btn primary">
                    희석된 용액을 큐벳 ③에 이송
                  </button>
                )}
                {glycineState.inCuvette && (
                  <div style={{ padding: '0.5rem 1rem', background: 'rgba(52, 211, 153, 0.1)', border: '1px solid var(--accent-green)', borderRadius: '8px', color: 'var(--accent-green)', fontWeight: 'bold', fontSize: '0.85rem' }}>
                    실험 ③ 완료: 큐벳 ③ 준비됨 (보라색/파란색 착이온 [Cu(Gly)₂] 생성 - 킬레이트 결합)
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Shelf display with reagents */}
        <div className="bench-shelf">
          <div 
            className="reagent-bottle" 
            onClick={() => activeTab === 1 && naclState.cuAdded && naclState.naclDrops < 3 && !dropAnimation && addNaClDrop()}
            style={{ 
              opacity: activeTab === 1 && naclState.cuAdded && naclState.naclDrops < 3 ? 1 : 0.5,
              cursor: activeTab === 1 && naclState.cuAdded && naclState.naclDrops < 3 ? 'pointer' : 'not-allowed'
            }}
          >
            <div className="bottle-cap"></div>
            <div className="bottle-body">
              <div className="bottle-liquid" style={{ height: '80%', backgroundColor: 'rgba(255,255,255,0.4)' }}></div>
              <div className="bottle-label">NaCl</div>
            </div>
            <span className="bottle-name">포화 NaCl</span>
          </div>

          <div 
            className="reagent-bottle"
            onClick={() => activeTab === 2 && nh3State.cuAdded && nh3State.nh3Drops < 4 && !dropAnimation && addNH3Drop()}
            style={{ 
              opacity: activeTab === 2 && nh3State.cuAdded && nh3State.nh3Drops < 4 ? 1 : 0.5,
              cursor: activeTab === 2 && nh3State.cuAdded && nh3State.nh3Drops < 4 ? 'pointer' : 'not-allowed'
            }}
          >
            <div className="bottle-cap" style={{ backgroundColor: '#e2e8f0' }}></div>
            <div className="bottle-body">
              <div className="bottle-liquid" style={{ height: '70%', backgroundColor: 'rgba(29, 78, 216, 0.6)' }}></div>
              <div className="bottle-label">NH₃</div>
            </div>
            <span className="bottle-name">진한 암모니아</span>
          </div>

          <div 
            className="reagent-bottle"
            onClick={() => activeTab === 3 && glycineState.phAdjusted && !glycineState.glyPrepared && !loading && prepareGlycine()}
            style={{ 
              opacity: activeTab === 3 && glycineState.phAdjusted && !glycineState.glyPrepared ? 1 : 0.5,
              cursor: activeTab === 3 && glycineState.phAdjusted && !glycineState.glyPrepared ? 'pointer' : 'not-allowed'
            }}
          >
            <div className="bottle-cap" style={{ backgroundColor: '#1e293b' }}></div>
            <div className="bottle-body">
              <div className="bottle-liquid" style={{ height: '60%', backgroundColor: 'rgba(248, 250, 252, 0.5)' }}></div>
              <div className="bottle-label">Gly</div>
            </div>
            <span className="bottle-name">글라이신 가루</span>
          </div>

          <div 
            className="reagent-bottle"
            onClick={() => activeTab === 0 && subStep === 2 && !loading && pourWaterToBeaker()}
            style={{ 
              opacity: activeTab === 0 && subStep === 2 ? 1 : 0.5,
              cursor: activeTab === 0 && subStep === 2 ? 'pointer' : 'not-allowed'
            }}
          >
            <div className="bottle-cap"></div>
            <div className="bottle-body">
              <div className="bottle-liquid" style={{ height: '90%', backgroundColor: 'rgba(56, 189, 248, 0.2)' }}></div>
              <div className="bottle-label">H₂O</div>
            </div>
            <span className="bottle-name">씻기병(증류수)</span>
          </div>
        </div>

        {/* Bench Bottom Controls */}
        <div className="bench-controls">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>
            <Info size={16} style={{ color: 'var(--accent-blue)' }} />
            <span>각 실험을 차례로 눌러 완료하면 큐벳들이 랙에 꽂힙니다.</span>
          </div>
          <div className="bench-actions">
            <button 
              className="control-btn"
              onClick={() => {
                if (window.confirm("현재 실험 탭의 상태를 초기화하시겠습니까?")) {
                  if (activeTab === 0) {
                    setSubStep(0);
                    setBeakerLiquid(0);
                    setFlaskLiquid(0);
                    setRinseCount(0);
                    setShaken(false);
                    setScaleState({ power: false, tare: false, weight: 0.00 });
                  } else if (activeTab === 1) {
                    setSubStep(0);
                    setNaclState({ cuAdded: false, naclDrops: 0, solutionColor: 'var(--color-cuso4)', inCuvette: false });
                  } else if (activeTab === 2) {
                    setSubStep(0);
                    setNh3State({ cuAdded: false, nh3Drops: 0, hasPrecipitate: false, isComplexFormed: false, solutionColor: 'var(--color-cuso4)', diluted: false, inCuvette: false });
                  } else if (activeTab === 3) {
                    setSubStep(0);
                    setGlycineState({ cuAdded: false, phAdjusted: false, phTestColor: '#fde047', phTestResult: 'pH 4 (산성)', glyPrepared: false, mixed: false, diluted: false, solutionColor: 'var(--color-cuso4)', inCuvette: false });
                  }
                }
              }}
            >
              <RefreshCw size={14} style={{ marginRight: '4px' }} />
              현재 탭 초기화
            </button>
            <button
              className="control-btn primary"
              disabled={!isAllReactionsFinished}
              onClick={nextPhase}
            >
              <span>UV-Vis 분광 기기실 이동</span>
              <ChevronRight size={14} style={{ marginLeft: '4px' }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LabBench;
