(() => {
  const $ = s => document.querySelector(s);

  const messages = $('#messages');
  const input = $('#chatInput');
  const form = $('#chatForm');
  const historyList = $('#historyList');
  const historySearch = $('#historySearch');
  const sidebar = $('#sidebar');
  const workspace = $('.ai-workspace');
  const sendButton = $('#sendButton');

  const API_URL = 'https://nova-business-ai.banie9699.workers.dev/';
  const STORAGE_KEY = 'nova_business_ai_history_v2';

  if (!messages || !input || !form || !historyList) {
    console.error('Nova AI: Required HTML elements missing.');
    return;
  }

  const welcomeTemplate = $('#welcomeScreen').cloneNode(true);

  let conversations = [];
  let activeId = null;
  let isSending = false;

  const makeId = () =>
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        conversations,
        activeId
      }));
    } catch (error) {
      console.error('History save error:', error);
    }
  }

  function load() {
    try {
      const data = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || '{}'
      );

      if (Array.isArray(data.conversations)) {
        conversations = data.conversations.filter(c =>
          c &&
          typeof c.id === 'string' &&
          Array.isArray(c.messages)
        );
      }

      activeId = data.activeId || null;
    } catch (error) {
      conversations = [];
      activeId = null;
    }
  }

  function current() {
    return conversations.find(c => c.id === activeId);
  }

  function getChat(id) {
    return conversations.find(c => c.id === id);
  }

  function newChat() {
    const chat = {
      id: makeId(),
      title: 'New conversation',
      createdAt: new Date().toISOString(),
      messages: []
    };

    conversations.unshift(chat);
    activeId = chat.id;

    save();
    render();
    renderHistory();
    closeHistoryOnMobile();
  }

  function addMessage(role, text, chatId = activeId) {
    const chat = getChat(chatId);
    if (!chat) return;

    chat.messages.push({
      role,
      text,
      createdAt: new Date().toISOString()
    });

    if (role === 'user' && chat.title === 'New conversation') {
      chat.title = text.slice(0, 36) +
        (text.length > 36 ? '…' : '');
    }

    save();

    if (activeId === chatId) render();
    renderHistory();
  }

  function messageElement(role, text) {
    const row = document.createElement('div');
    row.className = 'message-row ' + role;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = role === 'user' ? 'U' : 'N';

    const content = document.createElement('div');
    content.className = 'message-content';

    const author = document.createElement('div');
    author.className = 'message-author';
    author.textContent = role === 'user' ? 'You' : 'Nova AI';

    const body = document.createElement('div');
    body.className = 'message-text';
    body.textContent = text;

    content.append(author, body);
    row.append(avatar, content);

    messages.append(row);
  }

  function showTyping() {
    removeTyping();

    const row = document.createElement('div');
    row.className = 'message-row assistant typing-row';
    row.id = 'novaTyping';

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = 'N';

    const content = document.createElement('div');
    content.className = 'message-content';

    const author = document.createElement('div');
    author.className = 'message-author';
    author.textContent = 'Nova AI';

    const dots = document.createElement('div');
    dots.className = 'message-text typing-indicator';
    dots.textContent = 'Nova AI is thinking...';

    content.append(author, dots);
    row.append(avatar, content);
    messages.append(row);

    messages.scrollTop = messages.scrollHeight;
  }

  function removeTyping() {
    $('#novaTyping')?.remove();
  }

  function render() {
    messages.replaceChildren();

    const chat = current();

    if (!chat || !chat.messages.length) {
      const welcome = welcomeTemplate.cloneNode(true);
      welcome.id = 'welcomeScreen';
      messages.append(welcome);

      welcome.querySelectorAll('[data-prompt]').forEach(btn => {
        btn.addEventListener('click', () => {
          send(btn.dataset.prompt);
        });
      });

      attachTilt();
      return;
    }

    chat.messages.forEach(m => {
      messageElement(m.role, m.text);
    });

    messages.scrollTop = messages.scrollHeight;
  }

  function renderHistory() {
    historyList.replaceChildren();

    const term = (historySearch?.value || '')
      .toLowerCase()
      .trim();

    const filtered = conversations.filter(c =>
      (c.title || '').toLowerCase().includes(term)
    );

    if (!filtered.length) {
      const empty = document.createElement('p');
      empty.className = 'empty-history';
      empty.textContent = term
        ? 'No matching conversations.'
        : 'Your conversations will appear here.';

      historyList.append(empty);
      return;
    }

    filtered.forEach(chat => {
      const entry = document.createElement('div');
      entry.className = 'history-entry';

      const open = document.createElement('button');
      open.type = 'button';
      open.className = 'history-item' +
        (chat.id === activeId ? ' active' : '');

      open.textContent = chat.title || 'New conversation';
      open.title = chat.title || 'New conversation';

      open.addEventListener('click', () => {
        activeId = chat.id;
        save();
        render();
        renderHistory();
        closeHistoryOnMobile();
      });

      const rename = document.createElement('button');
      rename.type = 'button';
      rename.className = 'history-action';
      rename.textContent = '✎';
      rename.title = 'Rename conversation';

      rename.addEventListener('click', () => {
        const name = prompt(
          'Enter a new conversation name:',
          chat.title
        );

        if (name && name.trim()) {
          chat.title = name.trim().slice(0, 60);
          save();
          renderHistory();
        }
      });

      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'history-action history-delete';
      del.textContent = '×';
      del.title = 'Delete conversation';

      del.addEventListener('click', () => {
        if (!confirm('Delete this conversation?')) return;

        conversations = conversations.filter(c => c.id !== chat.id);

        if (activeId === chat.id) {
          activeId = conversations[0]?.id || null;
        }

        if (!activeId) {
          newChat();
          return;
        }

        save();
        render();
        renderHistory();
      });

      entry.append(open, rename, del);
      historyList.append(entry);
    });
  }

  async function getAIReply(chatId) {
    const chat = getChat(chatId);
    if (!chat) throw new Error('Conversation not found.');

    const apiMessages = chat.messages
      .slice(-12)
      .map(message => ({
        role: message.role,
        content: message.text
      }));

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: apiMessages
      })
    });

    let data;

    try {
      data = await response.json();
    } catch {
      throw new Error('Invalid response received from AI server.');
    }

    if (!response.ok) {
      throw new Error(
        data.error || `AI server error (${response.status})`
      );
    }

    if (!data.reply || typeof data.reply !== 'string') {
      throw new Error('AI did not return a valid reply.');
    }

    return data.reply;
  }

  async function send(value) {
    const text = (value || '').trim();

    if (!text || isSending) return;

    if (!current()) newChat();

    const chatId = activeId;

    isSending = true;

    if (sendButton) sendButton.disabled = true;

    input.value = '';
    input.style.height = 'auto';

    addMessage('user', text, chatId);

    if (activeId === chatId) showTyping();

    updateStatus('Connecting...');

    try {
      const reply = await getAIReply(chatId);

      removeTyping();
      addMessage('assistant', reply, chatId);

      updateStatus('AI Online');

    } catch (error) {
      console.error('Nova AI request failed:', error);

      removeTyping();

      addMessage(
        'assistant',
        'Sorry, Nova AI could not complete your request.\n\n' +
        error.message +
        '\n\nPlease try again in a moment.',
        chatId
      );

      updateStatus('Connection Error');

    } finally {
      isSending = false;

      if (sendButton) sendButton.disabled = false;

      input.focus();
    }
  }

  function updateStatus(status) {
    const statusElement = $('.ai-status');

    if (statusElement) {
      statusElement.textContent = status;
      statusElement.classList.toggle(
        'ai-status-error',
        status === 'Connection Error'
      );
    }

    const hint = $('.composer-bottom span');

    if (hint) {
      hint.textContent =
        status === 'AI Online'
          ? 'Nova AI is ready.'
          : status === 'Connecting...'
            ? 'Nova AI is thinking...'
            : status === 'Connection Error'
              ? 'Check your connection and try again.'
              : 'AI-powered business assistant.';
    }
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    send(input.value);
  });

  input.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height =
      Math.min(input.scrollHeight, 120) + 'px';
  });

  $('#newChat')?.addEventListener('click', newChat);

  $('#clearChat')?.addEventListener('click', () => {
    const chat = current();
    if (!chat) return;

    chat.messages = [];
    chat.title = 'New conversation';

    save();
    render();
    renderHistory();
  });

  $('#clearHistory')?.addEventListener('click', () => {
    if (!confirm('Delete ALL saved conversations?')) return;

    conversations = [];
    activeId = null;
    newChat();
  });

  historySearch?.addEventListener('input', renderHistory);

  $('#historyToggle')?.addEventListener('click', () => {
    workspace?.classList.toggle('history-open');
  });

  function closeHistoryOnMobile() {
    if (window.innerWidth <= 700) {
      workspace?.classList.remove('history-open');
    }
  }

  $('#menuToggle')?.addEventListener('click', () => {
    sidebar?.classList.toggle('open');
  });

  document.addEventListener('click', event => {
    const menu = $('#menuToggle');

    if (
      window.innerWidth <= 700 &&
      sidebar?.classList.contains('open') &&
      !sidebar.contains(event.target) &&
      !menu?.contains(event.target)
    ) {
      sidebar.classList.remove('open');
    }
  });

  function attachTilt() {
    messages.querySelectorAll('.prompt-card').forEach(card => {
      if (card.dataset.tiltReady) return;

      card.dataset.tiltReady = '1';

      card.addEventListener('pointermove', event => {
        const rect = card.getBoundingClientRect();

        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;

        card.style.transform =
          `perspective(800px) rotateX(${(0.5-y)*12}deg) rotateY(${(x-0.5)*12}deg) translateY(-5px)`;
      });

      card.addEventListener('pointerleave', () => {
        card.style.transform = '';
      });

      card.addEventListener('touchstart', () => {
        card.classList.add('touch-active');
      }, { passive: true });

      card.addEventListener('touchend', () => {
        setTimeout(() => {
          card.classList.remove('touch-active');
        }, 250);
      }, { passive: true });
    });
  }

  const observer = new MutationObserver(attachTilt);

  observer.observe(messages, {
    childList: true,
    subtree: true
  });

  load();

  if (!conversations.some(c => c.id === activeId)) {
    activeId = conversations[0]?.id || null;
  }

  if (!conversations.length) {
    newChat();
  } else {
    render();
    renderHistory();
  }

  updateStatus('AI Online');
})();
