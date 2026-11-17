(() => {
  const $ = (selector) => document.querySelector(selector);
  const toast = $('#settingsToast');
  let toastTimer;

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  const storageKey = 'novaBusinessSettings';

  function getSettings() {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || '{}');
    } catch {
      return {};
    }
  }

  function saveSettings() {
    const data = {};
    document.querySelectorAll('#businessForm [name], #preferencesForm [name], .notification-row input[name]').forEach((field) => {
      data[field.name] = field.type === 'checkbox' ? field.checked : field.value;
    });

    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
      showToast('Settings saved successfully!');
    } catch {
      showToast('Could not save settings on this device.');
    }
  }

  function loadSettings() {
    const data = getSettings();

    document.querySelectorAll('#businessForm [name], #preferencesForm [name], .notification-row input[name]').forEach((field) => {
      if (!Object.prototype.hasOwnProperty.call(data, field.name)) return;
      if (field.type === 'checkbox') {
        field.checked = Boolean(data[field.name]);
      } else {
        field.value = data[field.name];
      }
    });
  }

  $('#saveAll').addEventListener('click', saveSettings);

  $('#businessForm').addEventListener('submit', (event) => event.preventDefault());
  $('#preferencesForm').addEventListener('submit', (event) => event.preventDefault());

  $('#passwordToggle').addEventListener('click', () => {
    $('#passwordForm').classList.toggle('hidden');
  });

  $('#passwordForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const fields = [...event.currentTarget.querySelectorAll('input')];
    if (fields[1].value !== fields[2].value) {
      showToast('New passwords do not match.');
      return;
    }
    showToast('Password updates will be enabled after backend integration.');
    event.currentTarget.reset();
  });

  const menuToggle = $('#menuToggle');
  const sidebar = $('#sidebar');
  menuToggle.addEventListener('click', () => sidebar.classList.toggle('open'));

  document.addEventListener('click', (event) => {
    if (window.innerWidth <= 700 &&
        sidebar.classList.contains('open') &&
        !sidebar.contains(event.target) &&
        !menuToggle.contains(event.target)) {
      sidebar.classList.remove('open');
    }
  });

  loadSettings();
})();
