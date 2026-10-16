import { useState } from 'react';
import { X, Users, Plus, Trash2, ChevronDown, ChevronRight, UserCircle } from 'lucide-react';
import { useStore } from '../store/store';
import { resolveActorImage, resolveExpressionImage } from '../utils/dialogue';

function ExpressionRow({ actor, expr }) {
  const { dispatch } = useStore();
  const [localName, setLocalName] = useState(expr.name);

  const commitName = () => {
    if (localName.trim() && localName !== expr.name) {
      dispatch({ type: 'UPDATE_EXPRESSION', payload: { actorName: actor.name, oldExprName: expr.name, patch: { name: localName.trim() } } });
    }
  };

  return (
    <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', marginBottom: '6px' }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', gap: '5px', marginBottom: '4px' }}>
          <input
            className="inspector-input"
            style={{ flex: 1, fontSize: '12px', fontFamily: 'JetBrains Mono' }}
            placeholder="name (e.g. mad)"
            value={localName}
            onChange={e => setLocalName(e.target.value)}
            onBlur={commitName}
          />
          <input
            className="inspector-input"
            style={{ flex: 2, fontSize: '12px', fontFamily: 'JetBrains Mono' }}
            placeholder={resolveExpressionImage(actor, expr.name)}
            value={expr.imageCode}
            onChange={e => dispatch({ type: 'UPDATE_EXPRESSION', payload: { actorName: actor.name, oldExprName: expr.name, patch: { imageCode: e.target.value } } })}
          />
        </div>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', paddingLeft: '2px' }}>
          → <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--accent-cyan)' }}>{resolveExpressionImage(actor, expr.name)}</span>
        </div>
      </div>
      <button
        onClick={() => dispatch({ type: 'DELETE_EXPRESSION', payload: { actorName: actor.name, exprName: expr.name } })}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-red)', padding: '6px 4px', flexShrink: 0 }}
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

function ActorCard({ actor }) {
  const { dispatch } = useStore();
  const [expanded, setExpanded] = useState(false);
  const [localName, setLocalName] = useState(actor.name);

  const commitName = () => {
    if (localName.trim() && localName !== actor.name) {
      dispatch({ type: 'UPDATE_ACTOR', payload: { oldName: actor.name, patch: { name: localName.trim() } } });
    }
  };

  const update = (patch) => dispatch({ type: 'UPDATE_ACTOR', payload: { oldName: actor.name, patch } });

  return (
    <div className="actor-item">
      <div className="actor-item-header" onClick={() => setExpanded(v => !v)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-blue) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: 700, color: 'white',
          }}>
            {actor.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{actor.name}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
              {actor.expressions.length} expression{actor.expressions.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={e => { e.stopPropagation(); dispatch({ type: 'DELETE_ACTOR', payload: actor.name }); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-red)', padding: '4px' }}
          >
            <Trash2 size={14} />
          </button>
          {expanded
            ? <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
            : <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />}
        </div>
      </div>

      {expanded && (
        <div className="actor-item-body">
          {/* Name */}
          <div style={{ marginBottom: '10px' }}>
            <label className="inspector-label">Actor Name</label>
            <input
              className="inspector-input"
              value={localName}
              onChange={e => setLocalName(e.target.value)}
              onBlur={commitName}
              placeholder="ActorName"
            />
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '3px' }}>
              Renaming here also updates all nodes that reference this actor.
            </div>
          </div>

          {/* Image + Sound */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
            <div style={{ flex: 1 }}>
              <label className="inspector-label">Image Code</label>
              <input
                className="inspector-input"
                style={{ fontFamily: 'JetBrains Mono', fontSize: '12px' }}
                placeholder={resolveActorImage(actor)}
                value={actor.imageCode}
                onChange={e => update({ imageCode: e.target.value })}
              />
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '3px' }}>
                → <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--accent-blue)' }}>{resolveActorImage(actor)}</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <label className="inspector-label">Base Sound Code</label>
              <input
                className="inspector-input"
                style={{ fontFamily: 'JetBrains Mono', fontSize: '12px' }}
                placeholder={`${actor.name}_sound_default`}
                value={actor.baseSoundCode}
                onChange={e => update({ baseSoundCode: e.target.value })}
              />
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '3px' }}>
                → <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--accent-amber)' }}>
                  {actor.baseSoundCode?.trim() || `${actor.name}_sound_default`}
                </span>
              </div>
            </div>
          </div>

          {/* Expressions */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Expressions
              </span>
              <button
                onClick={() => dispatch({ type: 'ADD_EXPRESSION', payload: { actorName: actor.name } })}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '5px', color: '#34d399', padding: '2px 8px', fontSize: '10px', cursor: 'pointer' }}
              >
                <Plus size={10} /> Add
              </button>
            </div>

            {actor.expressions.length === 0 && (
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '8px 0', textAlign: 'center' }}>
                No expressions — actor uses default image.
              </div>
            )}

            {actor.expressions.length > 0 && (
              <>
                <div style={{ display: 'flex', gap: '5px', marginBottom: '5px', padding: '0 2px' }}>
                  <span style={{ flex: 1, fontSize: '9px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Name</span>
                  <span style={{ flex: 2, fontSize: '9px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Image Code (optional override)</span>
                  <span style={{ width: '28px' }} />
                </div>
                {actor.expressions.map(expr => (
                  <ExpressionRow key={expr.name} actor={actor} expr={expr} />
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ActorManager({ onClose }) {
  const { state, dispatch } = useStore();
  const [newActorName, setNewActorName] = useState('');

  const addActor = () => {
    const name = newActorName.trim() || 'NewActor';
    if (state.actors.find(a => a.name === name)) {
      alert(`An actor named "${name}" already exists.`);
      return;
    }
    dispatch({ type: 'ADD_ACTOR', payload: name });
    setNewActorName('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={15} color="white" />
            </div>
            Actor Manager
            <span className="badge badge-purple">{state.actors.length} Actors</span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px', borderRadius: '6px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Add Actor row */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <input
              className="inspector-input"
              placeholder="New actor name…"
              value={newActorName}
              onChange={e => setNewActorName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addActor()}
              style={{ flex: 1 }}
            />
            <button className="btn btn-primary" onClick={addActor}>
              <Plus size={14} /> Add Actor
            </button>
          </div>

          {state.actors.length === 0 && (
            <div className="empty-state">
              <UserCircle size={48} className="empty-state-icon" />
              <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>No actors yet</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '300px', lineHeight: 1.6 }}>
                Add actors to use them in Dialogue nodes. Each actor has a name, image code, base sound, and optional expressions.
              </div>
            </div>
          )}

          <div className="actor-list">
            {state.actors.map(actor => (
              <ActorCard key={actor.name} actor={actor} />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginRight: 'auto' }}>
            Fallbacks: <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--text-secondary)' }}>ActorName_main</span> · <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--text-secondary)' }}>ActorName_expressionName</span>
          </div>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
