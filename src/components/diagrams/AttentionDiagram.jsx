import { useCallback } from 'react';
import { scaleLinear } from 'd3-scale';
import { interpolateRgb } from 'd3-interpolate';
import { useDiagramSetup } from './useDiagramSetup';
import tokenizerDemo from '../../../docs/code/tokenizer_demo.json';
import { ILLUSTRATIVE_ATTENTION_SCORES, ILLUSTRATIVE_ATTENTION_WEIGHTS } from '../../data/attentionDemo.js';

const W = 480, H = 340;
const TOKENS = tokenizerDemo.token_pieces.slice(0, 3);
const TOKEN_IDS = tokenizerDemo.token_ids.slice(0, 3);
const CELL = 62;
const GRID_X = (W - TOKENS.length * CELL) / 2;
const GRID_Y = 80;
function AttentionOverview() {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '12px' }}>
      <svg viewBox="0 0 480 300" role="presentation" aria-hidden="true" data-object-id="attention.matrix" style={{ width: '100%', maxHeight: '86%', overflow: 'visible' }}>
        <defs>
          <marker id="attention-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#a9bcb2" />
          </marker>
        </defs>
        <text x="240" y="24" textAnchor="middle" fill="#d8e2db" fontSize="11" fontFamily="Manrope Variable, sans-serif" letterSpacing="1.2">ONE TOKEN POSITION, THREE PROJECTIONS</text>
        <rect x="22" y="48" width="94" height="42" rx="7" fill="#243b35" stroke="#577168" />
        <text x="69" y="74" textAnchor="middle" fill="#f0ede4" fontSize="13" fontFamily="Manrope Variable, sans-serif">Input xᵢ</text>
        <path d="M116 69 C138 69 134 48 154 48 M116 69 H154 M116 69 C138 69 134 90 154 90" fill="none" stroke="#a9bcb2" strokeWidth="1.4" />
        {[
          { label: 'Q · query', y: 34, fill: '#d9cfff', ink: '#403666' },
          { label: 'K · key', y: 62, fill: '#c7e4d4', ink: '#285243' },
          { label: 'V · value', y: 90, fill: '#f0d7c3', ink: '#713e23' },
        ].map(({ label, y, fill, ink }) => (
          <g key={label}>
            <rect x="154" y={y} width="94" height="25" rx="6" fill={fill} />
            <text x="201" y={y + 17} textAnchor="middle" fill={ink} fontSize="11" fontWeight="650" fontFamily="Manrope Variable, sans-serif">{label}</text>
          </g>
        ))}
        <text x="240" y="135" textAnchor="middle" fill="#b8c8bf" fontSize="10" fontFamily="Manrope Variable, sans-serif">COMPARE Q WITH EARLIER KEYS</text>
        {[
          { x: 14, width: 110, label: 'Scaled scores', detail: 'QKᵀ / √dₖ' },
          { x: 132, width: 92, label: 'Causal mask', detail: 'hide future' },
          { x: 232, width: 88, label: 'Softmax', detail: 'weights sum to 1' },
          { x: 328, width: 138, label: 'Weighted values', detail: 'mix permitted V' },
        ].map(({ x, width, label, detail }, index, stages) => (
          <g key={label}>
            <rect x={x} y="151" width={width} height="51" rx="7" fill="#263b37" stroke={index === 2 ? '#a895c6' : '#526a61'} />
            <text x={x + width / 2} y="173" textAnchor="middle" fill="#f0ede4" fontSize="11" fontWeight="650" fontFamily="Manrope Variable, sans-serif">{label}</text>
            <text x={x + width / 2} y="190" textAnchor="middle" fill="#b8c8bf" fontSize="9" fontFamily="Manrope Variable, sans-serif">{detail}</text>
            {index < stages.length - 1 && <path d={`M${x + width + 2} 176 H${stages[index + 1].x - 6}`} fill="none" stroke="#a9bcb2" strokeWidth="1.4" markerEnd="url(#attention-arrow)" />}
          </g>
        ))}
        <path d="M397 203 V232 H289" fill="none" stroke="#a9bcb2" strokeWidth="1.4" markerEnd="url(#attention-arrow)" />
        <rect x="146" y="224" width="144" height="39" rx="7" fill="#354740" stroke="#7c8f84" />
        <text x="218" y="248" textAnchor="middle" fill="#f0ede4" fontSize="11" fontFamily="Manrope Variable, sans-serif">Join heads · project</text>
        <circle cx="342" cy="243" r="15" fill="#473b5e" stroke="#bba9d8" />
        <text x="342" y="249" textAnchor="middle" fill="#f0ede4" fontSize="18" fontFamily="Manrope Variable, sans-serif">+</text>
        <path d="M69 91 V283 H342 V258" fill="none" stroke="#c3a4bb" strokeWidth="1.25" strokeDasharray="4 4" markerEnd="url(#attention-arrow)" />
        <text x="84" y="278" fill="#d8c3d2" fontSize="9" fontFamily="Manrope Variable, sans-serif">residual input</text>
        <path d="M357 243 H402" fill="none" stroke="#a9bcb2" strokeWidth="1.4" markerEnd="url(#attention-arrow)" />
        <text x="421" y="239" textAnchor="middle" fill="#f0ede4" fontSize="10" fontFamily="Manrope Variable, sans-serif">Updated</text>
        <text x="421" y="253" textAnchor="middle" fill="#f0ede4" fontSize="10" fontFamily="Manrope Variable, sans-serif">representation</text>
      </svg>
      <p style={{ marginTop: '10px', fontSize: '12px', color: '#cbd5e1', textAlign: 'center', fontFamily: 'Manrope Variable, sans-serif' }}>
        From query, key, and value projections to a context-aware representation
      </p>
    </div>
  );
}

