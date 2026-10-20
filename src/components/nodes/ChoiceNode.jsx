import { memo, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import { GitBranch, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../../store/store';
import {
  resolveActorImage, resolveExpressionImage,
  applyBBCode, parseBBCodeToReact,
} from '../../utils/dialogue';

function ChoiceNode({ id, data, selected }) {
  const { state, dispatch } = useStore();
  const { actors } = state;
  const options = data.options || [];

  const actor = actors.find(a => a.name === data.actorName) || null;
  const expressions = actor?.expressions || [];

  const stopPropagation = useCallback((e) => e.stopPropagation(), []);

  const update = useCallback((patch) => {
    dispatch({ type: 'UPDATE_NODE_DATA', payload: { id, patch } });
  }, [dispatch, id]);

  return (
    <div className={`node-choice ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Left} id="input"
        style={{ top: '24px', background: '#7c3aed', borderColor: '#5b21b6' }} />

      <div className="node-header node-header-choice">
        <GitBranch size={12} />
        <span>Choice</span>
        <span style={{ marginLeft: 'auto', fontFamily: 'JetBrains Mono', fontSize: '10px', opacity: 0.8, color: id === 'start' ? '#34d399' : 'inherit' }}>
          #{id}
        </span>
      </div>

      <div className="node-body" onMouseDown={stopPropagation}>
        {/* Actor Selection */}
        <div className="node-field">
          <label>Actor</label>
          <select
            className="node-input node-select"
            value={data.actorName || ''}
            onChange={e => update({ actorName: e.target.value, expressionName: '' })}
          >
            <option value="">— None —</option>
            {actors.map(a => <option key={a.name} value={a.name}>{a.name}</option>)}
          </select>
        </div>

        {/* Expression Selection */}
        {actor && expressions.length > 0 && (
          <div className="node-field">
            <label>Expression</label>
            <select
              className="node-input node-select"
              value={data.expressionName || ''}
              onChange={e => update({ expressionName: e.target.value })}
            >
              <option value="">— Default —</option>
              {expressions.map(ex => <option key={ex.name} value={ex.name}>{ex.name}</option>)}
            </select>
          </div>
        )}

        {/* Image Preview Chips */}
        {actor && (
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '6px' }}>
            <span className="tag-chip" style={{ background: 'rgba(59,130,246,0.15)', borderColor: 'rgba(59,130,246,0.25)', color: '#93c5fd' }}>
              {resolveActorImage(actor)}
            </span>
            {data.expressionName && (
              <span className="tag-chip" style={{ background: 'rgba(236,72,153,0.15)', borderColor: 'rgba(236,72,153,0.25)', color: '#f9a8d4' }}>
                {resolveExpressionImage(actor, data.expressionName)}
              </span>
            )}
          </div>
        )}

        {/* Node Level Grant / Revoke Tags */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '9px', fontWeight: 600, color: '#34d399', textTransform: 'uppercase' }}>+ Grant Tag</label>
            <input
              className="node-input"
              style={{ fontSize: '10px', padding: '3px 6px', fontFamily: 'JetBrains Mono' }}
              placeholder="e.g. choice_opened"
              value={data.grantTag || ''}
              onChange={e => update({ grantTag: e.target.value })}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '9px', fontWeight: 600, color: '#f87171', textTransform: 'uppercase' }}>- Revoke Tag</label>
            <input
              className="node-input"
              style={{ fontSize: '10px', padding: '3px 6px', fontFamily: 'JetBrains Mono' }}
              placeholder="e.g. pending_choice"
              value={data.revokeTag || ''}
              onChange={e => update({ revokeTag: e.target.value })}
            />
          </div>
        </div>

        {/* BBCode Prompt Quick Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <label style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Prompt Text</label>
          <div style={{ display: 'flex', gap: '3px' }}>
            <button
              type="button"
              onClick={() => update({ prompt: applyBBCode(data.prompt || '', 'b') })}
              style={{ padding: '1px 5px', fontSize: '10px', fontWeight: 700, borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', cursor: 'pointer' }}
            >
              B
            </button>
            <button
              type="button"
              onClick={() => update({ prompt: applyBBCode(data.prompt || '', 'i') })}
              style={{ padding: '1px 5px', fontSize: '10px', fontStyle: 'italic', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', cursor: 'pointer' }}
            >
              I
            </button>
            <button
              type="button"
              onClick={() => update({ prompt: applyBBCode(data.prompt || '', 'color', '#8b5cf6') })}
              style={{ padding: '1px 5px', fontSize: '10px', borderRadius: '4px', border: '1px solid var(--border)', background: 'rgba(139,92,246,0.2)', color: '#c4b5fd', cursor: 'pointer' }}
            >
              Color
            </button>
          </div>
        </div>

        {/* Prompt */}
        <div className="node-field">
          <textarea
            className="node-input node-textarea"
            placeholder="e.g. What will you do?"
            value={data.prompt || ''}
            onChange={e => update({ prompt: e.target.value })}
            rows={2}
          />
        </div>

        {/* Live Prompt Preview */}
        {data.prompt && (
          <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', padding: '6px', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: 1.4 }}>
            <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginBottom: '2px', textTransform: 'uppercase' }}>Prompt Preview:</div>
            {parseBBCodeToReact(data.prompt)}
          </div>
        )}

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
                placeholder={`Option ${idx + 1} text…`}
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

            {/* Option Requirements & Tag Operations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <input
                className="node-input"
                style={{ fontSize: '10px', padding: '3px 6px', fontFamily: 'JetBrains Mono' }}
                placeholder="Required tag (optional)…"
                value={opt.requiredTag || ''}
                onChange={e => dispatch({ type: 'UPDATE_CHOICE_OPTION', payload: { nodeId: id, optId: opt.optId, patch: { requiredTag: e.target.value } } })}
              />
              <div style={{ display: 'flex', gap: '4px' }}>
                <input
                  className="node-input"
                  style={{ fontSize: '10px', padding: '3px 6px', fontFamily: 'JetBrains Mono', color: '#34d399' }}
                  placeholder="+ Grant tag…"
                  value={opt.grantTag || ''}
                  onChange={e => dispatch({ type: 'UPDATE_CHOICE_OPTION', payload: { nodeId: id, optId: opt.optId, patch: { grantTag: e.target.value } } })}
                />
                <input
                  className="node-input"
                  style={{ fontSize: '10px', padding: '3px 6px', fontFamily: 'JetBrains Mono', color: '#f87171' }}
                  placeholder="- Revoke tag…"
                  value={opt.revokeTag || ''}
                  onChange={e => dispatch({ type: 'UPDATE_CHOICE_OPTION', payload: { nodeId: id, optId: opt.optId, patch: { revokeTag: e.target.value } } })}
                />
              </div>
            </div>

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