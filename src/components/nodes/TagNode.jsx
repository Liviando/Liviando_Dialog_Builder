import { memo, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Tag } from 'lucide-react';
import { useStore } from '../../store/store';

function TagNode({ id, data, selected }) {
  const { dispatch } = useStore();
  const update = useCallback((patch) => {
    dispatch({ type: 'UPDATE_NODE_DATA', payload: { id, patch } });
  }, [dispatch, id]);
  const stopPropagation = useCallback((e) => e.stopPropagation(), []);

  return (
    <div className={`node-tag ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Left} id="input"
        style={{ top: '50%', background: '#10b981', borderColor: '#065f46' }} />

      <div className="node-header node-header-tag">
        <Tag size={12} />
        <span>Tag</span>
        <span style={{ marginLeft: 'auto', fontFamily: 'JetBrains Mono', fontSize: '10px', opacity: 0.6 }}>
          #{id}
        </span>
      </div>

      <div className="node-body" onMouseDown={stopPropagation}>
        <div className="node-field">
          <label>Operation</label>
          <div className="tag-toggle">
            <button className={`tag-toggle-btn grant ${data.operation === 'GRANT' ? 'active' : ''}`}
              onClick={() => update({ operation: 'GRANT' })}>✓ GRANT</button>
            <button className={`tag-toggle-btn revoke ${data.operation === 'REVOKE' ? 'active' : ''}`}
              onClick={() => update({ operation: 'REVOKE' })}>✗ REVOKE</button>
          </div>
        </div>
        <div className="node-field">
          <label>Tag Key</label>
          <input
            className="node-input"
            style={{ fontFamily: 'JetBrains Mono', fontSize: '12px' }}
            placeholder="e.g. has_key, met_npc…"
            value={data.tagKey || ''}
            onChange={e => update({ tagKey: e.target.value })}
          />
        </div>
        {data.tagKey && (
          <span className="tag-chip" style={{
            background: data.operation === 'GRANT' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
            borderColor: data.operation === 'GRANT' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)',
            color: data.operation === 'GRANT' ? '#6ee7b7' : '#fca5a5',
          }}>
            {data.operation === 'GRANT' ? '+' : '-'} {data.tagKey}
          </span>
        )}
      </div>

      <Handle type="source" position={Position.Right} id="next"
        style={{ top: '50%', background: '#10b981', borderColor: '#065f46' }} />
    </div>
  );
}

export default memo(TagNode);
