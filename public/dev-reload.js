// Dev reload helper - only works in development
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  // Global reload function
  window.devReload = () => {
    fetch('/api/reload', { method: 'POST' })
      .then(() => console.log('🔄 Manual reload triggered'))
      .catch(e => console.warn('⚠️ Reload failed:', e));
  };

  // Keyboard shortcut: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
      e.preventDefault();
      window.devReload();
    }
  });

  console.log('🛠️ Dev tools loaded! Use window.devReload() or Ctrl+Shift+R to force reload');
}