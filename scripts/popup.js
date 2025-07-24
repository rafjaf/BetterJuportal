document.addEventListener('DOMContentLoaded', function() {
  const manifest = chrome.runtime.getManifest();
  document.getElementById('version').textContent = manifest.version;
});
