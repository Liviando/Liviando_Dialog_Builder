import { useState, useRef, useCallback } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { StoreProvider, useStore } from './store/store';
import Toolbar from './components/Toolbar';
import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import Inspector from './components/Inspector';
import ActorManager from './components/ActorManager';

function EditorLayout() {
  const { state, dispatch, spawnNode } = useStore();
  const [showActorManager, setShowActorManager] = useState(false);
  const [dialogueName, setDialogueName] = useState(state.dialogueName);
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  // ── Export folder (File System Access API) ────────────────────────────────
  const [exportDirHandle, setExportDirHandle] = useState(null);

  const pickExportFolder = useCallback(async () => {
    if (!window.showDirectoryPicker) {
      alert('Folder picker is not supported in this browser. All exports will use normal browser downloads.');
      return;
    }
    try {
      const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
      setExportDirHandle(handle);
    } catch (err) {
      if (err.name !== 'AbortError') {
        // AbortError = user hit Cancel, ignore silently. Anything else — show it.
        alert('Could not open folder: ' + err.message);
      }
    }
  }, []);

  const onInit = useCallback((instance) => {
    setReactFlowInstance(instance);
  }, []);

  // ── Canvas drag-and-drop ──────────────────────────────────────────────────
  const handleCanvasDrop = useCallback((e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/dialoguenode');
    if (!type || !reactFlowInstance || !reactFlowWrapper.current) return;

    const bounds = reactFlowWrapper.current.getBoundingClientRect();
    const position = reactFlowInstance.screenToFlowPosition({
      x: e.clientX - bounds.left,
      y: e.clientY - bounds.top,
    });
    spawnNode(type, position);
  }, [reactFlowInstance, spawnNode]);

  const handleCanvasDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
      {/* Toolbar */}
      <Toolbar
        onOpenActorManager={() => setShowActorManager(true)}
        dialogueName={dialogueName}
        setDialogueName={setDialogueName}
        exportDirHandle={exportDirHandle}
      />

      {/* Main Layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar
          reactFlowWrapper={reactFlowWrapper}
          reactFlowInstance={reactFlowInstance}
          exportDirHandle={exportDirHandle}
          onPickFolder={pickExportFolder}
        />

        {/* Canvas wrapper handles drops */}
        <div
          style={{ flex: 1, position: 'relative', overflow: 'hidden' }}
          onDrop={handleCanvasDrop}
          onDragOver={handleCanvasDragOver}
          ref={reactFlowWrapper}
        >
          <Canvas
            reactFlowWrapper={reactFlowWrapper}
            onInit={onInit}
          />
        </div>

        <Inspector />
      </div>

      {/* Actor Manager Modal */}
      {showActorManager && (
        <ActorManager
          onClose={() => setShowActorManager(false)}
          exportDirHandle={exportDirHandle}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <ReactFlowProvider>
        <EditorLayout />
      </ReactFlowProvider>
    </StoreProvider>
  );
}
