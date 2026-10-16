import { useCallback, useRef } from 'react';
import { MessageSquare, GitBranch, Tag, Trash2, Copy, LayoutGrid } from 'lucide-react';
import { useStore } from '../store/store';

const NODE_TYPES = [
  {
    type: 'dialogueNode',
    label: 'Dialogue',
    icon: MessageSquare,
    color: '#3b82f6',
    desc: 'Actor speech with audio',
  },
  {
    type: 'choiceNode',
    label: 'Choice',
    icon: GitBranch,
    color: '#8b5cf6',
    desc: 'Branching options',
  },
  {
    type: 'tagNode',
    label: 'Tag',
    icon: Tag,
    color: '#10b981',
    desc: 'Grant or revoke tag',
  },
];

export default function Sidebar({ reactFlowWrapper, reactFlowInstance }) {
  const { state, dispatch, spawnNode } = useStore();
  const dragType = useRef(null);

  const onDragStart = useCallback((e, type) => {
    dragType.current = type;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/dialoguenode', type);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/dialoguenode');
    if (!type || !reactFlowInstance || !reactFlowWrapper.current) return;

    const bounds = reactFlowWrapper.current.getBoundingClientRect();
    const position = reactFlowInstance.screenToFlowPosition({
      x: e.clientX - bounds.left,
      y: e.clientY - bounds.top,
    });
    spawnNode(type, position);
  }, [reactFlowInstance, reactFlowWrapper, spawnNode]);

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const selectedNode = state.nodes.find(n => n.id === state.selectedNodeId);

  const deleteSelected = useCallback(() => {
    if (state.selectedNodeId) {
      dispatch({ type: 'DELETE_NODE', payload: state.selectedNodeId });
    }
  }, [dispatch, state.selectedNodeId]);

  const duplicateSelected = useCallback(() => {
    if (state.selectedNodeId) {
      dispatch({ type: 'DUPLICATE_NODE', payload: state.selectedNodeId });
    }
  }, [dispatch, state.selectedNodeId]);

  return (
    <div
      className="sidebar"
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      {/* Header */}
      <div style={{ padding: '14px 14px 8px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
          Node Spawner
        </div>

        {/* Spawn cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {NODE_TYPES.map(({ type, label, icon: Icon, color, desc }) => (
            <div
              key={type}
              className="spawner-card"
              draggable
              onDragStart={e => onDragStart(e, type)}
              onClick={() => spawnNode(type, {
                x: 200 + Math.random() * 200,
                y: 100 + Math.random() * 200,
              })}
              style={{ flexDirection: 'row', textAlign: 'left', alignItems: 'center', padding: '10px 12px' }}
            >
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: `${color}22`, border: `1px solid ${color}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Icon size={15} style={{ color }} />
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selection Actions */}
      <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
          Selection
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <button
            className="btn btn-secondary"
            style={{ width: '100%', justifyContent: 'flex-start' }}
            disabled={!selectedNode}
            onClick={duplicateSelected}
          >
            <Copy size={13} /> Duplicate Node
          </button>
          <button
            className="btn btn-danger"
            style={{ width: '100%', justifyContent: 'flex-start' }}
            disabled={!selectedNode}
            onClick={deleteSelected}
          >
            <Trash2 size={13} /> Delete Node
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: '12px 14px' }}>
        <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
          Graph Stats
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {[
            ['Nodes', state.nodes.length, '#3b82f6'],
            ['Edges', state.edges.length, '#8b5cf6'],
            ['Actors', state.actors.length, '#10b981'],
          ].map(([label, val, color]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{label}</span>
              <span style={{
                fontSize: '12px', fontWeight: 700, color,
                background: `${color}22`, borderRadius: '5px', padding: '1px 7px',
              }}>
                {val}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tip */}
      <div style={{ marginTop: 'auto', padding: '12px 14px', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          💡 Drag nodes onto canvas, or click to auto-place. Connect handles to wire the dialogue flow.
        </div>
      </div>
    </div>
  );
}
