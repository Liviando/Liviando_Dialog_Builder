import { createContext, useContext, useReducer, useCallback } from 'react';
import {
  createDialogueNode, createChoiceNode, createTagNode,
  createSoundBlock, createActor, genOptId,
} from '../utils/dialogue';
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';

const initialState = {
  dialogueName: 'my_dialogue',
  nextNodeId: 1,
  nodes: [
    // Default initial entry node named "start"
    createDialogueNode('start', { x: 250, y: 150 })
  ],
  edges: [],
  actors: [],
  selectedNodeId: 'start',
  importedAudioLib: '',
  importedSpriteLib: '',
};

function createNode(nodeType, id, position) {
  if (nodeType === 'dialogueNode') return createDialogueNode(id, position);
  if (nodeType === 'choiceNode')   return createChoiceNode(id, position);
  if (nodeType === 'tagNode')      return createTagNode(id, position);
}

function reducer(state, action) {
  switch (action.type) {

    // ── Workspace ─────────────────────────────────────────────────────────────
    case 'LOAD_WORKSPACE': {
      const p = action.payload;
      return {
        ...initialState,
        dialogueName:      p.dialogueName      || 'my_dialogue',
        nextNodeId:        p.nextNodeId        || 1,
        nodes:             p.nodes             || [],
        edges:             p.edges             || [],
        actors:            p.actors            || [],
        importedAudioLib:  p.importedAudioLib  || '',
        importedSpriteLib: p.importedSpriteLib || '',
        selectedNodeId:    p.nodes?.[0]?.id    || null,
      };
    }
    case 'SET_DIALOGUE_NAME':
      return { ...state, dialogueName: action.payload };
    case 'SET_IMPORTED_AUDIO':
      return { ...state, importedAudioLib: action.payload };
    case 'SET_IMPORTED_SPRITE':
      return { ...state, importedSpriteLib: action.payload };

    // ── React Flow ────────────────────────────────────────────────────────────
    case 'ON_NODES_CHANGE':
      return { ...state, nodes: applyNodeChanges(action.payload, state.nodes) };
    case 'ON_EDGES_CHANGE':
      return { ...state, edges: applyEdgeChanges(action.payload, state.edges) };
    case 'ON_CONNECT':
      return {
        ...state,
        edges: addEdge({ ...action.payload, animated: false, type: 'smoothstep' }, state.edges),
      };

    // ── Nodes ─────────────────────────────────────────────────────────────────
    case 'SPAWN_NODE': {
      // If no start node exists and canvas is empty, use 'start', else sequential numbers
      const hasStart = state.nodes.some(n => n.id === 'start');
      const id = (!hasStart && state.nodes.length === 0) ? 'start' : String(state.nextNodeId);
      
      const node = createNode(action.payload.nodeType, id, action.payload.position);
      return {
        ...state,
        nextNodeId: id === 'start' ? state.nextNodeId : state.nextNodeId + 1,
        nodes: [...state.nodes, node],
        selectedNodeId: id,
      };
    }
    case 'DELETE_NODE': {
      const id = action.payload;
      return {
        ...state,
        nodes: state.nodes.filter(n => n.id !== id),
        edges: state.edges.filter(e => e.source !== id && e.target !== id),
        selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
      };
    }
    case 'DUPLICATE_NODE': {
      const orig = state.nodes.find(n => n.id === action.payload);
      if (!orig) return state;
      const newId = String(state.nextNodeId);
      const newNode = {
        ...orig,
        id: newId,
        position: { x: orig.position.x + 40, y: orig.position.y + 40 },
        data: JSON.parse(JSON.stringify(orig.data)),
        selected: false,
      };
      return { ...state, nextNodeId: state.nextNodeId + 1, nodes: [...state.nodes, newNode] };
    }
    case 'SELECT_NODE':
      return { ...state, selectedNodeId: action.payload };
    case 'UPDATE_NODE_DATA': {
      const { id, patch } = action.payload;
      return {
        ...state,
        nodes: state.nodes.map(n =>
          n.id === id ? { ...n, data: { ...n.data, ...patch } } : n
        ),
      };
    }

    // ── Sound Blocks ──────────────────────────────────────────────────────────
    case 'ADD_SOUND_BLOCK': {
      const { nodeId } = action.payload;
      return {
        ...state,
        nodes: state.nodes.map(n =>
          n.id !== nodeId ? n : {
            ...n, data: { ...n.data, soundBlocks: [...(n.data.soundBlocks || []), createSoundBlock()] },
          }
        ),
      };
    }
    case 'UPDATE_SOUND_BLOCK': {
      const { nodeId, blockId, patch } = action.payload;
      return {
        ...state,
        nodes: state.nodes.map(n =>
          n.id !== nodeId ? n : {
            ...n, data: {
              ...n.data,
              soundBlocks: n.data.soundBlocks.map(sb => sb.id === blockId ? { ...sb, ...patch } : sb),
            },
          }
        ),
      };
    }
    case 'DELETE_SOUND_BLOCK': {
      const { nodeId, blockId } = action.payload;
      return {
        ...state,
        nodes: state.nodes.map(n =>
          n.id !== nodeId ? n : {
            ...n, data: { ...n.data, soundBlocks: n.data.soundBlocks.filter(sb => sb.id !== blockId) },
          }
        ),
      };
    }

    // ── Choice Options ────────────────────────────────────────────────────────
    case 'ADD_CHOICE_OPTION': {
      const { nodeId } = action.payload;
      return {
        ...state,
        nodes: state.nodes.map(n =>
          n.id !== nodeId ? n : {
            ...n, data: {
              ...n.data,
              options: [...(n.data.options || []), { optId: genOptId(), text: '', requiredTag: '', grantTag: '', revokeTag: '' }],
            },
          }
        ),
      };
    }
    case 'UPDATE_CHOICE_OPTION': {
      const { nodeId, optId, patch } = action.payload;
      return {
        ...state,
        nodes: state.nodes.map(n =>
          n.id !== nodeId ? n : {
            ...n, data: {
              ...n.data,
              options: n.data.options.map(o => o.optId === optId ? { ...o, ...patch } : o),
            },
          }
        ),
      };
    }
    case 'DELETE_CHOICE_OPTION': {
      const { nodeId, optId } = action.payload;
      return {
        ...state,
        nodes: state.nodes.map(n =>
          n.id !== nodeId ? n : {
            ...n, data: { ...n.data, options: n.data.options.filter(o => o.optId !== optId) },
          }
        ),
        edges: state.edges.filter(e => !(e.source === nodeId && e.sourceHandle === `option-${optId}`)),
      };
    }

    // ── Actors ────────────────────────────────────────────────────────────────
    case 'ADD_ACTOR':
      return { ...state, actors: [...state.actors, createActor(action.payload || 'Actor')] };
    case 'UPDATE_ACTOR': {
      const { oldName, patch } = action.payload;
      const newName = patch.name || oldName;
      return {
        ...state,
        actors: state.actors.map(a => a.name === oldName ? { ...a, ...patch } : a),
        nodes: newName !== oldName
          ? state.nodes.map(n =>
              n.data.actorName === oldName
                ? { ...n, data: { ...n.data, actorName: newName } }
                : n
            )
          : state.nodes,
      };
    }
    case 'DELETE_ACTOR': {
      const name = action.payload;
      return {
        ...state,
        actors: state.actors.filter(a => a.name !== name),
        nodes: state.nodes.map(n =>
          n.data.actorName === name
            ? { ...n, data: { ...n.data, actorName: '', expressionName: '' } }
            : n
        ),
      };
    }

    // ── Expressions ───────────────────────────────────────────────────────────
    case 'ADD_EXPRESSION': {
      const { actorName } = action.payload;
      return {
        ...state,
        actors: state.actors.map(a =>
          a.name !== actorName ? a : {
            ...a, expressions: [...a.expressions, { name: 'new', imageCode: '' }],
          }
        ),
      };
    }
    case 'UPDATE_EXPRESSION': {
      const { actorName, oldExprName, patch } = action.payload;
      return {
        ...state,
        actors: state.actors.map(a =>
          a.name !== actorName ? a : {
            ...a,
            expressions: a.expressions.map(e => e.name === oldExprName ? { ...e, ...patch } : e),
          }
        ),
      };
    }
    case 'DELETE_EXPRESSION': {
      const { actorName, exprName } = action.payload;
      return {
        ...state,
        actors: state.actors.map(a =>
          a.name !== actorName ? a : {
            ...a, expressions: a.expressions.filter(e => e.name !== exprName),
          }
        ),
      };
    }

    default:
      return state;
  }
}

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const spawnNode = useCallback((nodeType, position) => {
    dispatch({ type: 'SPAWN_NODE', payload: { nodeType, position } });
  }, []);

  return (
    <StoreContext.Provider value={{ state, dispatch, spawnNode }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}