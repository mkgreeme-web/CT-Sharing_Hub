const gallery = document.querySelector('#toolGallery');
const filters = document.querySelector('#toolFilters');
let registry = { categories: [], tools: [] };
let activeFilter = 'all';

async function loadRegistry() {
  if (window.location.protocol === 'file:') {
    loadFallbackRegistry();
    return;
  }

  try {
    const response = await fetch('tools.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    validateRegistry(data);
    registry = data;
    renderFilters();
    renderTools();
  } catch (error) {
    console.error('tools.json을 불러오지 못했습니다.', error);
    gallery.replaceChildren(createMessage(
      '도구 목록을 불러오지 못했습니다. tools.json 형식과 파일 경로를 확인해 주세요.',
      'error'
    ));
  }
}

function loadFallbackRegistry() {
  try {
    const fallback = document.querySelector('#fallbackRegistry');
    if (!fallback) throw new Error('기본 도구 등록부가 없습니다.');

    const data = JSON.parse(fallback.textContent);
    validateRegistry(data);
    registry = data;
    renderFilters();
    renderTools();
  } catch (error) {
    console.error('기본 도구 등록부를 불러오지 못했습니다.', error);
    gallery.replaceChildren(createMessage(
      '기본 도구 목록을 불러오지 못했습니다. 패키지를 다시 내려받아 주세요.',
      'error'
    ));
  }
}

function validateRegistry(data) {
  if (!data || !Array.isArray(data.tools)) throw new Error('tools 배열이 없습니다.');

  const ids = new Set();
  data.tools.forEach((tool, index) => {
    const required = ['id', 'title', 'description', 'category', 'html', 'image'];
    required.forEach((key) => {
      if (typeof tool[key] !== 'string' || !tool[key].trim()) {
        throw new Error(`${index + 1}번 도구의 ${key} 값이 올바르지 않습니다.`);
      }
    });
    if (ids.has(tool.id)) throw new Error(`중복 id: ${tool.id}`);
    ids.add(tool.id);
    if (!isSafeLocalPath(tool.html) || !isSafeLocalPath(tool.image)) {
      throw new Error(`${tool.id}의 파일 경로는 저장소 내부 상대경로여야 합니다.`);
    }
  });
}

function isSafeLocalPath(path) {
  return !path.startsWith('/') && !path.includes('..') && !/^[a-z]+:/i.test(path);
}

function renderFilters() {
  const allButton = filters.querySelector('[data-filter="all"]');
  filters.replaceChildren(allButton);

  const usedCategories = new Set(
    registry.tools.filter((tool) => tool.enabled !== false).map((tool) => tool.category)
  );

  (registry.categories || []).forEach((category) => {
    if (!usedCategories.has(category.id)) return;
    const button = document.createElement('button');
    button.className = 'filter';
    button.type = 'button';
    button.dataset.filter = category.id;
    button.textContent = category.name;
    filters.append(button);
  });

  filters.addEventListener('click', onFilterClick);
}

function onFilterClick(event) {
  const button = event.target.closest('[data-filter]');
  if (!button) return;
  activeFilter = button.dataset.filter;
  filters.querySelector('.active')?.classList.remove('active');
  button.classList.add('active');
  renderTools();
}

function renderTools() {
  const visibleTools = registry.tools.filter((tool) =>
    tool.enabled !== false && (activeFilter === 'all' || tool.category === activeFilter)
  );

  if (!visibleTools.length) {
    gallery.replaceChildren(createMessage('이 분류에 등록된 도구가 없습니다.', 'empty'));
    return;
  }

  const fragment = document.createDocumentFragment();
  visibleTools
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
    .forEach((tool, index) => fragment.append(createToolCard(tool, index)));
  gallery.replaceChildren(fragment);
}

function createToolCard(tool, index) {
  const card = element('article', 'card');
  card.tabIndex = 0;
  card.dataset.tool = tool.html;
  card.setAttribute('aria-label', `${tool.title} 도구 실행`);

  const thumb = element('div', 'thumb');
  const image = document.createElement('img');
  image.src = tool.image;
  image.alt = tool.imageAlt || `${tool.title} 도구 미리보기`;
  image.loading = 'lazy';
  image.addEventListener('error', () => thumb.classList.add('image-error'));
  thumb.append(image, textElement('span', 'number', String(index + 1).padStart(2, '0')));

  const body = element('div', 'card-body');
  const meta = element('div', 'meta');
  meta.append(
    textElement('span', `badge ${safeColor(tool.badgeColor)}`, tool.badge || '코칭'),
    textElement('span', 'status', tool.status || '바로 사용')
  );

  const tags = element('div', 'tags');
  (tool.tags || []).forEach((tag) => tags.append(textElement('span', '', tag)));

  const actions = element('div', 'actions');
  const openLink = textElement('a', '', '도구 실행 ↗');
  openLink.href = tool.html;
  openLink.target = '_blank';
  openLink.rel = 'noopener noreferrer';

  const downloadButton = textElement('button', '', 'HTML 다운로드 ↓');
  downloadButton.type = 'button';
  downloadButton.addEventListener('click', () => downloadTool(tool));
  actions.append(openLink, downloadButton);

  body.append(meta, textElement('h2', '', tool.title), textElement('p', '', tool.description), tags, actions);
  card.append(thumb, body);

  card.addEventListener('click', (event) => {
    if (!event.target.closest('a, button')) openTool(tool.html);
  });
  card.addEventListener('keydown', (event) => {
    if ((event.key === 'Enter' || event.key === ' ') && !event.target.closest('a, button')) {
      event.preventDefault();
      openTool(tool.html);
    }
  });
  return card;
}

function element(tagName, className) {
  const node = document.createElement(tagName);
  if (className) node.className = className;
  return node;
}

function textElement(tagName, className, text) {
  const node = element(tagName, className);
  node.textContent = text;
  return node;
}

function createMessage(message, type) {
  return textElement('div', `gallery-message ${type}`, message);
}

function safeColor(color) {
  const allowed = ['purple', 'blue', 'green', 'orange', 'red', 'yellow'];
  return allowed.includes(color) ? color : 'blue';
}

function openTool(path) {
  window.open(path, '_blank', 'noopener,noreferrer');
}

async function downloadTool(tool) {
  if (window.location.protocol === 'file:') {
    const link = document.createElement('a');
    link.href = tool.html;
    link.download = tool.downloadName || `${tool.title}.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast(`${link.download} 다운로드를 시작했습니다.`);
    return;
  }

  try {
    const response = await fetch(tool.html, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = new Blob([await response.text()], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = tool.downloadName || `${tool.title}.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 500);
    showToast(`${link.download} 다운로드를 시작했습니다.`);
  } catch (error) {
    console.error('HTML 다운로드 실패', error);
    showToast('다운로드하지 못했습니다. 파일 경로를 확인해 주세요.');
  }
}

function showToast(message) {
  const toast = document.querySelector('.toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

loadRegistry();
