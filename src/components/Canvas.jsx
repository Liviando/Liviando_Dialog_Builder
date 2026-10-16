import { useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useStore } from '../store/store';
import DialogueNode from './nodes/DialogueNode';
import ChoiceNode from './nodes/ChoiceNode';
import TagNode from './nodes/TagNode';

const nodeTypes = {
  dialogueNode: DialogueNode,
  choiceNode: ChoiceNode,
  tagNode: TagNode,
};

const defaultEdgeOptions = {
  type: 'smoothstep',
  animated: false,
  style: { stroke: '#4a5568', strokeWidth: 2 },
};

export default function Canvas({ onInit }) {
  const { state, dispatch } = useStore();

  const onNodesChange = useCallback(
    (changes) => dispatch({ type: 'ON_NODES_CHANGE', payload: changes }),
    [dispatch]
  );

  const onEdgesChange = useCallback(
    (changes) => dispatch({ type: 'ON_EDGES_CHANGE', payload: changes }),
    [dispatch]
  );

  const onConnect = useCallback(
    (connection) => dispatch({ type: 'ON_CONNECT', payload: connection }),
    [dispatch]
  );

  const onNodeClick = useCallback(
    (_, node) => dispatch({ type: 'SELECT_NODE', payload: node.id }),
    [dispatch]
  );

  const onPaneClick = useCallback(
    () => dispatch({ type: 'SELECT_NODE', payload: null }),
    [dispatch]
  );

  return (
    <ReactFlow
      nodes={state.nodes}
      edges={state.edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeClick={onNodeClick}
      onPaneClick={onPaneClick}
      onInit={onInit}
      nodeTypes={nodeTypes}
      defaultEdgeOptions={defaultEdgeOptions}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      minZoom={0.2}
      maxZoom={2.5}
      deleteKeyCode={['Delete', 'Backspace']}
      multiSelectionKeyCode="Shift"
      snapToGrid
      snapGrid={[12, 12]}
      style={{ width: '100%', height: '100%' }}
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={20}
        size={1}
        color="#1f2335"
      />
      <Controls
        position="bottom-left"
        style={{ bottom: '16px', left: '16px' }}
      />
      <MiniMap
        position="bottom-right"
        style={{ bottom: '16px', right: '16px' }}
        nodeColor={(n) => {
          if (n.type === 'dialogueNode') return '#1e3a5f';
          if (n.type === 'choiceNode') return '#2d1b4e';
          if (n.type === 'tagNode') return '#1a3a2a';
          return '#1a1d27';
        }}
        maskColor="rgba(0,0,0,0.5)"
      />

      {/* Empty Canvas Hint */}
      {state.nodes.length === 0 && (
        <Panel position="top-center" style={{ marginTop: '80px' }}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: '12px', padding: '20px 28px', textAlign: 'center',
            color: 'var(--text-muted)',
          }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🎭</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Canvas is empty
            </div>
            <div style={{ fontSize: '12px', lineHeight: 1.6 }}>
              Drag a node from the left sidebar, or click a node type to add it.<br />
              Connect handles to build your dialogue flow.
            </div>
          </div>
        </Panel>
      )}
    </ReactFlow>
  );
}
