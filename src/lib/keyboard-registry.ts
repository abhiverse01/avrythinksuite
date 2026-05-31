export interface ShortcutDefinition {
  keys: string;           // hotkeys-js format: "cmd+k", "cmd+shift+s", etc.
  description: string;
  category: 'global' | 'docs' | 'sheets' | 'slides' | 'canvas' | 'examiner';
  action: () => void;
  enabled?: () => boolean;  // optional condition
}

class KeyboardRegistry {
  private shortcuts: Map<string, ShortcutDefinition> = new Map();
  private listeners: Array<{ keys: string; handler: (...args: any[]) => void }> = [];

  register(def: ShortcutDefinition) {
    this.shortcuts.set(def.keys, def);
  }

  unregister(keys: string) {
    this.shortcuts.delete(keys);
  }

  getAll(): ShortcutDefinition[] {
    return Array.from(this.shortcuts.values());
  }

  getByCategory(category: ShortcutDefinition['category']): ShortcutDefinition[] {
    return this.getAll().filter(s => s.category === category);
  }

  bindAll() {
    // Unbind existing first
    this.unbindAll();

    for (const [keys, def] of this.shortcuts) {
      const handler = (...args: any[]) => {
        if (!def.enabled || def.enabled()) {
          def.action();
        }
      };
      // hotkeys-js will be called at mount point
      this.listeners.push({ keys, handler });
    }
  }

  unbindAll() {
    this.listeners = [];
  }

  getListeners() {
    return this.listeners;
  }
}

export const keyboardRegistry = new KeyboardRegistry();
