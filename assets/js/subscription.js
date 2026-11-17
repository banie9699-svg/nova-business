(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const toast = $('#subscriptionToast');
  let toastTimer;

  const plans = {
    Free: { monthly: 0, yearly: 0 },
    Starter: { monthly: 499, yearly: 4990 },
    Professional: { monthly: 999, yearly: 10190 },
    Business: { monthly: 1999, yearly: 20390 }
  };

  let billing = 'monthly';
  let currentPlan = 'Free';

  function money(amount) {
    return '₹' + amount.toLocaleString('en-IN');
  }

  function notify(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
  }

  function renderPrices() {
    $$('.pricing-card').forEach((card) => {
      const plan = card.dataset.plan;
      const price = $('[data-monthly]', card);
      if (!price) return;

      price.textContent = money(plans[plan][billing]);
      const period = $('.price-period', card);
      period.textContent = billing === 'monthly' ? '/ month' : '/ year';
    });
  }

  function renderCurrentPlan() {
    $('#currentPlanName').textContent = currentPlan + ' Plan';
    $('#currentPlanDescription').textContent =
      currentPlan === 'Free' ? "You're currently using the free demo plan." :
      'Your selected plan is saved as a local demo selection.';

    $$('.pricing-card').forEach((card) => {
      const plan = card.dataset.plan;
      const button = $('[data-select]', card);
      const selected = plan === currentPlan;
      card.classList.toggle('selected-plan', selected);
      button.textContent = selected ? 'Current Plan' : 'Choose ' + plan;
      button.disabled = selected;
      button.classList.toggle('filled', plan === 'Professional' && !selected);
      button.classList.toggle('outline', !(plan === 'Professional' && !selected));
    });

    $('#currentPlanBadge').textContent = 'ACTIVE';
  }

  $$('.billing-option').forEach((button) => {
    button.addEventListener('click', () => {
      billing = button.dataset.billing;
      $$('.billing-option').forEach((item) => item.classList.toggle('active', item === button));
      renderPrices();
    });
  });

  $$('[data-select]').forEach((button) => {
    button.addEventListener('click', () => {
      const plan = button.dataset.select;
      if (plan === currentPlan) return;

      notify('Subscription checkout will be enabled after secure payment integration.');
    });
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

  renderPrices();
  renderCurrentPlan();
})();
