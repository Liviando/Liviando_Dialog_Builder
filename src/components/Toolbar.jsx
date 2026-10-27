import { useRef, useCallback, useState, useEffect } from 'react';
import {
  Save, FolderOpen, Download, FileCode2, Code2, Users, Pencil,
  Sparkles, Sun, Moon, Upload,
} from 'lucide-react';
import { useStore } from '../store/store';
import {
  serializeWorkspace, exportRuntimeJSON, exportGodotTres,
  buildAudioLibrary, buildSpriteLibrary, downloadFile, readFileAsText,
} from '../utils/dialogue';

export default function Toolbar({ onOpenActorManager, dialogueName, setDialogueName }) {
  const { state, dispatch } = useStore();
  const fileInputRef = useRef();
  const audioImportRef = useRef();
  const spriteImportRef = useRef();

  // ── Theme toggle ──────────────────────────────────────────────────────────
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('db-theme') || 'dark';
  });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('db-theme', theme);
  }, [theme]);
  const toggleTheme = useCallback(() => setTheme(t => t === 'dark' ? 'light' : 'dark'), []);

  // ── Workspace load/save ───────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    const workspace = serializeWorkspace(state);
    downloadFile(JSON.stringify(workspace, null, 2), `${state.dialogueName}_workspace.json`);
  }, [state]);

  const handleLoad = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await readFileAsText(file);
      const workspace = JSON.parse(text);
      dispatch({ type: 'LOAD_WORKSPACE', payload: workspace });
      setDialogueName(workspace.dialogueName || 'my_dialogue');
    } catch (err) {
      alert('Failed to load workspace: ' + err.message);
    }
    e.target.value = '';
  }, [dispatch, setDialogueName]);

  // ── Exports ───────────────────────────────────────────────────────────────
  const handleExportJSON = useCallback(() => {
    const json = exportRuntimeJSON(state.dialogueName, state.nodes, state.edges, state.actors, state.entry);
    downloadFile(JSON.stringify(json, null, 2), `${state.dialogueName}.json`);
  }, [state]);

  const handleExportTres = useCallback(() => {
    const json = exportRuntimeJSON(state.dialogueName, state.nodes, state.edges, state.actors, state.entry);
    const tres = exportGodotTres(state.dialogueName, json);
    downloadFile(tres, `${state.dialogueName}.tres`, 'text/plain');
  }, [state]);

  // ── GDScript: import existing, then export merged ─────────────────────────
  const handleImportAudio = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await readFileAsText(file);
    dispatch({ type: 'SET_IMPORTED_AUDIO', payload: text });
    alert('AudioLibrary.gd imported! It will be merged on next export.');
    e.target.value = '';
  }, [dispatch]);

  const handleImportSprite = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await readFileAsText(file);
    dispatch({ type: 'SET_IMPORTED_SPRITE', payload: text });
    alert('SpriteLibrary.gd imported! It will be merged on next export.');
    e.target.value = '';
  }, [dispatch]);

  const handleExportAudioLib = useCallback(() => {
    const gd = buildAudioLibrary(state.actors, state.nodes, state.importedAudioLib);
    downloadFile(gd, 'AudioLibrary.gd', 'text/plain');
  }, [state]);

  const handleExportSpriteLib = useCallback(() => {
    const gd = buildSpriteLibrary(state.actors, state.importedSpriteLib);
    downloadFile(gd, 'SpriteLibrary.gd', 'text/plain');
  }, [state]);

  const hasImportedAudio  = !!state.importedAudioLib;
  const hasImportedSprite = !!state.importedSpriteLib;

  return (
    <div className="toolbar" style={{ flexWrap: 'wrap', gap: '6px' }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '4px' }}>
        <div style={{
          width: '28px', height: '28px', borderRadius: '8px',
          background: 'linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-blue) 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 12px rgba(124,58,237,0.4)',
        }}>
          <Sparkles size={14} color="white" />
        </div>
        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
          Liviando <span style={{ color: 'var(--accent-purple-light)' }}>Dialog Builder</span>
        </span>
      </div>

      {/* Dialogue name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '7px', padding: '4px 10px' }}>
        <Pencil size={12} style={{ color: 'var(--text-muted)' }} />
        <input
          style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 500, outline: 'none', width: '150px', fontFamily: 'JetBrains Mono' }}
          value={dialogueName}
          onChange={e => {
            setDialogueName(e.target.value);
            dispatch({ type: 'SET_DIALOGUE_NAME', payload: e.target.value });
          }}
          placeholder="dialogue_name"
          spellCheck={false}
        />
      </div>

      <div style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 2px' }} />

      {/* Entry node picker */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '7px', padding: '4px 10px' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>▶ Entry</span>
        <select
          style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 500, outline: 'none', fontFamily: 'JetBrains Mono', cursor: 'pointer', maxWidth: '100px' }}
          value={state.entry || ''}
          onChange={e => dispatch({ type: 'SET_ENTRY', payload: e.target.value })}
        >
          {state.nodes.map(n => (
            <option key={n.id} value={n.id}>{n.id}</option>
          ))}
        </select>
      </div>

      <div style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 2px' }} />
      <button className="btn btn-ghost" onClick={() => fileInputRef.current?.click()}>
        <FolderOpen size={14} /> Load
      </button>
      <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleLoad} />

      <button className="btn btn-secondary" onClick={handleSave}>
        <Save size={14} /> Save
      </button>

      <div style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 2px' }} />

      {/* Dialogue exports */}
      <button className="btn btn-cyan" onClick={handleExportJSON}>
        <Download size={14} /> Export JSON
      </button>
      <button className="btn btn-amber" onClick={handleExportTres}>
        <FileCode2 size={14} /> Export .tres
      </button>

      <div style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 2px' }} />

      {/* GDScript import + export */}
      <button
        className="btn btn-ghost"
        onClick={() => audioImportRef.current?.click()}
        title="Import existing AudioLibrary.gd to merge"
        style={{ color: hasImportedAudio ? 'var(--accent-green)' : undefined }}
      >
        <Upload size={14} /> {hasImportedAudio ? 'Audio ✓' : 'Audio.gd'}
      </button>
      <input ref={audioImportRef} type="file" accept=".gd" style={{ display: 'none' }} onChange={handleImportAudio} />

      <button className="btn btn-success" onClick={handleExportAudioLib}>
        <Code2 size={14} /> Export AudioLib
      </button>

      <button
        className="btn btn-ghost"
        onClick={() => spriteImportRef.current?.click()}
        title="Import existing SpriteLibrary.gd to merge"
        style={{ color: hasImportedSprite ? 'var(--accent-green)' : undefined }}
      >
        <Upload size={14} /> {hasImportedSprite ? 'Sprite ✓' : 'Sprite.gd'}
      </button>
      <input ref={spriteImportRef} type="file" accept=".gd" style={{ display: 'none' }} onChange={handleImportSprite} />

      <button className="btn btn-success" onClick={handleExportSpriteLib}>
        <Code2 size={14} /> Export SpriteLib
      </button>

      <div style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 2px' }} />

      {/* Actors */}
      <button className="btn btn-primary" onClick={onOpenActorManager}>
        <Users size={14} /> Actors
        {state.actors.length > 0 && (
          <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '99px', padding: '0 5px', fontSize: '10px' }}>
            {state.actors.length}
          </span>
        )}
      </button>

      {/* Theme toggle — pushed right */}
      <div style={{ marginLeft: 'auto' }} />
      <button
        className="btn btn-ghost tooltip"
        data-tooltip={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        onClick={toggleTheme}
        style={{
          width: '34px', height: '34px', padding: 0, justifyContent: 'center',
          borderRadius: '8px', border: '1px solid var(--border)',
          background: 'var(--bg-card)',
          color: theme === 'dark' ? '#fbbf24' : '#6d28d9',
          transition: 'all 0.2s',
        }}
      >
        {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
      </button>
    </div>
  );
}
