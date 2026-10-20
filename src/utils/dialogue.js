import { createElement } from 'react';

// ── Fallback Resolvers ────────────────────────────────────────────────────────
export function resolveActorImage(actor) {
  if (!actor) return '';
  return actor.imageCode?.trim() || `${actor.name}_main`;
}

export function resolveExpressionImage(actor, exprName) {
  if (!actor || !exprName) return '';
  const expr = actor.expressions?.find(e => e.name === exprName);
  if (expr?.imageCode?.trim()) return expr.imageCode.trim();
  return `${actor.name}_${exprName}`;
}

export function resolveSoundCode(actorName, nodeId, soundCode) {
  if (soundCode?.trim()) return soundCode.trim();
  return `${actorName || 'unknown'}_sound_${nodeId}`;
}

export function resolveBaseSoundCode(actor) {
  if (!actor) return '';
  return actor.baseSoundCode?.trim() || `${actor.name}_sound_default`;
}

// ── Node Factories ────────────────────────────────────────────────────────────
export function createDialogueNode(id, position = { x: 100, y: 100 }) {
  return {
    id: String(id),
    type: 'dialogueNode',
    position,
    data: {
      actorName: '',
      expressionName: '',
      text: '',
      soundBlocks: [],
      grantTag: '',
      revokeTag: '',
    },
  };
}

export function createChoiceNode(id, position = { x: 100, y: 100 }) {
  return {
    id: String(id),
    type: 'choiceNode',
    position,
    data: {
      actorName: '',
      expressionName: '',
      prompt: '',
      grantTag: '',
      revokeTag: '',
      options: [{ optId: 'a', text: '', requiredTag: '', grantTag: '', revokeTag: '' }],
    },
  };
}

export function createTagNode(id, position = { x: 100, y: 100 }) {
  return {
    id: String(id),
    type: 'tagNode',
    position,
    data: { operation: 'GRANT', tagKey: '' },
  };
}

let _sbCounter = 0;
export function createSoundBlock() {
  return { id: 's' + (++_sbCounter), soundCode: '', executionRule: 'ONCE', trigger: 'ON_NODE_START' };
}

let _optCounter = 0;
export function genOptId() { return 'o' + (++_optCounter); }

export function createActor(name = 'Actor') {
  return { name, imageCode: '', baseSoundCode: '', expressions: [] };
}

// ── BBCode Helper & Preview Generator ─────────────────────────────────────────
export function applyBBCode(currentText, tagType, param = '') {
  const openTag = param ? `[${tagType}=${param}]` : `[${tagType}]`;
  const closeTag = `[/${tagType}]`;
  return `${currentText}${openTag}${closeTag}`;
}

export function parseBBCodeToReact(text) {
  if (!text) return null;

  // Simple regex parser for [b], [i], [color=#hex] BBCode tags
  let formatted = text
    .replace(/[b](.*?)\[\/b\]/gi, '<strong>$1</strong>')
    .replace(/[i](.*?)\[\/i\]/gi, '<em>$1</em>')
    .replace(/\[color=(.*?)\](.*?)\[\/color\]/gi, '<span style="color: $1">$2</span>');

  return createElement('span', {
    dangerouslySetInnerHTML: { __html: formatted },
  });
}

// ── Workspace Serialization ───────────────────────────────────────────────────
export function serializeWorkspace(state) {
  return {
    version: '1.1.0',
    dialogueName: state.dialogueName,
    nextNodeId: state.nextNodeId,
    actors: state.actors,
    nodes: state.nodes,
    edges: state.edges,
    importedAudioLib: state.importedAudioLib,
    importedSpriteLib: state.importedSpriteLib,
  };
}

