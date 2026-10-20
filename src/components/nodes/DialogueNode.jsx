import { memo, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import { MessageSquare, Volume2, Plus, Trash2, Tag } from 'lucide-react';
import { useStore } from '../../store/store';
import {
  resolveSoundCode, resolveActorImage, resolveExpressionImage,
  applyBBCode, parseBBCodeToReact,
} from '../../utils/dialogue';

const EXECUTION_RULES = ['ONCE', 'REPEAT_UNTIL_N_TIMES', 'UNTIL_NODE_ENDS'];
const TRIGGERS = ['ON_NODE_START'];

function DialogueNode({ id, data, selected }) {
  const { state, dispatch } = useStore();
  const { actors } = state;

  const actor = actors.find(a => a.name === data.actorName) || null;
  const expressions = actor?.expressions || [];

  const update = useCallback((patch) => {
    dispatch({ type: 'UPDATE_NODE_DATA', payload: { id, patch } });
  }, [dispatch, id]);

  const stopPropagation = useCallback((e) => e.stopPropagation(), []);

  const addTag = (tagType, tagValue) => {
    const current = data[tagType] || '';
    update({ [tagType]: applyBBCode(current, tagValue) });
  };

  return (
    <div className={`node-dialogue ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Left} id="input"
        style={{ top: '50%', background: '#3b82f6', borderColor: '#1d4ed8' }} />

      <div className="node-header node-header-dialogue">
        <MessageSquare size={12} />
        <span>Dialogue</span>
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

        {/* Image Chips */}
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

        {/* Integrated Grant/Revoke Tags */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '9px', fontWeight: 600, color: '#34d399', textTransform: 'uppercase' }}>+ Grant Tag</label>
            <input
              className="node-input"
              style={{ fontSize: '10px', padding: '3px 6px', fontFamily: 'JetBrains Mono' }}
              placeholder="e.g. met_npc"
              value={data.grantTag || ''}
              onChange={e => update({ grantTag: e.target.value })}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '9px', fontWeight: 600, color: '#f87171', textTransform: 'uppercase' }}>- Revoke Tag</label>
            <input
              className="node-input"
              style={{ fontSize: '10px', padding: '3px 6px', fontFamily: 'JetBrains Mono' }}
              placeholder="e.g. has_item"
              value={data.revokeTag || ''}
              onChange={e => update({ revokeTag: e.target.value })}
            />
          </div>
        </div>

        {/* BBCode Text Formatting Quick Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <label style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Dialogue Text</label>
          <div style={{ display: 'flex', gap: '3px' }}>
            <button
              type="button"
              onClick={() => update({ text: applyBBCode(data.text || '', 'b') })}
              style={{ padding: '1px 5px', fontSize: '10px', fontWeight: 700, borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', cursor: 'pointer' }}
            >
              B
            </button>
            <button
              type="button"
              onClick={() => update({ text: applyBBCode(data.text || '', 'i') })}
              style={{ padding: '1px 5px', fontSize: '10px', fontStyle: 'italic', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', cursor: 'pointer' }}
            >
              I
            </button>
            <button
              type="button"
              onClick={() => update({ text: applyBBCode(data.text || '', 'color', '#3b82f6') })}
              style={{ padding: '1px 5px', fontSize: '10px', borderRadius: '4px', border: '1px solid var(--border)', background: 'rgba(59,130,246,0.2)', color: '#93c5fd', cursor: 'pointer' }}
            >
              Color
            </button>
          </div>
        </div>

        {/* Text Field */}
        <div className="node-field">
          <textarea
            className="node-input node-textarea"
            placeholder="Enter dialogue text…"
            value={data.text || ''}
            onChange={e => update({ text: e.target.value })}
            rows={3}
          />
        </div>

        {/* Live BBCode Canvas Preview */}
        {data.text && (
          <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', padding: '6px', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: 1.4 }}>
            <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginBottom: '2px', textTransform: 'uppercase' }}>Canvas Preview:</div>
            {parseBBCodeToReact(data.text)}
          </div>
        )}

        {/* Sound Blocks */}
        {(data.soundBlocks || []).map((sb) => (
          <div key={sb.id} className="sound-block">
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '5px' }}>
              <Volume2 size={10} style={{ color: 'var(--accent-amber)', flexShrink: 0 }} />
              <input
                className="node-input"
                style={{ flex: 1, fontSize: '11px', padding: '3px 6px' }}
                placeholder={resolveSoundCode(data.actorName, id, '')}
                value={sb.soundCode}
                onChange={e => dispatch({ type: 'UPDATE_SOUND_BLOCK', payload: { nodeId: id, blockId: sb.id, patch: { soundCode: e.target.value } } })}
              />
              <button
                onClick={() => dispatch({ type: 'DELETE_SOUND_BLOCK', payload: { nodeId: id, blockId: sb.id } })}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-red)', padding: '2px', flexShrink: 0 }}
              >
                <Trash2 size={11} />
              </button>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <select
                className="node-input node-select"
                style={{ fontSize: '10px', padding: '3px 20px 3px 5px', flex: 2 }}
                value={sb.executionRule}
                onChange={e => dispatch({ type: 'UPDATE_SOUND_BLOCK', payload: { nodeId: id, blockId: sb.id, patch: { executionRule: e.target.value } } })}
              >
                {EXECUTION_RULES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <select
                className="node-input node-select"
                style={{ fontSize: '10px', padding: '3px 20px 3px 5px', flex: 2 }}
                value={sb.trigger}
                onChange={e => dispatch({ type: 'UPDATE_SOUND_BLOCK', payload: { nodeId: id, blockId: sb.id, patch: { trigger: e.target.value } } })}
              >
                {TRIGGERS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        ))}

        <button
          onClick={() => dispatch({ type: 'ADD_SOUND_BLOCK', payload: { nodeId: id } })}
          style={{
            display: 'flex', alignItems: 'center', gap: '5px', width: '100%',
            padding: '5px 8px', background: 'rgba(245,158,11,0.1)',
            border: '1px dashed rgba(245,158,11,0.3)', borderRadius: '6px',
            color: '#fbbf24', fontSize: '11px', cursor: 'pointer', justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,158,11,0.2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(245,158,11,0.1)'}
        >
          <Plus size={11} /> Add Sound
        </button>
      </div>

      <Handle type="source" position={Position.Right} id="next"
        style={{ top: '50%', background: '#7c3aed', borderColor: '#5b21b6' }} />
    </div>
  );
}

export default memo(DialogueNode);