export function AttentionDiagram({ step = 0, progress = 1, selectedTokenId = null }) {
  if (step <= 1) {
    return <AttentionOverview />;
  }

  return <AttentionHeatmap step={step} progress={progress} selectedTokenId={selectedTokenId} />;
}

function AttentionHeatmap({ step, progress, selectedTokenId }) {
  const selectedRow = Math.max(0, TOKEN_IDS.indexOf(selectedTokenId ?? TOKEN_IDS[1]));
  const scorePhase = Math.max(0, Math.min(1, step - 2 + progress));
  const maskPhase = Math.max(0, Math.min(1, step - 3 + progress));
  const weightPhase = Math.max(0, Math.min(1, step - 4 + progress));
  const initFn = useCallback((svg) => {
    svg.attr('viewBox', `0 0 ${W} ${H}`).attr('width', '100%').attr('height', '100%')
      .attr('data-object-id', 'attention.matrix');

    svg.append('text').attr('x', W / 2).attr('y', 28)
      .attr('text-anchor', 'middle').attr('fill', '#cbd5e1')
      .attr('font-size', 11).attr('font-family', 'Manrope Variable, sans-serif').attr('letter-spacing', '0.1em')
      .text('ILLUSTRATIVE ATTENTION VALUES (NOT MODEL OUTPUTS)');

    // Column headers (keys)
    TOKENS.forEach((t, j) => {
      svg.append('text').attr('x', GRID_X + j * CELL + CELL / 2).attr('y', 62)
        .attr('text-anchor', 'middle').attr('fill', '#cbd5e1')
        .attr('font-size', 13).attr('font-family', 'Manrope Variable, sans-serif').attr('font-weight', 500)
        .text(t.startsWith(' ') ? `␠${t.slice(1)}` : t);
    });

    // Row labels (queries)
    TOKENS.forEach((t, i) => {
      svg.append('text')
        .attr('x', GRID_X - 12).attr('y', GRID_Y + i * CELL + CELL / 2 + 5)
        .attr('text-anchor', 'end').attr('fill', '#cbd5e1')
        .attr('font-size', 13).attr('font-family', 'Manrope Variable, sans-serif').attr('font-weight', 500)
        .text(t.startsWith(' ') ? `␠${t.slice(1)}` : t);
    });

    // Cells
    TOKENS.forEach((_, i) => {
      TOKENS.forEach((_, j) => {
        svg.append('rect').attr('class', `cell-${i}-${j}`).attr('data-object-id', `attention.cell.${i + 1}.${j + 1}`)
          .attr('x', GRID_X + j * CELL + 2).attr('y', GRID_Y + i * CELL + 2)
          .attr('width', CELL - 4).attr('height', CELL - 4).attr('rx', 5)
          .attr('fill', '#0f172a').attr('opacity', 0);
        svg.append('text').attr('class', `cell-txt-${i}-${j}`).attr('data-object-id', `attention.cell-label.${i + 1}.${j + 1}`)
          .attr('x', GRID_X + j * CELL + CELL / 2).attr('y', GRID_Y + i * CELL + CELL / 2 + 6)
          .attr('text-anchor', 'middle').attr('fill', '#e8e8f0')
          .attr('font-size', 12).attr('font-family', 'JetBrains Mono, monospace')
          .attr('opacity', 0).text('');
      });
    });

    // Query highlight
    svg.append('rect').attr('class', 'query-row')
      .attr('x', GRID_X - 2).attr('y', GRID_Y + CELL + 2)
      .attr('width', TOKENS.length * CELL + 4).attr('height', CELL - 4)
      .attr('rx', 6).attr('fill', 'none').attr('stroke', '#fb923c')
      .attr('stroke-width', 1.5).attr('stroke-dasharray', '5,3').attr('opacity', 0);
    svg.append('text').attr('class', 'query-label')
      .attr('x', GRID_X + TOKENS.length * CELL + 14).attr('y', GRID_Y + CELL + CELL / 2 + 5)
      .attr('fill', '#fb923c').attr('font-size', 11).attr('font-family', 'Manrope Variable, sans-serif')
      .attr('opacity', 0).text(`query: "${TOKENS[1]}"`);

    svg.append('text').attr('class', 'softmax-label')
      .attr('x', W / 2).attr('y', 318)
      .attr('text-anchor', 'middle').attr('fill', '#cbd5e1')
      .attr('font-size', 11).attr('font-family', 'Manrope Variable, sans-serif')
      .attr('opacity', 0).text('softmax weights → weighted sum of values');
  }, []);

  const updateFn = useCallback((svg) => {
    const colorScale = scaleLinear().domain([0, 1]).range(['#0d1b2e', '#60a5fa']);

    svg.select('.query-row').attr('opacity', scorePhase);
    svg.select('.query-label').attr('opacity', scorePhase);

    TOKENS.forEach((_, i) => TOKENS.forEach((_, j) => {
      const raw = ILLUSTRATIVE_ATTENTION_SCORES[i][j];
      const weight = ILLUSTRATIVE_ATTENTION_WEIGHTS[i][j];
      const masked = j > i;
      const cell = svg.select(`.cell-${i}-${j}`);
      const label = svg.select(`.cell-txt-${i}-${j}`);
      const scoreColor = colorScale(Math.max(0, Math.min(raw / 3.5, 1)));
      const weightColor = colorScale(weight);
      const maskedColor = masked ? '#060a10' : scoreColor;
      const scoreAfterMask = interpolateRgb(scoreColor, maskedColor)(maskPhase);
      cell.attr('fill', interpolateRgb(scoreAfterMask, weightColor)(weightPhase))
        .attr('opacity', scorePhase);
      const scoreLabel = masked && maskPhase > 0.5 ? '−∞' : raw.toFixed(1);
      const weightLabel = weight === 0 ? '0' : weight.toFixed(2);
      label.attr('opacity', scorePhase).text(weightPhase > 0.25 ? weightLabel : scoreLabel);
    }));
    svg.select('.softmax-label').attr('opacity', weightPhase);
  }, [maskPhase, scorePhase, weightPhase]);

  const selectionFn = useCallback((svg) => {
    svg.select('.query-row').attr('y', GRID_Y + selectedRow * CELL + 2);
    svg.select('.query-label')
      .attr('y', GRID_Y + selectedRow * CELL + CELL / 2 + 5)
      .text(`query: "${TOKENS[selectedRow]}"`);
  }, [selectedRow]);
  const combinedUpdateFn = useCallback((svg, value) => {
    updateFn(svg, value);
    selectionFn(svg);
  }, [selectionFn, updateFn]);

  const svgRef = useDiagramSetup({ initFn, updateFn: combinedUpdateFn, step });
  return <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />;
}
