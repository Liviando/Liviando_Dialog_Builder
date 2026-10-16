import { memo, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import { GitBranch, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../../store/store';

function ChoiceNode({ id, data, selected }) {
  const { dispatch } = useStore();
  const options = data.options || [];

  const stopPropagation = useCallback((e) => e.stopPropagation(), []);

  return (
    <div className={`node-choice ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Left} id="input"
        style={{ top: '24px', background: '#7c3aed', borderColor: '#5b21b6' }} />

      <div className="node-header node-header-choice">
        <GitBranch size={12} />
        <span>Choice</span>
        <span style={{ marginLeft: 'auto', fontFamily: 'JetBrains Mono', fontSize: '10px', opacity: 0.6 }}>
          #{id}
        </span>
      </div>

      <div className="node-body" onMouseDown={stopPropagation}>
        {/* Prompt */}
        <div className="node-field">
          <label>Prompt Text</label>
          <textarea
            className="node-input node-textarea"
            placeholder="e.g. Will you be eating tonight?"
            value={data.prompt || ''}
            onChange={e => dispatch({ type: 'UPDATE_NODE_DATA', payload: { id, patch: { prompt: e.target.value } } })}
            rows={2}
          />
        </div>

        {/* Options */}
        {options.map((opt, idx) => (
          <div key={opt.optId} className="choice-option" style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
              <span style={{
                fontSize: '10px', fontWeight: 700, color: 'var(--accent-purple-light)',
                background: 'rgba(124,58,237,0.2)', borderRadius: '4px',
                padding: '1px 5px', flexShrink: 0,
              }}>
                {idx + 1}
              </span>
              <input
                className="node-input"
                style={{ flex: 1, fontSize: '11px', padding: '4px 6px' }}
                placeholder={`Option ${idx + 1}…`}
                value={opt.text}
                onChange={e => dispatch({ type: 'UPDATE_CHOICE_OPTION', payload: { nodeId: id, optId: opt.optId, patch: { text: e.target.value } } })}
              />
              {options.length > 1 && (
                <button
                  onClick={() => dispatch({ type: 'DELETE_CHOICE_OPTION', payload: { nodeId: id, optId: opt.optId } })}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-red)', padding: '2px', flexShrink: 0 }}
                >
                  <Trash2 size={11} />
                </button>
              )}
            </div>
            <input
              className="node-input"
              style={{ fontSize: '10px', padding: '3px 6px' }}
              placeholder="Required tag (optional)…"
              value={opt.requiredTag || ''}
              onChange={e => dispatch({ type: 'UPDATE_CHOICE_OPTION', payload: { nodeId: id, optId: opt.optId, patch: { requiredTag: e.target.value } } })}
            />
            <Handle
              type="source"
              position={Position.Right}
              id={`option-${opt.optId}`}
              style={{ top: '50%', right: '-6px', background: '#ec4899', borderColor: '#be185d', width: '10px', height: '10px' }}
            />
          </div>
        ))}

        <button
          onClick={() => dispatch({ type: 'ADD_CHOICE_OPTION', payload: { nodeId: id } })}
          style={{
            display: 'flex', alignItems: 'center', gap: '5px', width: '100%',
            padding: '5px 8px', marginTop: '4px',
            background: 'rgba(124,58,237,0.1)', border: '1px dashed rgba(124,58,237,0.3)',
            borderRadius: '6px', color: '#a78bfa', fontSize: '11px',
            cursor: 'pointer', justifyContent: 'center', transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(124,58,237,0.1)'}
        >
          <Plus size={11} /> Add Option
        </button>
      </div>
    </div>
  );
}

export default memo(ChoiceNode);
