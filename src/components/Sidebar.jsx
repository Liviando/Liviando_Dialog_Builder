import { useCallback, useRef, useMemo, useState, useEffect } from 'react';
import { MessageSquare, GitBranch, Tag, Trash2, Copy, MapPin, FolderOpen, FolderCheck } from 'lucide-react';
import { useStore } from '../store/store';

const NODE_TYPES = [
  {
    type: 'dialogueNode',
    label: 'Dialogue',
    icon: MessageSquare,
    color: '#3b82f6',
    desc: 'Actor speech with integrated tags',
  },
  {
    type: 'choiceNode',
    label: 'Choice',
    icon: GitBranch,
    color: '#8b5cf6',
    desc: 'Branching options with actor & tags',
  },
];

export default function Sidebar({ reactFlowWrapper, reactFlowInstance, exportDirHandle, onPickFolder }) {
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

  // Aggregate all tags across nodes for the Tag Location Tracker
  const tagList = useMemo(() => {
    const list = [];
    for (const node of state.nodes) {
      const d = node.data;

      if (d.grantTag) list.push({ tag: d.grantTag, type: 'GRANT', nodeId: node.id });
      if (d.revokeTag) list.push({ tag: d.revokeTag, type: 'REVOKE', nodeId: node.id });

      if (node.type === 'choiceNode' && d.options) {
        d.options.forEach((opt, idx) => {
          if (opt.requiredTag) list.push({ tag: opt.requiredTag, type: 'REQ', nodeId: node.id, detail: `Opt ${idx + 1}` });
          if (opt.grantTag) list.push({ tag: opt.grantTag, type: 'GRANT', nodeId: node.id, detail: `Opt ${idx + 1}` });
          if (opt.revokeTag) list.push({ tag: opt.revokeTag, type: 'REVOKE', nodeId: node.id, detail: `Opt ${idx + 1}` });
        });
      }

      if (node.type === 'tagNode' && d.tagKey) {
        list.push({ tag: d.tagKey, type: d.operation, nodeId: node.id });
      }
    }
    return list;
  }, [state.nodes]);

  // Camera focus animation
  const focusNode = useCallback((nodeId) => {
    dispatch({ type: 'SELECT_NODE', payload: nodeId });
    if (reactFlowInstance) {
      const node = state.nodes.find(n => n.id === nodeId);
      if (node) {
        reactFlowInstance.fitView({
          nodes: [{ id: nodeId }],
          duration: 800,
          maxZoom: 1.2,
        });
      }
    }
  }, [dispatch, reactFlowInstance, state.nodes]);

  const folderName = exportDirHandle?.name || null;

  // Local editable text for the path field; syncs when picker grants a real folder
  const [pathText, setPathText] = useState(folderName || '');
  useEffect(() => {
    if (exportDirHandle?.name) setPathText(exportDirHandle.name);
  }, [exportDirHandle]);

  return (
    <div className="sidebar" onDrop={onDrop} onDragOver={onDragOver}>

      {/* Export Folder */}
      <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          {exportDirHandle
            ? <FolderCheck size={12} style={{ color: 'var(--accent-green)' }} />
            : <FolderOpen size={12} style={{ color: 'var(--text-muted)' }} />}
          Export Folder
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <input
            type="text"
            className="inspector-input"
            style={{
              flex: 1, fontSize: '11px', fontFamily: 'JetBrains Mono',
              color: folderName ? 'var(--accent-green)' : 'var(--text-primary)',
            }}
            value={pathText}
            onChange={e => setPathText(e.target.value)}
            placeholder="No folder selected — paste a path or use Choose"
            spellCheck={false}
          />
          <button
            className="btn btn-ghost"
            onClick={onPickFolder}
            style={{ flexShrink: 0, fontSize: '11px', padding: '5px 10px' }}
            title="Choose export destination folder"
          >
            {exportDirHandle ? 'Change' : 'Choose'}
          </button>
        </div>
        {exportDirHandle && (
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '5px' }}>
            All exports will be saved to this folder.
          </div>
        )}
      </div>

      {/* Node Spawner */}
      <div style={{ padding: '14px 14px 8px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
          Node Spawner
        </div>

        {/* Spawn Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {NODE_TYPES.map(({ type, label, icon: Icon, color, desc }) => (
            <div
              key={type}
              className="spawner-card"
              draggable
              onDragStart={e => onDragStart(e, type)}
              onClick={() => spawnNode(type, {
                x: 200 + Math.random() * 150,
                y: 100 + Math.random() * 150,
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

      {/* Tag Location Tracker */}
      <div style={{ padding: '12px 14px', flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Tag size={12} style={{ color: 'var(--accent-green)' }} /> Tag Location Index ({tagList.length})
        </div>

        {tagList.length === 0 && (
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', padding: '6px 0' }}>
            No active tags defined on any nodes.
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {tagList.map((item, idx) => (
            <div
              key={idx}
              onClick={() => focusNode(item.nodeId)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '6px 8px', background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s',
              }}
              className="spawner-card-hover"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                <span className="mono" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                  {item.tag}
                </span>
                {item.detail && <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>({item.detail})</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{
                  fontSize: '9px', fontWeight: 700, borderRadius: '4px', padding: '1px 4px',
                  background: item.type === 'GRANT' ? 'rgba(16,185,129,0.2)' : item.type === 'REVOKE' ? 'rgba(239,68,68,0.2)' : 'rgba(124,58,237,0.2)',
                  color: item.type === 'GRANT' ? '#34d399' : item.type === 'REVOKE' ? '#f87171' : '#c4b5fd',
                }}>
                  {item.type}
                </span>
                <span className="mono" style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <MapPin size={9} /> #{item.nodeId}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}