// ── Simplified Runtime JSON Export ───────────────────────────────────────────
export function exportRuntimeJSON(dialogueName, nodes, edges, actors) {
  const actorMap = Object.fromEntries(actors.map(a => [a.name, a]));
  
  // Prefer explicit node with id "start", otherwise locate root node without target incoming edges
  const startNode = nodes.find(n => n.id === 'start');
  const targetIds = new Set(edges.map(e => e.target));
  const entryNode = startNode || nodes.find(n => !targetIds.has(n.id)) || nodes[0];

  const nodesOut = {};
  for (const node of nodes) {
    const d = node.data;

    if (node.type === 'dialogueNode') {
      const actor = actorMap[d.actorName];
      const nextEdge = edges.find(e => e.source === node.id && e.sourceHandle === 'next');
      const out = {
        type: 'dialogue',
        actor: d.actorName || null,
        expression: d.expressionName || null,
        text: d.text || '',
        next: nextEdge?.target || null,
      };

      if (d.grantTag) out.grant_tag = d.grantTag;
      if (d.revokeTag) out.revoke_tag = d.revokeTag;

      if (actor) {
        out.actor_image = resolveActorImage(actor);
        if (d.expressionName) out.expression_image = resolveExpressionImage(actor, d.expressionName);
      }
      if ((d.soundBlocks || []).length > 0) {
        out.sounds = d.soundBlocks.map(sb => ({
          code: resolveSoundCode(d.actorName, node.id, sb.soundCode),
          rule: sb.executionRule,
          trigger: sb.trigger,
        }));
      }
      nodesOut[node.id] = out;

    } else if (node.type === 'choiceNode') {
      const actor = actorMap[d.actorName];
      const out = {
        type: 'choice',
        actor: d.actorName || null,
        expression: d.expressionName || null,
        prompt: d.prompt || '',
        options: (d.options || []).map(opt => {
          const edge = edges.find(e => e.source === node.id && e.sourceHandle === `option-${opt.optId}`);
          const o = { text: opt.text, next: edge?.target || null };
          if (opt.requiredTag) o.required_tag = opt.requiredTag;
          if (opt.grantTag) o.grant_tag = opt.grantTag;
          if (opt.revokeTag) o.revoke_tag = opt.revokeTag;
          return o;
        }),
      };

      if (d.grantTag) out.grant_tag = d.grantTag;
      if (d.revokeTag) out.revoke_tag = d.revokeTag;

      if (actor) {
        out.actor_image = resolveActorImage(actor);
        if (d.expressionName) out.expression_image = resolveExpressionImage(actor, d.expressionName);
      }

      nodesOut[node.id] = out;

    } else if (node.type === 'tagNode') {
      const nextEdge = edges.find(e => e.source === node.id && e.sourceHandle === 'next');
      nodesOut[node.id] = {
        type: 'tag',
        operation: d.operation.toLowerCase(),
        tag: d.tagKey || '',
        next: nextEdge?.target || null,
      };
    }
  }

  return { dialogue_id: dialogueName, entry: entryNode?.id || 'start', nodes: nodesOut };
}

// ── Godot .tres Export ────────────────────────────────────────────────────────
export function exportGodotTres(dialogueName, runtimeJSON) {
  const escaped = JSON.stringify(JSON.stringify(runtimeJSON)).slice(1, -1);
  return `[gd_resource type="Resource" script_class="DialogueResource" load_steps=2 format=3]

[ext_resource type="Script" path="res://scripts/resources/DialogueResource.gd" id="1_dialogue"]

[resource]
script = ExtResource("1_dialogue")
dialogue_id = "${dialogueName}"
json_data = "${escaped}"
`;
}

// ── GDScript Dict Parser ──────────────────────────────────────────────────────
export function parseGDScriptDict(content) {
  const result = {};
  if (!content) return result;
  for (const line of content.split('\n')) {
    const m = line.match(/"([^"]+)"\s*:\s*("res:\/\/[^"]*")/);
    if (m) result[m[1]] = m[2];
  }
  return result;
}

// ── GDScript Library Builders ────────────────────────────────────────────────
export function buildAudioLibrary(actors, nodes, existingContent = '') {
  const keys = parseGDScriptDict(existingContent);

  for (const actor of actors) {
    const code = resolveBaseSoundCode(actor);
    if (!keys[code]) keys[code] = `"res://audio/voices/${code}.ogg"`;
  }
  for (const node of nodes) {
    if (node.type !== 'dialogueNode') continue;
    for (const sb of node.data.soundBlocks || []) {
      const code = resolveSoundCode(node.data.actorName, node.id, sb.soundCode);
      if (!keys[code]) keys[code] = `"res://audio/voices/${code}.ogg"`;
    }
  }

  const entries = Object.entries(keys).map(([k, v]) => `\t"${k}": ${v}`).join(',\n');
  return `extends Node
class_name AudioLibrary

const AUDIO_KEYS = {
${entries}
}

func get_stream(key: String) -> AudioStream:
\tvar path = AUDIO_KEYS.get(key, "")
\tif path.is_empty():
\t\tpush_warning("AudioLibrary: key not found: " + key)
\t\treturn null
\treturn load(path)
`;
}

export function buildSpriteLibrary(actors, existingContent = '') {
  const keys = parseGDScriptDict(existingContent);

  for (const actor of actors) {
    const baseCode = resolveActorImage(actor);
    if (!keys[baseCode]) keys[baseCode] = `"res://art/characters/${baseCode}.png"`;
    for (const expr of actor.expressions || []) {
      const exprCode = resolveExpressionImage(actor, expr.name);
      if (!keys[exprCode]) keys[exprCode] = `"res://art/characters/${exprCode}.png"`;
    }
  }

  const entries = Object.entries(keys).map(([k, v]) => `\t"${k}": ${v}`).join(',\n');
  return `extends Node
class_name SpriteLibrary

const SPRITE_KEYS = {
${entries}
}

func get_texture(key: String) -> Texture2D:
\tvar path = SPRITE_KEYS.get(key, "")
\tif path.is_empty():
\t\tpush_warning("SpriteLibrary: key not found: " + key)
\t\treturn null
\treturn load(path)
`;
}

// ── File Helpers ──────────────────────────────────────────────────────────────
export function downloadFile(content, filename, mimeType = 'application/json') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}