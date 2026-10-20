import { useCallback } from 'react';
import { MessageSquare, GitBranch, Tag, Volume2, Plus, Trash2, Info } from 'lucide-react';
import { useStore } from '../store/store';
import {
  resolveActorImage, resolveExpressionImage, resolveSoundCode,
  applyBBCode, parseBBCodeToReact,
} from '../utils/dialogue';

const EXECUTION_RULES = ['ONCE', 'REPEAT_UNTIL_N_TIMES', 'UNTIL_NODE_ENDS'];
const TRIGGERS = ['ON_NODE_START'];

const TYPE_META = {
  dialogueNode: { label: 'Dialogue Node', icon: MessageSquare, color: '#3b82f6' },
  choiceNode:   { label: 'Choice Node',   icon: GitBranch,    color: '#8b5cf6' },
  tagNode:      { label: 'Tag Node (Legacy)', icon: Tag,       color: '#10b981' },
};

// ── Dialogue Inspector ────────────────────────────────────────────────────────
function DialogueInspector({ node }) {
  const { state, dispatch } = useStore();
  const { actors } = state;
  const { id, data } = node;

  const actor = actors.find(a => a.name === data.actorName) || null;
  const expressions = actor?.expressions || [];

  const update = (patch) => dispatch({ type: 'UPDATE_NODE_DATA', payload: { id, patch } });
  const addSound = () => dispatch({ type: 'ADD_SOUND_BLOCK', payload: { nodeId: id } });
  const updateSound = (blockId, patch) => dispatch({ type: 'UPDATE_SOUND_BLOCK', payload: { nodeId: id, blockId, patch } });
  const deleteSound = (blockId) => dispatch({ type: 'DELETE_SOUND_BLOCK', payload: { nodeId: id, blockId } });

  return (
    <>
      <div className="inspector-section">Actor & Expression</div>

      <div className="inspector-field">
        <label className="inspector-label">Actor</label>
        <select
          className="inspector-input inspector-select"
          value={data.actorName || ''}
          onChange={e => update({ actorName: e.target.value, expressionName: '' })}
        >
          <option value="">— None —</option>
          {actors.map(a => <option key={a.name} value={a.name}>{a.name}</option>)}
        </select>
      </div>

      {actor && (
        <>
          <div className="inspector-field">
            <label className="inspector-label">Expression</label>
            <select
              className="inspector-input inspector-select"
              value={data.expressionName || ''}
              onChange={e => update({ expressionName: e.target.value })}
            >
              <option value="">— Default —</option>
              {expressions.map(ex => <option key={ex.name} value={ex.name}>{ex.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
            <span className="tag-chip" style={{ background: 'rgba(59,130,246,0.12)', borderColor: 'rgba(59,130,246,0.25)', color: '#93c5fd', fontFamily: 'JetBrains Mono', fontSize: '11px' }}>
              {resolveActorImage(actor)}
            </span>
            {data.expressionName && (
              <span className="tag-chip" style={{ background: 'rgba(236,72,153,0.12)', borderColor: 'rgba(236,72,153,0.25)', color: '#f9a8d4', fontFamily: 'JetBrains Mono', fontSize: '11px' }}>
                {resolveExpressionImage(actor, data.expressionName)}
              </span>
            )}
          </div>
        </>
      )}

      <div className="inspector-section">Integrated Tags</div>
      <div className="inspector-field">
        <label className="inspector-label" style={{ color: '#34d399' }}>+ Grant Tag (Optional)</label>
        <input
          className="inspector-input"
          style={{ fontFamily: 'JetBrains Mono' }}
          placeholder="e.g. met_npc"
          value={data.grantTag || ''}
          onChange={e => update({ grantTag: e.target.value })}
        />
      </div>
      <div className="inspector-field">
        <label className="inspector-label" style={{ color: '#f87171' }}>- Revoke Tag (Optional)</label>
        <input
          className="inspector-input"
          style={{ fontFamily: 'JetBrains Mono' }}
          placeholder="e.g. intro_active"
          value={data.revokeTag || ''}
          onChange={e => update({ revokeTag: e.target.value })}
        />
      </div>

      <div className="inspector-section">
        Dialogue Text
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
          <button type="button" onClick={() => update({ text: applyBBCode(data.text || '', 'b') })} style={{ padding: '2px 6px', fontSize: '11px', fontWeight: 700, borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', cursor: 'pointer' }}>B</button>
          <button type="button" onClick={() => update({ text: applyBBCode(data.text || '', 'i') })} style={{ padding: '2px 6px', fontSize: '11px', fontStyle: 'italic', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', cursor: 'pointer' }}>I</button>
          <button type="button" onClick={() => update({ text: applyBBCode(data.text || '', 'color', '#3b82f6') })} style={{ padding: '2px 6px', fontSize: '11px', borderRadius: '4px', border: '1px solid var(--border)', background: 'rgba(59,130,246,0.2)', color: '#93c5fd', cursor: 'pointer' }}>Color</button>
        </div>
      </div>
      <div className="inspector-field">
        <textarea
          className="inspector-input inspector-textarea"
          placeholder="Type the dialogue text…"
          value={data.text || ''}
          onChange={e => update({ text: e.target.value })}
          rows={4}
        />
      </div>

      {data.text && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px', marginBottom: '12px', fontSize: '12px', lineHeight: 1.5 }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Formatted Preview:</div>
          {parseBBCodeToReact(data.text)}
        </div>
      )}

      <div className="inspector-section">
        <Volume2 size={12} style={{ color: 'var(--accent-amber)' }} />
        Sound Blocks
        <button onClick={addSound} style={{ marginLeft: 'auto', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '5px', color: '#fbbf24', padding: '2px 8px', fontSize: '10px', cursor: 'pointer' }}>
          <Plus size={10} /> Add
        </button>
      </div>

      {(data.soundBlocks || []).map((sb, idx) => (
        <div key={sb.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent-amber)' }}>Block #{idx + 1}</span>
            <button onClick={() => deleteSound(sb.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-red)', padding: '2px' }}>
              <Trash2 size={13} />
            </button>
          </div>
          <div className="inspector-field">
            <label className="inspector-label">Sound Code</label>
            <input
              className="inspector-input"
              style={{ fontFamily: 'JetBrains Mono', fontSize: '12px' }}
              placeholder={resolveSoundCode(data.actorName, id, '')}
              value={sb.soundCode}
              onChange={e => updateSound(sb.id, { soundCode: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <div className="inspector-field" style={{ flex: 1 }}>
              <label className="inspector-label">Rule</label>
              <select className="inspector-input inspector-select" style={{ fontSize: '11px' }} value={sb.executionRule} onChange={e => updateSound(sb.id, { executionRule: e.target.value })}>
                {EXECUTION_RULES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="inspector-field" style={{ flex: 1 }}>
              <label className="inspector-label">Trigger</label>
              <select className="inspector-input inspector-select" style={{ fontSize: '11px' }} value={sb.trigger} onChange={e => updateSound(sb.id, { trigger: e.target.value })}>
                {TRIGGERS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

// ── Choice Inspector ──────────────────────────────────────────────────────────
function ChoiceInspector({ node }) {
  const { state, dispatch } = useStore();
  const { actors } = state;
  const { id, data } = node;

  const actor = actors.find(a => a.name === data.actorName) || null;
  const expressions = actor?.expressions || [];

  const update = (patch) => dispatch({ type: 'UPDATE_NODE_DATA', payload: { id, patch } });
  const addOption = () => dispatch({ type: 'ADD_CHOICE_OPTION', payload: { nodeId: id } });
  const updateOption = (optId, patch) => dispatch({ type: 'UPDATE_CHOICE_OPTION', payload: { nodeId: id, optId, patch } });
  const deleteOption = (optId) => dispatch({ type: 'DELETE_CHOICE_OPTION', payload: { nodeId: id, optId } });

  return (
    <>
      <div className="inspector-section">Actor & Expression</div>
      <div className="inspector-field">
        <label className="inspector-label">Actor</label>
        <select
          className="inspector-input inspector-select"
          value={data.actorName || ''}
          onChange={e => update({ actorName: e.target.value, expressionName: '' })}
        >
          <option value="">— None —</option>
          {actors.map(a => <option key={a.name} value={a.name}>{a.name}</option>)}
        </select>
      </div>

      {actor && (
        <div className="inspector-field">
          <label className="inspector-label">Expression</label>
          <select
            className="inspector-input inspector-select"
            value={data.expressionName || ''}
            onChange={e => update({ expressionName: e.target.value })}
          >
            <option value="">— Default —</option>
            {expressions.map(ex => <option key={ex.name} value={ex.name}>{ex.name}</option>)}
          </select>
        </div>
      )}

      <div className="inspector-section">Node Tags</div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <div className="inspector-field" style={{ flex: 1, marginBottom: 0 }}>
          <label className="inspector-label" style={{ color: '#34d399' }}>+ Grant Tag</label>
          <input className="inspector-input" style={{ fontFamily: 'JetBrains Mono' }} placeholder="grant_tag" value={data.grantTag || ''} onChange={e => update({ grantTag: e.target.value })} />
        </div>
        <div className="inspector-field" style={{ flex: 1, marginBottom: 0 }}>
          <label className="inspector-label" style={{ color: '#f87171' }}>- Revoke Tag</label>
          <input className="inspector-input" style={{ fontFamily: 'JetBrains Mono' }} placeholder="revoke_tag" value={data.revokeTag || ''} onChange={e => update({ revokeTag: e.target.value })} />
        </div>
      </div>

      <div className="inspector-section">Prompt Text</div>
      <div className="inspector-field">
        <textarea
          className="inspector-input inspector-textarea"
          placeholder="e.g. Will you be eating tonight?"
          value={data.prompt || ''}
          onChange={e => update({ prompt: e.target.value })}
          rows={3}
        />
      </div>

      <div className="inspector-section">
        Options
        <button onClick={addOption} style={{ marginLeft: 'auto', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '5px', color: '#a78bfa', padding: '2px 8px', fontSize: '10px', cursor: 'pointer' }}>
          <Plus size={10} /> Add
        </button>
      </div>

      {(data.options || []).map((opt, idx) => (
        <div key={opt.optId} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <span style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa', borderRadius: '5px', padding: '1px 7px', fontSize: '11px', fontWeight: 700 }}>{idx + 1}</span>
            {(data.options || []).length > 1 && (
              <button onClick={() => deleteOption(opt.optId)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-red)', padding: '2px', marginLeft: 'auto' }}>
                <Trash2 size={13} />
              </button>
            )}
          </div>
          <div className="inspector-field">
            <label className="inspector-label">Option Text</label>
            <input className="inspector-input" placeholder={`Option ${idx + 1}…`} value={opt.text}
              onChange={e => updateOption(opt.optId, { text: e.target.value })} />
          </div>
          <div className="inspector-field">
            <label className="inspector-label">Required Tag</label>
            <input className="inspector-input" style={{ fontFamily: 'JetBrains Mono', fontSize: '12px' }}
              placeholder="e.g. has_key" value={opt.requiredTag || ''}
              onChange={e => updateOption(opt.optId, { requiredTag: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <div className="inspector-field" style={{ flex: 1, marginBottom: 0 }}>
              <label className="inspector-label" style={{ color: '#34d399' }}>+ Grant</label>
              <input className="inspector-input" style={{ fontFamily: 'JetBrains Mono', fontSize: '11px' }}
                placeholder="grant_tag" value={opt.grantTag || ''}
                onChange={e => updateOption(opt.optId, { grantTag: e.target.value })} />
            </div>
            <div className="inspector-field" style={{ flex: 1, marginBottom: 0 }}>
              <label className="inspector-label" style={{ color: '#f87171' }}>- Revoke</label>
              <input className="inspector-input" style={{ fontFamily: 'JetBrains Mono', fontSize: '11px' }}
                placeholder="revoke_tag" value={opt.revokeTag || ''}
                onChange={e => updateOption(opt.optId, { revokeTag: e.target.value })} />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

// ── Legacy Tag Inspector ──────────────────────────────────────────────────────
function TagInspector({ node }) {
  const { dispatch } = useStore();
  const { id, data } = node;
  const update = (patch) => dispatch({ type: 'UPDATE_NODE_DATA', payload: { id, patch } });

  return (
    <>
      <div className="inspector-section">Tag Operation</div>
      <div className="inspector-field">
        <div className="tag-toggle" style={{ height: '36px' }}>
          <button className={`tag-toggle-btn grant ${data.operation === 'GRANT' ? 'active' : ''}`} onClick={() => update({ operation: 'GRANT' })}>✓ GRANT</button>
          <button className={`tag-toggle-btn revoke ${data.operation === 'REVOKE' ? 'active' : ''}`} onClick={() => update({ operation: 'REVOKE' })}>✗ REVOKE</button>
        </div>
      </div>
      <div className="inspector-field">
        <label className="inspector-label">Tag Key</label>
        <input className="inspector-input" style={{ fontFamily: 'JetBrains Mono' }}
          placeholder="e.g. has_key, met_npc" value={data.tagKey || ''}
          onChange={e => update({ tagKey: e.target.value })} />
      </div>
    </>
  );
}

// ── Main Inspector ────────────────────────────────────────────────────────────
export default function Inspector() {
  const { state, dispatch } = useStore();
  const selectedNode = state.nodes.find(n => n.id === state.selectedNodeId);

  if (!selectedNode) {
    return (
      <div className="inspector">
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Inspector</div>
        </div>
        <div className="empty-state">
          <Info size={32} className="empty-state-icon" />
          <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>No node selected</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', maxWidth: '180px', lineHeight: 1.5 }}>
            Click a node on the canvas to edit its properties.
          </div>
        </div>
      </div>
    );
  }

  const meta = TYPE_META[selectedNode.type] || { label: selectedNode.type, icon: Info, color: '#fff' };
  const Icon = meta.icon;

  return (
    <div className="inspector">
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '26px', height: '26px', borderRadius: '7px', background: `${meta.color}22`, border: `1px solid ${meta.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={13} style={{ color: meta.color }} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{meta.label}</div>
            <div style={{ fontSize: '10px', fontFamily: 'JetBrains Mono', color: 'var(--text-muted)' }}>Node #{selectedNode.id}</div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>
        {selectedNode.type === 'dialogueNode' && <DialogueInspector node={selectedNode} />}
        {selectedNode.type === 'choiceNode'   && <ChoiceInspector   node={selectedNode} />}
        {selectedNode.type === 'tagNode'      && <TagInspector      node={selectedNode} />}
      </div>

      <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '6px' }}>
        <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}
          onClick={() => dispatch({ type: 'DUPLICATE_NODE', payload: selectedNode.id })}>
          Duplicate
        </button>
        <button className="btn btn-danger" style={{ flex: 1, justifyContent: 'center' }}
          onClick={() => dispatch({ type: 'DELETE_NODE', payload: selectedNode.id })}>
          Delete
        </button>
      </div>
    </div>
  );
}