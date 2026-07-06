// eventBus.js
// -----------------------------------------------------------------------
// Um barramento de eventos simples no padrão Publish/Subscribe.
// Permite que Widgets renderizados dinamicamente (e o próprio Core)
// conversem entre si sem precisarem se conhecer diretamente — baixo
// acoplamento é essencial aqui, já que cada widget é compilado e
// montado de forma isolada em tempo de execução.
// -----------------------------------------------------------------------

class EventBus {
  constructor() {
    // Mapa: nome do evento -> Set de callbacks inscritos
    this.listeners = new Map();
  }

  /**
   * Registra um listener para um evento.
   * @param {string} eventName
   * @param {Function} callback
   * @returns {Function} função de "unsubscribe" — útil dentro de um
   *                      useEffect(() => appBus.on(...), [])
   */
  on(eventName, callback) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName).add(callback);
    return () => this.off(eventName, callback);
  }

  /** Remove um listener específico de um evento. */
  off(eventName, callback) {
    this.listeners.get(eventName)?.delete(callback);
  }

  /**
   * Dispara um evento para todos os listeners inscritos.
   * Erros lançados por um listener são isolados: um widget com bug não
   * pode derrubar os outros que também escutam o mesmo evento.
   */
  emit(eventName, payload) {
    this.listeners.get(eventName)?.forEach((callback) => {
      try {
        callback(payload);
      } catch (err) {
        console.error(`[appBus] Erro no listener de "${eventName}":`, err);
      }
    });
  }

  /** Remove todos os listeners — útil ao resetar o Canvas por completo. */
  clear() {
    this.listeners.clear();
  }
}

// Instância única (Singleton): toda a aplicação — Core e Widgets —
// compartilha o mesmo barramento.
export const appBus = new EventBus();

export default EventBus;
