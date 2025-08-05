import { createSignal, createEffect, onCleanup, Show, For } from 'solid-js';
import { ErrorDetails, errorLogger } from '../utils/error-logger';

interface ToastProps {
  error: ErrorDetails;
  onClose: () => void;
}

const ErrorToastItem = (props: ToastProps) => {
  const [isExpanded, setIsExpanded] = createSignal(false);
  const [isVisible, setIsVisible] = createSignal(false);
  const [copySuccess, setCopySuccess] = createSignal(false);

  // Auto-show animation
  createEffect(() => {
    setTimeout(() => setIsVisible(true), 50);
  });

  // Auto-close after 10 seconds for non-error types
  createEffect(() => {
    if (props.error.type !== 'error') {
      const timer = setTimeout(() => {
        handleClose();
      }, 10000);

      onCleanup(() => clearTimeout(timer));
    }
  });

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => props.onClose(), 300); // Wait for animation
  };

  const copyToClipboard = async () => {
    try {
      const errorReport = errorLogger.generateErrorReport(props.error.id);
      await navigator.clipboard.writeText(errorReport);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy to clipboard:', err);
      // Fallback for older browsers
      fallbackCopyTextToClipboard(errorReport());
    }
  };

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Fallback: Could not copy text: ', err);
    }

    document.body.removeChild(textArea);
  };

  const getTypeIcon = () => {
    switch (props.error.type) {
      case 'error':
        return '🚨';
      case 'warning':
        return '⚠️';
      case 'log':
        return 'ℹ️';
      default:
        return '💬';
    }
  };

  const getTypeColor = () => {
    switch (props.error.type) {
      case 'error':
        return '#f44336';
      case 'warning':
        return '#ff9800';
      case 'log':
        return '#2196f3';
      default:
        return '#4caf50';
    }
  };

  const formatTimestamp = () => {
    const date = new Date(props.error.timestamp);
    return date.toLocaleTimeString();
  };

  const errorReport = () => errorLogger.generateErrorReport(props.error.id);

  return (
    <div
      class="error-toast"
      classList={{
        'error-toast--visible': isVisible(),
        'error-toast--error': props.error.type === 'error',
        'error-toast--warning': props.error.type === 'warning',
        'error-toast--expanded': isExpanded(),
      }}
      style={{
        '--toast-color': getTypeColor(),
      }}
    >
      <div
        class="error-toast__header"
        onClick={() => setIsExpanded(!isExpanded())}
      >
        <div class="error-toast__icon">{getTypeIcon()}</div>
        <div class="error-toast__title">
          <div class="error-toast__type">{props.error.type.toUpperCase()}</div>
          <div class="error-toast__time">{formatTimestamp()}</div>
        </div>
        <button
          class="error-toast__expand"
          title={isExpanded() ? 'Collapse' : 'Expand details'}
        >
          {isExpanded() ? '▼' : '▶'}
        </button>
        <button
          class="error-toast__close"
          onClick={e => {
            e.stopPropagation();
            handleClose();
          }}
          title="Close"
        >
          ✕
        </button>
      </div>

      <div class="error-toast__message">{props.error.message}</div>

      <Show when={isExpanded()}>
        <div class="error-toast__details">
          <Show when={props.error.stack}>
            <div class="error-toast__section">
              <h4>Stack Trace:</h4>
              <pre class="error-toast__code">{props.error.stack}</pre>
            </div>
          </Show>

          <Show when={props.error.source}>
            <div class="error-toast__section">
              <h4>Source:</h4>
              <div>
                {props.error.source}:{props.error.lineno}:{props.error.colno}
              </div>
            </div>
          </Show>

          <Show when={props.error.gameState}>
            <div class="error-toast__section">
              <h4>Game State:</h4>
              <pre class="error-toast__code">
                {JSON.stringify(props.error.gameState, null, 2)}
              </pre>
            </div>
          </Show>

          <div class="error-toast__section">
            <h4>System Info:</h4>
            <div class="error-toast__system-info">
              <div>
                <strong>Browser:</strong> {props.error.context.userAgent}
              </div>
              <div>
                <strong>Screen:</strong> {props.error.context.screen.width}×
                {props.error.context.screen.height}
              </div>
              <div>
                <strong>Viewport:</strong> {props.error.context.viewport.width}×
                {props.error.context.viewport.height}
              </div>
              <div>
                <strong>Device Pixel Ratio:</strong>{' '}
                {props.error.context.screen.devicePixelRatio}
              </div>
              <div>
                <strong>URL:</strong> {props.error.context.url}
              </div>
            </div>
          </div>

          <div class="error-toast__actions">
            <button
              class="error-toast__copy-btn"
              onClick={copyToClipboard}
              disabled={copySuccess()}
            >
              {copySuccess() ? '✓ Copied!' : '📋 Copy Error Report'}
            </button>
          </div>
        </div>
      </Show>
    </div>
  );
};

export const ErrorToastManager = () => {
  const [toasts, setToasts] = createSignal<ErrorDetails[]>([]);

  const addToast = (error: ErrorDetails) => {
    setToasts(prev => [error, ...prev.slice(0, 4)]); // Keep max 5 toasts
  };

  const removeToast = (errorId: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== errorId));
  };

  // Listen for error events
  createEffect(() => {
    const handleErrorLogged = (event: CustomEvent<ErrorDetails>) => {
      addToast(event.detail);
    };

    window.addEventListener(
      'error-logged',
      handleErrorLogged as (event: Event) => void
    );

    onCleanup(() => {
      window.removeEventListener(
        'error-logged',
        handleErrorLogged as (event: Event) => void
      );
    });
  });

  return (
    <div class="error-toast-container">
      <For each={toasts()}>
        {error => (
          <ErrorToastItem error={error} onClose={() => removeToast(error.id)} />
        )}
      </For>
    </div>
  );
};
