(() => {
  const $ = id => document.getElementById(id);
  const canvas = $('websiteCanvas');
  if (!canvas) return;

  let selected = null;
  let history = [];
  let historyIndex = -1;
  let toastTimer;

  function toast(message) {
    const el = $('builderToast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2300);
  }

  function saveHistory() {
    history = history.slice(0, historyIndex + 1);
    history.push(canvas.innerHTML);
    if (history.length > 30) history.shift();
    historyIndex = history.length - 1;
    $('saveStatus').textContent = '● Unsaved changes';
  }

  function restoreHistory(index) {
    if (index < 0 || index >= history.length) return;
    historyIndex = index;
    canvas.innerHTML = history[index];
    selected = null;
    $('propertyEditor').hidden = true;
    $('propertyEmpty').hidden = false;
    $('saveStatus').textContent = '● Unsaved changes';
  }

  function selectElement(el) {
    if (!el || el === canvas || el.closest('.canvas-drop-hint')) return;

    if (selected) selected.classList.remove('builder-selected');
    selected = el;
    selected.classList.add('builder-selected');

    $('propertyEmpty').hidden = true;
    $('propertyEditor').hidden = false;

    $('elementName').value = el.tagName.toLowerCase();
    $('elementText').value = el.innerText.trim().slice(0, 1000);
    $('textColor').value = rgbToHex(getComputedStyle(el).color);
    $('backgroundColor').value = rgbToHex(getComputedStyle(el).backgroundColor);
    $('fontSize').value = parseInt(getComputedStyle(el).fontSize) || 16;
    $('borderRadius').value = parseInt(getComputedStyle(el).borderRadius) || 0;
  }

  function rgbToHex(rgb) {
    const values = rgb.match(/\d+/g);
    if (!values || values.length < 3) return '#ffffff';
    return '#' + values.slice(0, 3).map(x =>
      Number(x).toString(16).padStart(2, '0')
    ).join('');
  }

  function makeElement(type) {
    const section = document.createElement('section');
    section.className = 'added-section';
    section.style.cssText = 'padding:24px;margin:12px;border:1px dashed #b8c9e7;border-radius:8px;text-align:center;color:#304e78;background:#f8faff';

    const heading = document.createElement('h2');
    heading.textContent = type === 'Heading' ? 'Your New Heading' : type;

    const paragraph = document.createElement('p');
    paragraph.textContent = 'Click this element to customize it.';
    paragraph.style.cssText = 'margin-top:9px;font-size:13px;color:#71819a';

    if (type === 'Button') {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = 'Click Here';
      button.style.cssText = 'background:#2864e8;color:white;border:0;border-radius:7px;padding:11px 20px';
      section.append(button);
    } else if (type === 'Divider') {
      section.innerHTML = '';
      const line = document.createElement('hr');
      line.style.border = '1px solid #dce5f3';
      section.append(line);
    } else {
      section.append(heading, paragraph);
    }

    return section;
  }

  function addElement(type) {
    const element = makeElement(type);
    const hint = $('dropHint');
    canvas.insertBefore(element, hint);
    saveHistory();
    selectElement(element);
    toast(type + ' added to your page');
  }

  canvas.addEventListener('click', event => {
    const target = event.target.closest(
      '.preview-navbar,.preview-hero,.preview-services,.added-section,' +
      '.preview-navbar strong,.preview-navbar nav a,.preview-hero h1,' +
      '.preview-hero p,.preview-hero button,.preview-services h2,.service-cards article'
    );
    if (target && canvas.contains(target)) {
      event.preventDefault();
      selectElement(target);
    }
  });

  document.querySelectorAll('.element-item').forEach(item => {
    item.addEventListener('click', () => addElement(item.dataset.element));

    item.addEventListener('dragstart', event => {
      event.dataTransfer.setData('text/plain', item.dataset.element);
    });
  });

  canvas.addEventListener('dragover', event => event.preventDefault());

  canvas.addEventListener('drop', event => {
    event.preventDefault();
    const type = event.dataTransfer.getData('text/plain');
    if (type) addElement(type);
  });

  $('elementSearch').addEventListener('input', event => {
    const query = event.target.value.toLowerCase();
    document.querySelectorAll('.element-item').forEach(item => {
      item.hidden = !item.textContent.toLowerCase().includes(query);
    });
  });

  document.querySelectorAll('.panel-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.panel-tab').forEach(x => x.classList.remove('active'));
      tab.classList.add('active');

      const layers = tab.dataset.panel === 'layers';
      $('elementsPanel').hidden = layers;
      $('layersPanel').hidden = !layers;

      if (layers) {
        $('layerList').innerHTML = '';
        canvas.querySelectorAll('header,section,.added-section').forEach((el, i) => {
          const row = document.createElement('div');
          row.className = 'layer-item';
          row.textContent = '▣ ' + (el.classList.contains('added-section')
            ? (el.querySelector('h2')?.textContent || 'New Element')
            : (el.tagName === 'HEADER' ? 'Navigation' : 'Website Section'));
          row.addEventListener('click', () => selectElement(el));
          $('layerList').append(row);
        });
      }
    });
  });

  $('elementText').addEventListener('input', event => {
    if (!selected) return;
    const firstText = Array.from(selected.childNodes).find(n => n.nodeType === 3);
    if (firstText) firstText.textContent = event.target.value;
    else if (selected.children.length) {
      const first = selected.children[0];
      if (first.children.length === 0) first.textContent = event.target.value;
      else selected.prepend(document.createTextNode(event.target.value));
    } else selected.textContent = event.target.value;
    $('saveStatus').textContent = '● Unsaved changes';
  });

  $('textColor').addEventListener('input', e => {
    if (selected) {
      selected.style.color = e.target.value;
      $('saveStatus').textContent = '● Unsaved changes';
    }
  });

  $('backgroundColor').addEventListener('input', e => {
    if (selected) {
      selected.style.backgroundColor = e.target.value;
      $('saveStatus').textContent = '● Unsaved changes';
    }
  });

  $('fontSize').addEventListener('input', e => {
    if (selected) {
      selected.style.fontSize = Math.max(8, Math.min(100, Number(e.target.value))) + 'px';
      $('saveStatus').textContent = '● Unsaved changes';
    }
  });

  $('borderRadius').addEventListener('input', e => {
    if (selected) {
      selected.style.borderRadius = e.target.value + 'px';
      $('saveStatus').textContent = '● Unsaved changes';
    }
  });

  $('deleteElementBtn').addEventListener('click', () => {
    if (!selected) return;
    selected.remove();
    selected = null;
    $('propertyEditor').hidden = true;
    $('propertyEmpty').hidden = false;
    saveHistory();
    toast('Element deleted');
  });

  $('undoBtn').addEventListener('click', () => restoreHistory(historyIndex - 1));
  $('redoBtn').addEventListener('click', () => restoreHistory(historyIndex + 1));

  document.querySelectorAll('.device-btn').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.device-btn').forEach(x => x.classList.remove('active'));
      button.classList.add('active');
      canvas.classList.remove('tablet', 'mobile');
      if (button.dataset.device !== 'desktop') canvas.classList.add(button.dataset.device);
    });
  });

  function openModal(id) { $(id).classList.add('open'); }
  function closeModal(id) { $(id).classList.remove('open'); }

  $('openAiBtn').addEventListener('click', () => openModal('aiModal'));
  $('templatesBtn').addEventListener('click', () => openModal('templatesModal'));
  $('bottomTemplatesBtn').addEventListener('click', () => openModal('templatesModal'));

  document.querySelectorAll('[data-close]').forEach(button => {
    button.addEventListener('click', () => closeModal(button.dataset.close));
  });

  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', event => {
      if (event.target === modal) closeModal(modal.id);
    });
  });

  const BUILDER_API_URL = 'https://nova-business-ai.banie9699.workers.dev/';

  function addTextElement(parent, tag, className, value) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    element.textContent = value || '';
    parent.appendChild(element);
    return element;
  }

  function renderGeneratedWebsite(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('AI returned invalid website data.');
    }

    const title = String(data.title || 'My Business').slice(0, 80);
    const tagline = String(data.tagline || 'Welcome to our business.').slice(0, 180);
    const description = String(data.description || '').slice(0, 500);
    const about = String(data.about || description).slice(0, 700);
    const cta = String(data.cta || 'Get Started').slice(0, 40);
    const services = Array.isArray(data.services) ? data.services.slice(0, 6) : [];

    if (!services.length) {
      throw new Error('AI did not provide any services. Please try again.');
    }

    saveHistory();
    canvas.replaceChildren();

    const navbar = document.createElement('header');
    navbar.className = 'preview-navbar';
    addTextElement(navbar, 'strong', 'preview-logo', title + '.');

    const nav = document.createElement('nav');
    ['Home', 'Services', 'About', 'Contact'].forEach(label => {
      const link = document.createElement('a');
      link.href = label === 'Home' ? '#home' : '#' + label.toLowerCase();
      link.textContent = label;
      nav.appendChild(link);
    });
    navbar.appendChild(nav);
    addTextElement(navbar, 'button', '', cta);
    canvas.appendChild(navbar);

    const hero = document.createElement('section');
    hero.className = 'preview-hero';
    hero.id = 'home';

    const heroContent = document.createElement('div');
    heroContent.className = 'hero-content';
    addTextElement(heroContent, 'span', 'hero-tag', title.toUpperCase());
    addTextElement(heroContent, 'h1', '', tagline);
    addTextElement(heroContent, 'p', '', description);
    addTextElement(heroContent, 'button', '', cta);
    hero.appendChild(heroContent);

    const art = document.createElement('div');
    art.className = 'hero-art';
    addTextElement(art, 'div', 'art-card art-card-one', '✦ ' + title);
    addTextElement(art, 'div', 'art-card art-card-two', '↗ ' + cta);
    addTextElement(art, 'div', 'art-circle', '');
    hero.appendChild(art);
    canvas.appendChild(hero);

    const serviceSection = document.createElement('section');
    serviceSection.className = 'preview-services';
    serviceSection.id = 'services';
    addTextElement(serviceSection, 'span', '', 'WHAT WE OFFER');
    addTextElement(serviceSection, 'h2', '', 'Our Services');

    const cards = document.createElement('div');
    cards.className = 'service-cards';

    services.forEach((service, index) => {
      const card = document.createElement('article');
      addTextElement(card, 'i', '', ['✦', '◇', '↗', '◎', '✧', '▣'][index]);
      addTextElement(card, 'h3', '', String(service.title || 'Our Service').slice(0, 80));
      addTextElement(card, 'p', '', String(service.description || '').slice(0, 220));
      cards.appendChild(card);
    });

    serviceSection.appendChild(cards);
    canvas.appendChild(serviceSection);

    const aboutSection = document.createElement('section');
    aboutSection.className = 'preview-services';
    aboutSection.id = 'about';
    addTextElement(aboutSection, 'span', '', 'GET TO KNOW US');
    addTextElement(aboutSection, 'h2', '', 'About ' + title);
    addTextElement(aboutSection, 'p', '', about);
    canvas.appendChild(aboutSection);

    const contact = document.createElement('section');
    contact.className = 'preview-services';
    contact.id = 'contact';
    addTextElement(contact, 'span', '', 'LET’S CONNECT');
    addTextElement(contact, 'h2', '', 'Ready to get started?');
    addTextElement(contact, 'p', '', 'Contact ' + title + ' to learn more.');
    addTextElement(contact, 'button', '', cta);
    canvas.appendChild(contact);

    const hint = document.createElement('div');
    hint.className = 'canvas-drop-hint';
    hint.id = 'dropHint';
    hint.textContent = '＋ Drop elements here to add to your website';
    canvas.appendChild(hint);

    selected = null;
    $('propertyEditor').hidden = true;
    $('propertyEmpty').hidden = false;
    closeModal('aiModal');
    toast('AI website generated successfully!');
  }

  $('generateWebsiteBtn').addEventListener('click', async () => {
    const prompt = $('aiPrompt').value.trim();
    const category = $('websiteCategory').value;
    const button = $('generateWebsiteBtn');
    const message = $('aiMessage');

    if (!prompt) {
      message.textContent = 'Please describe your business first.';
      return;
    }

    button.disabled = true;
    message.textContent = '✦ Nova AI is creating your website...';

    try {
      const instruction = [
        'Create website content for a ' + category + ' business.',
        'Business description: ' + prompt,
        '',
        'Return ONLY valid JSON. No Markdown or code fences.',
        'Use exactly these keys: title, tagline, description, cta, about, services.',
        'Services must be an array of objects with title and description.',
        'Escape double quotes inside strings.',
        'Do not put literal line breaks inside JSON string values.',
        'Do not use trailing commas. Return valid JSON only.'
      ].join('\n');

      async function requestAI(content) {
        const response = await fetch(BUILDER_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: content }]
          })
        });

        let result;
        try {
          result = await response.json();
        } catch {
          throw new Error('Invalid response from AI server.');
        }

        if (!response.ok) {
          throw new Error(result.error || 'AI server error (' + response.status + ')');
        }

        if (!result.reply || typeof result.reply !== 'string') {
          throw new Error('AI did not return a valid reply.');
        }

        return result.reply;
      }

      function parseWebsiteReply(reply) {
        const fence = String.fromCharCode(96).repeat(3);
        let jsonText = reply.trim();

        if (jsonText.startsWith(fence)) {
          jsonText = jsonText.slice(fence.length);
          if (jsonText.toLowerCase().startsWith('json')) {
            jsonText = jsonText.slice(4);
          }
          const closingFence = jsonText.lastIndexOf(fence);
          if (closingFence >= 0) jsonText = jsonText.slice(0, closingFence);
        }

        const firstBrace = jsonText.indexOf('{');
        const lastBrace = jsonText.lastIndexOf('}');

        if (firstBrace < 0 || lastBrace <= firstBrace) {
          throw new Error('AI response mein JSON nahi mila.');
        }

        const data = JSON.parse(jsonText.slice(firstBrace, lastBrace + 1));

        if (!data || typeof data !== 'object' || Array.isArray(data)) {
          throw new Error('AI returned invalid website data.');
        }

        return data;
      }

      let aiReply = await requestAI(instruction);
      let websiteData;

      try {
        websiteData = parseWebsiteReply(aiReply);
      } catch {
        message.textContent = '✦ Fixing AI response format...';

        const repairPrompt = [
          'Convert this response into valid JSON only.',
          'No Markdown or code fences.',
          'Preserve the business content.',
          'Required keys: title, tagline, description, cta, about, services.',
          'Services must be an array of objects with title and description.',
          'Escape quotes and do not use trailing commas.',
          '',
          'Response to repair:',
          aiReply
        ].join('\n');

        const repairedReply = await requestAI(repairPrompt);
        websiteData = parseWebsiteReply(repairedReply);
      }

      renderGeneratedWebsite(websiteData);
      message.textContent = '';
    } catch (error) {
      console.error('Nova AI Website Generator:', error);
      message.textContent = error.message || 'Website generation failed. Please try again.';
    } finally {
      button.disabled = false;
    }
  });

  document.querySelectorAll('.template-card').forEach(card => {
    card.addEventListener('click', () => {
      $('templateMessage').textContent =
        card.dataset.template + ' selected. Template loading will be implemented next.';
    });
  });

  const previewBtn = $('previewBtn');
  const exitPreviewBtn = $('exitPreviewBtn');

  function enterPreview() {
    document.body.classList.add('builder-preview-mode');
    previewBtn.hidden = true;
    exitPreviewBtn.hidden = false;
    if (selected) selected.classList.remove('builder-selected');
    selected = null;
    $('propertyEditor').hidden = true;
    $('propertyEmpty').hidden = false;
    toast('Preview mode enabled');
  }

  function exitPreview() {
    document.body.classList.remove('builder-preview-mode');
    previewBtn.hidden = false;
    exitPreviewBtn.hidden = true;
    toast('Back to editor');
  }

  previewBtn.addEventListener('click', enterPreview);
  exitPreviewBtn.addEventListener('click', exitPreview);

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && document.body.classList.contains('builder-preview-mode')) {
      exitPreview();
    }
  });

  $('publishBtn').addEventListener('click', () => {
    toast('Publishing will be enabled after domain and hosting setup.');
  });

  $('seoBtn').addEventListener('click', () => {
    toast('SEO settings panel is coming next.');
  });

  $('pageSelector').addEventListener('change', e => {
    toast(e.target.value + ' page selected.');
  });

  $('elementName').addEventListener('change', e => {
    if (selected) selected.dataset.elementName = e.target.value;
  });

  // Save a local draft. This is browser-local, not cloud publishing.
  function saveDraft() {
    try {
      localStorage.setItem('nova_website_builder_draft_v1', canvas.innerHTML);
      $('saveStatus').textContent = '● Saved locally';
      toast('Draft saved on this device');
    } catch {
      toast('Could not save draft in this browser');
    }
  }

  const saved = localStorage.getItem('nova_website_builder_draft_v1');
  if (saved) {
    canvas.innerHTML = saved;
  }

  $('saveStatus').addEventListener('click', saveDraft);
  $('saveStatus').style.cursor = 'pointer';

  history.push(canvas.innerHTML);
  historyIndex = 0;
})();
