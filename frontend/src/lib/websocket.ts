import { io, Socket } from 'socket.io-client';

// Whitelist of top-level commands any URL path can launch on connect. The
// backend also re-validates (characters, length) as a second line of defense.
const ALLOWED_COMMANDS = new Set([
  // navigation / info pages
  'welcome', 'about', 'contact', 'resume', 'projects', 'help',
  'trade-up-bot', 'agentelo', 'flt', 'skyblock-qol', 'term-site',
  'stm32-games', 'dotfiles', 'hone', 'harness', 'blog', 'home',
  // read-only file viewers / editors — enable deep links like
  // /nvim/projects/flt/README.md. Safety: the character regex below
  // blocks shell metachars, and the container itself is hardened
  // (no network, non-root, ephemeral, cap-drop).
  'nvim', 'vim', 'cat', 'less', 'head', 'tail', 'tree', 'ls', 'pwd',
  'file', 'stat', 'wc', 'which',
]);

// Commands that take a path-like arg (the rest of the URL segments get joined
// with '/' into a single arg, e.g. /cat/frontend/src/page.tsx → cat frontend/src/page.tsx).
const PATH_ARG_COMMANDS = new Set([
  'nvim', 'vim', 'cat', 'less', 'head', 'tail', 'tree', 'ls',
  'file', 'stat', 'wc', 'which',
]);

// Project aliases that each correspond to a standalone script of the same
// name — lets /projects/flt jump directly to the flt project rather than
// just running the projects-list script.
const PROJECT_ALIASES = new Set([
  'flt', 'agentelo', 'trade-up-bot', 'skyblock-qol',
  'term-site', 'stm32-games', 'dotfiles', 'hone', 'harness',
]);

function pathToCommand(pathname: string): string | undefined {
  const clean = pathname.replace(/^\/+|\/+$/g, '');
  if (!clean) return undefined; // '/' → default welcome

  const [head, ...rest] = clean.split('/');

  // /projects/<name> → run <name> directly so it drops the user into that
  // project's dir instead of the projects listing.
  if (head === 'projects' && rest[0] && PROJECT_ALIASES.has(rest[0])) {
    return rest[0];
  }

  if (!ALLOWED_COMMANDS.has(head)) return undefined;

  // Every remaining segment must pass the safe-char whitelist. Any weird
  // char (space, quote, ;, |, &, etc.) → drop to running the head alone.
  for (const seg of rest) {
    if (!/^[A-Za-z0-9._-]+$/.test(seg)) return head;
  }

  // Path-arg commands (nvim, cat, …) join segments with '/' into a single
  // filepath arg. /nvim/projects/flt/README.md → `nvim projects/flt/README.md`.
  if (PATH_ARG_COMMANDS.has(head)) {
    const joined = rest.join('/');
    return joined ? `${head} ${joined}` : head;
  }

  // Everything else (blog, projects, about, etc.): each segment is its own
  // arg, capped at 2 (keeps /blog/<slug>/<extra> predictable).
  const safeArgs = rest.slice(0, 2);
  return safeArgs.length ? `${head} ${safeArgs.join(' ')}` : head;
}

export interface WebSocketManager {
  socket: Socket | null;
  connect: () => void;
  disconnect: () => void;
  sendInput: (data: string) => void;
  onOutput: (callback: (data: string) => void) => void;
  onConnect: (callback: () => void) => void;
  onDisconnect: (callback: () => void) => void;
  onError: (callback: (error: Error) => void) => void;
  resize: (cols: number, rows: number) => void;
}

export function createWebSocketManager(): WebSocketManager {
  let socket: Socket | null = null;
  let connectCallback: (() => void) | null = null;
  let disconnectCallback: (() => void) | null = null;
  let errorCallback: ((error: Error) => void) | null = null;
  let outputCallback: ((data: string) => void) | null = null;
  // Buffer the most recent resize so we can re-emit it once the socket connects.
  // Without this, the xterm fit on mount (at 100/200ms) fires before socket is
  // ready, we drop the emit, and the PTY stays at default 80x24 until the user
  // triggers another browser-side resize (zoom, window resize).
  let lastResize: { cols: number; rows: number } | null = null;

  const getWebSocketUrl = (): string => {
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL;
    }
    if (typeof window !== 'undefined') {
      return `${window.location.protocol}//${window.location.host}`;
    }
    return 'http://localhost:3001';
  };

  const connect = () => {
    if (socket?.connected) return;

    const initCommand = typeof window !== 'undefined' ? pathToCommand(window.location.pathname) : undefined;

    socket = io(getWebSocketUrl(), {
      transports: ['polling', 'websocket'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      forceNew: true,
      upgrade: true,
      rememberUpgrade: false,
      auth: initCommand ? { initCommand } : undefined,
    });

    socket.on('connect', () => {
      // Flush any resize that was emitted before the socket became ready so
      // the container PTY gets sized correctly on first render (not just
      // after a browser zoom/resize).
      if (lastResize) socket?.emit('resize', lastResize);
      connectCallback?.();
    });

    socket.on('disconnect', () => {
      disconnectCallback?.();
    });

    socket.on('connect_error', (error) => {
      errorCallback?.(error);

      setTimeout(() => {
        if (socket && !socket.connected) {
          socket.connect();
        }
      }, 3000);
    });

    socket.on('reconnect_failed', () => {
      errorCallback?.(new Error('Reconnection failed'));
    });

    socket.on('output', (data) => {
      outputCallback?.(data);
    });
  };

  const disconnect = () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  };

  const sendInput = (data: string) => {
    if (socket?.connected) {
      socket.emit('input', data);
    }
  };

  const onOutput = (callback: (data: string) => void) => {
    outputCallback = callback;
  };

  const onConnect = (callback: () => void) => {
    connectCallback = callback;
  };

  const onDisconnect = (callback: () => void) => {
    disconnectCallback = callback;
  };

  const onError = (callback: (error: Error) => void) => {
    errorCallback = callback;
  };

  const resize = (cols: number, rows: number) => {
    lastResize = { cols, rows };
    if (socket?.connected) {
      socket.emit('resize', lastResize);
    }
  };

  return {
    get socket() { return socket; },
    connect,
    disconnect,
    sendInput,
    onOutput,
    onConnect,
    onDisconnect,
    onError,
    resize,
  };
}
