import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, ChevronLeft, ChevronRight, Activity, Info, BarChart2 } from 'lucide-react';

function Spectroscopy({ cuvettes, scannedData, setScannedData, nextPhase, prevPhase }) {
  // Current active loaded cuvette in the slot: 'none', 'blank', 'c1', 'c2', 'c3'
  const [loadedCuvette, setLoadedCuvette] = useState('none');
  
  // Instrument config states
  const [projName, setProjName] = useState('휘문화학부_리간드실험');
  const [wavelengthRange, setWavelengthRange] = useState({ start: 400, end: 900, step: 2 });
  const [instrumentMode, setInstrumentMode] = useState('Spectrum');
  const [baselineDone, setBaselineDone] = useState(false);
  
  // Scan animation states
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0); // 0 to 100
  const [activeScanTarget, setActiveScanTarget] = useState(null);

  // Tooltip tracking
  const [hoverWavelength, setHoverWavelength] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const chartRef = useRef(null);

  // Absorption curve definitions
  // X: 400 ~ 900 nm, Y: 0.0 ~ 2.0 (Absorbance)
  const getAbsorbance = (target, wl) => {
    switch (target) {
      case 'blank':
        return 0.02 + Math.random() * 0.01; // nearly zero
      case 'c1': // NaCl [CuCl4]2- (yellow-green, peaks around 740nm)
        // broad peak around 740nm
        const peak1 = 740;
        const width1 = 120;
        const maxAbs1 = 1.35;
        return maxAbs1 * Math.exp(-Math.pow(wl - peak1, 2) / (2 * Math.pow(width1, 2))) + 0.15;
      case 'c2': // NH3 [Cu(NH3)4(H2O)2]2+ (deep blue, peaks around 610nm)
        // sharp peak around 610nm
        const peak2 = 610;
        const width2 = 60;
        const maxAbs2 = 1.62;
        return maxAbs2 * Math.exp(-Math.pow(wl - peak2, 2) / (2 * Math.pow(width2, 2))) + 0.05;
      case 'c3': // Glycine [Cu(Gly)2] (violet, peaks around 630nm)
        // moderate peak around 630nm
        const peak3 = 630;
        const width3 = 80;
        const maxAbs3 = 1.18;
        return maxAbs3 * Math.exp(-Math.pow(wl - peak3, 2) / (2 * Math.pow(width3, 2))) + 0.08;
      default:
        return 0;
    }
  };

  // Generate SVG Path data for a specific target
  const generatePathData = (target, progressVal = 100) => {
    const points = [];
    const width = 600;
    const height = 320;
    
    // Calculate total wavelengths to scan based on progress
    const totalScanWavelength = 400 + (500 * (progressVal / 100));

    for (let wl = 400; wl <= totalScanWavelength; wl += 5) {
      const abs = getAbsorbance(target, wl);
      const x = ((wl - 400) / 500) * width;
      const y = height - (abs / 2.0) * height; // Scale 0~2 Abs over 320px
      points.push(`${x},${y}`);
    }
    
    return points.length > 0 ? `M ${points.join(' L ')}` : '';
  };

  // Run scan simulation
  const startScan = () => {
    if (loadedCuvette === 'none') {
      alert("분광기에 측정할 큐벳을 장착해 주세요!");
      return;
    }
    if (loadedCuvette !== 'blank' && !baselineDone) {
      alert("시료를 측정하기 전에 Blank(증류수)를 넣고 베이스라인을 먼저 측정해야 합니다!");
      return;
    }

    setIsScanning(true);
    setScanProgress(0);
    setActiveScanTarget(loadedCuvette);
  };

  useEffect(() => {
    let interval;
    if (isScanning) {
      interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsScanning(false);
            // Mark scanned data
            setScannedData(prevData => ({
              ...prevData,
              [activeScanTarget]: true
            }));
            if (activeScanTarget === 'blank') {
              setBaselineDone(true);
              alert("베이스라인 보정이 완료되었습니다!");
            }
            return 100;
          }
          return prev + 4; // Scan speed
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isScanning, activeScanTarget]);

  // Handle slot click
  const loadCuvetteToSlot = (type) => {
    if (isScanning) return;
    setLoadedCuvette(type);
  };

  const unloadCuvette = () => {
    if (isScanning) return;
    setLoadedCuvette('none');
  };

  // Hover over chart to read details
  const handleMouseMove = (e) => {
    if (!chartRef.current) return;
    const rect = chartRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert x to wavelength
    const chartWidth = rect.width;
    const wavelength = Math.round(400 + (x / chartWidth) * 500);
    
    if (wavelength >= 400 && wavelength <= 900) {
      setHoverWavelength(wavelength);
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  const handleMouseLeave = () => {
    setHoverWavelength(null);
  };

  // Color mappings for UI
  const cuvetteColors = {
    blank: 'rgba(241, 245, 249, 0.4)',
    c1: 'var(--color-nacl-reaction)',
    c2: 'rgba(59, 130, 246, 0.8)',
    c3: 'rgba(167, 139, 250, 0.7)',
  };

  const lineColors = {
    blank: '#cbd5e1', // Grayish/white
    c1: '#a3e635',    // Lime
    c2: '#3b82f6',    // Blue
    c3: '#a78bfa',    // Purple
  };

  const labels = {
    blank: 'B (바탕 시료)',
    c1: '①번 수용액 (포화 NaCl 반응)',
    c2: '②번 수용액 (진한 암모니아 반응)',
    c3: '③번 수용액 (글라이신 반응)',
  };

  const isAllScanned = scannedData.c1 && scannedData.c2 && scannedData.c3;

  return (
    <div className="spectroscopy-layout">
      {/* Device & Rack controls */}
      <div className="device-panel">
        {/* Cuvette Rack */}
        <div className="glass-card" style={{ padding: '1.25rem', marginBottom: 0 }}>
          <h3 className="card-title" style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>큐벳 보관대 (Cuvette Rack)</h3>
          <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '1rem' }}>큐벳을 클릭하면 분광기에 자동으로 장착됩니다.</p>
          
          <div className="cuvette-rack">
            {/* Blank Cuvette */}
            <div 
              className="cuvette-slot" 
              onClick={() => loadCuvetteToSlot('blank')}
              style={{ borderColor: loadedCuvette === 'blank' ? 'var(--accent-blue)' : '' }}
            >
              {loadedCuvette !== 'blank' && (
                <div className="cuvette">
                  <div className="cuvette-liquid" style={{ backgroundColor: cuvetteColors.blank }}></div>
                  <div className="cuvette-label">B</div>
                </div>
              )}
              {loadedCuvette === 'blank' && <span style={{ fontSize: '0.65rem', color: '#64748b' }}>장착됨</span>}
            </div>

            {/* Cuvette 1 (NaCl) */}
            <div 
              className="cuvette-slot"
              onClick={() => cuvettes.c1 && loadCuvetteToSlot('c1')}
              style={{ 
                opacity: cuvettes.c1 ? 1 : 0.4, 
                cursor: cuvettes.c1 ? 'pointer' : 'not-allowed',
                borderColor: loadedCuvette === 'c1' ? 'var(--accent-blue)' : ''
              }}
            >
              {cuvettes.c1 && loadedCuvette !== 'c1' ? (
                <div className="cuvette">
                  <div className="cuvette-liquid" style={{ backgroundColor: cuvetteColors.c1 }}></div>
                  <div className="cuvette-label">①</div>
                </div>
              ) : (
                <span style={{ fontSize: '0.65rem', color: '#64748b', textAlign: 'center' }}>
                  {loadedCuvette === 'c1' ? '장착됨' : '미완성'}
                </span>
              )}
            </div>

            {/* Cuvette 2 (NH3) */}
            <div 
              className="cuvette-slot"
              onClick={() => cuvettes.c2 && loadCuvetteToSlot('c2')}
              style={{ 
                opacity: cuvettes.c2 ? 1 : 0.4, 
                cursor: cuvettes.c2 ? 'pointer' : 'not-allowed',
                borderColor: loadedCuvette === 'c2' ? 'var(--accent-blue)' : ''
              }}
            >
              {cuvettes.c2 && loadedCuvette !== 'c2' ? (
                <div className="cuvette">
                  <div className="cuvette-liquid" style={{ backgroundColor: cuvetteColors.c2 }}></div>
                  <div className="cuvette-label">②</div>
                </div>
              ) : (
                <span style={{ fontSize: '0.65rem', color: '#64748b', textAlign: 'center' }}>
                  {loadedCuvette === 'c2' ? '장착됨' : '미완성'}
                </span>
              )}
            </div>

            {/* Cuvette 3 (Glycine) */}
            <div 
              className="cuvette-slot"
              onClick={() => cuvettes.c3 && loadCuvetteToSlot('c3')}
              style={{ 
                opacity: cuvettes.c3 ? 1 : 0.4, 
                cursor: cuvettes.c3 ? 'pointer' : 'not-allowed',
                borderColor: loadedCuvette === 'c3' ? 'var(--accent-blue)' : ''
              }}
            >
              {cuvettes.c3 && loadedCuvette !== 'c3' ? (
                <div className="cuvette">
                  <div className="cuvette-liquid" style={{ backgroundColor: cuvetteColors.c3 }}></div>
                  <div className="cuvette-label">③</div>
                </div>
              ) : (
                <span style={{ fontSize: '0.65rem', color: '#64748b', textAlign: 'center' }}>
                  {loadedCuvette === 'c3' ? '장착됨' : '미완성'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* UV-Vis Spectrometer */}
        <div className="spectroscopy-device">
          <div className="device-screen">
            <div className="screen-row">
              <span>프로젝트 명:</span>
              <span className="screen-value">{projName}</span>
            </div>
            <div className="screen-row">
              <span>측정 모드:</span>
              <span className="screen-value">{instrumentMode}</span>
            </div>
            <div className="screen-row">
              <span>파장 범위:</span>
              <span className="screen-value">400 - 900 nm</span>
            </div>
            <div className="screen-row">
              <span>장치 상태:</span>
              <span className="screen-status">
                {isScanning ? '스캔 중 (Scanning...)' : loadedCuvette === 'none' ? '측정 대기 (Idle)' : `${labels[loadedCuvette]} 장착됨`}
              </span>
            </div>
          </div>

          {/* Device Slot */}
          <div className="device-slot">
            {isScanning && <div className="uv-beam"></div>}
            
            {loadedCuvette !== 'none' ? (
              <div 
                className="cuvette" 
                onClick={unloadCuvette}
                style={{ cursor: isScanning ? 'not-allowed' : 'pointer' }}
              >
                <div className="cuvette-liquid" style={{ backgroundColor: cuvetteColors[loadedCuvette] }}></div>
                <div className="cuvette-label">{loadedCuvette === 'blank' ? 'B' : loadedCuvette === 'c1' ? '①' : loadedCuvette === 'c2' ? '②' : '③'}</div>
              </div>
            ) : (
              <span style={{ fontSize: '0.75rem', color: '#475569' }}>큐벳을 슬롯에 넣어주세요</span>
            )}
          </div>

          {/* Controls */}
          <div className="device-buttons">
            <button 
              onClick={startScan}
              disabled={isScanning || loadedCuvette === 'none'}
              className="device-btn active"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
            >
              <Play size={14} />
              {loadedCuvette === 'blank' ? 'Baseline 바탕값 보정' : '흡광 스펙트럼 측정'}
            </button>
            <button 
              onClick={unloadCuvette}
              disabled={isScanning || loadedCuvette === 'none'}
              className="device-btn"
            >
              큐벳 슬롯에서 분리
            </button>
          </div>
        </div>
      </div>

      {/* Interactive SVG Chart Panel */}
      <div className="chart-container">
        <div className="chart-header">
          <h3 className="card-title" style={{ fontSize: '1.2rem', marginBottom: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart2 size={20} color="var(--accent-purple)" />
            <span>흡광도 스펙트럼 (UV-Vis Spectrum)</span>
          </h3>
          
          <div className="chart-legend">
            {baselineDone && (
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: lineColors.blank }}></div>
                <span>B</span>
              </div>
            )}
            {scannedData.c1 && (
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: lineColors.c1 }}></div>
                <span>① (NaCl)</span>
              </div>
            )}
            {scannedData.c2 && (
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: lineColors.c2 }}></div>
                <span>② (NH₃)</span>
              </div>
            )}
            {scannedData.c3 && (
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: lineColors.c3 }}></div>
                <span>③ (Glycine)</span>
              </div>
            )}
          </div>
        </div>

        {/* SVG DRAWING AREA */}
        <div 
          className="svg-chart-wrapper"
          ref={chartRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <svg width="100%" height="320" viewBox="0 0 600 320" style={{ overflow: 'visible' }}>
            {/* Grid Lines */}
            {[0, 0.5, 1.0, 1.5, 2.0].map((val, idx) => {
              const y = 320 - (val / 2.0) * 320;
              return (
                <g key={idx}>
                  <line x1="0" y1={y} x2="600" y2={y} className="chart-grid-line" />
                  <text x="-32" y={y + 4} className="chart-text">{val.toFixed(1)}</text>
                </g>
              );
            })}
            
            {/* X Axis Wavelength Grid */}
            {[400, 500, 600, 700, 800, 900].map((wl, idx) => {
              const x = ((wl - 400) / 500) * 600;
              return (
                <g key={idx}>
                  <line x1={x} y1="0" x2={x} y2="320" className="chart-grid-line" />
                  <text x={x - 12} y="340" className="chart-text">{wl}</text>
                </g>
              );
            })}

            {/* Base Axes lines */}
            <line x1="0" y1="320" x2="600" y2="320" className="chart-axis" />
            <line x1="0" y1="0" x2="0" y2="320" className="chart-axis" />

            {/* SCANNED SPECTRUM PATHS */}
            {/* 1. Baseline Blank */}
            {scannedData.blank && (
              <path 
                d={generatePathData('blank', activeScanTarget === 'blank' ? scanProgress : 100)}
                fill="none"
                stroke={lineColors.blank}
                strokeWidth={2}
                strokeDasharray={activeScanTarget === 'blank' ? "0" : "4 4"}
              />
            )}
            
            {/* 2. NaCl (c1) */}
            {scannedData.c1 && (
              <path 
                d={generatePathData('c1', activeScanTarget === 'c1' ? scanProgress : 100)}
                fill="none"
                stroke={lineColors.c1}
                strokeWidth={3.5}
                filter="drop-shadow(0 0 6px rgba(163, 230, 53, 0.4))"
              />
            )}

            {/* 3. NH3 (c2) */}
            {scannedData.c2 && (
              <path 
                d={generatePathData('c2', activeScanTarget === 'c2' ? scanProgress : 100)}
                fill="none"
                stroke={lineColors.c2}
                strokeWidth={3.5}
                filter="drop-shadow(0 0 6px rgba(59, 130, 246, 0.4))"
              />
            )}

            {/* 4. Glycine (c3) */}
            {scannedData.c3 && (
              <path 
                d={generatePathData('c3', activeScanTarget === 'c3' ? scanProgress : 100)}
                fill="none"
                stroke={lineColors.c3}
                strokeWidth={3.5}
                filter="drop-shadow(0 0 6px rgba(167, 139, 250, 0.4))"
              />
            )}

            {/* Interlacing Laser Scan Bar */}
            {isScanning && (
              <line 
                x1={`${(scanProgress / 100) * 600}`} 
                y1="0" 
                x2={`${(scanProgress / 100) * 600}`} 
                y2="320" 
                stroke="var(--accent-rose)" 
                strokeWidth="2.5"
                filter="drop-shadow(0 0 8px #fb7185)"
              />
            )}

            {/* Interactive Tooltip Overlay */}
            {hoverWavelength && !isScanning && (
              <g>
                <line 
                  x1={`${((hoverWavelength - 400) / 500) * 600}`} 
                  y1="0" 
                  x2={`${((hoverWavelength - 400) / 500) * 600}`} 
                  y2="320" 
                  stroke="rgba(255,255,255,0.2)" 
                  strokeWidth="1"
                />
              </g>
            )}
          </svg>
          
          {/* Tooltip HTML Box */}
          {hoverWavelength && !isScanning && (
            <div 
              style={{
                position: 'absolute',
                top: `${mousePos.y - 120}px`,
                left: `${mousePos.x + 15}px`,
                background: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid var(--glass-border)',
                borderRadius: '6px',
                padding: '0.6rem 0.8rem',
                zIndex: 40,
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                pointerEvents: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}
            >
              <div style={{ color: '#fff', fontWeight: 'bold', marginBottom: '0.25rem' }}>파장: {hoverWavelength} nm</div>
              {scannedData.c1 && (
                <div style={{ color: lineColors.c1 }}>①번 용액 (NaCl): {getAbsorbance('c1', hoverWavelength).toFixed(3)} Abs</div>
              )}
              {scannedData.c2 && (
                <div style={{ color: lineColors.c2 }}>②번 용액 (NH₃): {getAbsorbance('c2', hoverWavelength).toFixed(3)} Abs</div>
              )}
              {scannedData.c3 && (
                <div style={{ color: lineColors.c3 }}>③번 용액 (글라이신): {getAbsorbance('c3', hoverWavelength).toFixed(3)} Abs</div>
              )}
            </div>
          )}
        </div>

        {/* Labels below chart */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.85rem' }}>
          <span>Y축: 흡광도 (Absorbance)</span>
          <span>X축: 파장 (Wavelength, nm)</span>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="glass-card" style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', marginBottom: 0 }}>
        <button className="control-btn" onClick={prevPhase} disabled={isScanning}>
          <ChevronLeft size={14} style={{ marginRight: '4px' }} />
          <span>실험대로 돌아가기</span>
        </button>

        {!isAllScanned && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>
            <Info size={16} color="var(--accent-blue)" />
            <span>큐벳 ①, ②, ③을 각각 분광기 측정 슬롯에 장착하여 측정을 완료하세요. (큐벳 B는 바탕값 보정용)</span>
          </div>
        )}

        <button 
          className="control-btn primary"
          disabled={!isAllScanned || isScanning}
          onClick={nextPhase}
        >
          <span>실험 보고서 작성실 이동</span>
          <ChevronRight size={14} style={{ marginLeft: '4px' }} />
        </button>
      </div>
    </div>
  );
}

export default Spectroscopy;
