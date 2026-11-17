const $ = (selector) => document.querySelector(selector);
let generatedStrategy = '';

async function request(path, body) {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? '{}' : JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (HTTP ${response.status}).`);
  return data;
}

function showNotice(message, type = 'success') {
  const notice = $('#notice');
  notice.textContent = message;
  notice.className = `notice ${type}`;
  notice.hidden = false;
}

function setBusy(button, busy, label) {
  button.disabled = busy;
  if (busy) {
    button.dataset.originalLabel = button.textContent;
    button.textContent = label;
  } else if (button.dataset.originalLabel) {
    button.textContent = button.dataset.originalLabel;
    delete button.dataset.originalLabel;
  }
}

async function loadStatus() {
  const response = await fetch('/api/status');
  const status = await response.json();
  if (!response.ok) throw new Error(status.error || `Request failed (HTTP ${response.status}).`);
  $('#groq-status').textContent = status.groqConfigured
    ? `Ready · ${status.model}`
    : 'Groq API key is not configured';
  $('#groq-status').classList.toggle('ready', status.groqConfigured);
  $('#groq-detail').textContent = status.groqConfigured ? `Configured · ${status.model}` : 'Not configured';
  $('#jira-detail').textContent = status.jiraConfigured ? 'Configured' : 'Not configured';
  $('#jira-actions').hidden = !status.jiraConfigured;
}

$('#project-context').addEventListener('input', (event) => {
  $('#char-count').textContent = `${event.currentTarget.value.length} / 12000`;
});

$('#generate').addEventListener('click', async (event) => {
  const button = event.currentTarget;
  const projectName = $('#project-name').value.trim();
  const projectContext = $('#project-context').value.trim();
  $('#notice').hidden = true;
  if (!projectName || !projectContext) {
    showNotice('Enter a project name and some project information first.', 'error');
    return;
  }

  setBusy(button, true, 'Creating draft…');
  try {
    const data = await request('/api/generate', {
      projectName,
      applicationUrl: $('#application-url').value.trim(),
      projectContext,
    });
    generatedStrategy = data.strategy;
    $('#strategy').textContent = generatedStrategy;
    $('#results').hidden = false;
    $('#jira-created').textContent = '';
    showNotice('Strategy draft generated. Review assumptions, risks and proposed criteria.');
    $('#results').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (error) {
    showNotice(error.message, 'error');
  } finally {
    setBusy(button, false);
  }
});

$('#settings-toggle').addEventListener('click', (event) => {
  const isHidden = $('#settings').hidden;
  $('#settings').hidden = !isHidden;
  event.currentTarget.setAttribute('aria-expanded', String(isHidden));
});

$('#test-groq').addEventListener('click', async (event) => {
  const button = event.currentTarget;
  setBusy(button, true, 'Testing…');
  $('#groq-detail').textContent = 'Testing connection…';
  try {
    const data = await request('/api/groq/test');
    $('#groq-detail').textContent = data.message;
    $('#groq-detail').classList.add('ready');
  } catch (error) {
    $('#groq-detail').textContent = error.message;
    $('#groq-detail').classList.remove('ready');
  } finally {
    setBusy(button, false);
  }
});

$('#test-jira').addEventListener('click', async (event) => {
  const button = event.currentTarget;
  setBusy(button, true, 'Testing…');
  $('#jira-detail').textContent = 'Testing connection…';
  try {
    const data = await request('/api/jira/test');
    $('#jira-detail').textContent = data.message;
    $('#jira-detail').classList.add('ready');
  } catch (error) {
    $('#jira-detail').textContent = error.message;
    $('#jira-detail').classList.remove('ready');
  } finally {
    setBusy(button, false);
  }
});

$('#copy').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(generatedStrategy);
    showNotice('Strategy copied to the clipboard.');
  } catch {
    showNotice('Clipboard access is unavailable in this browser. Use Download .md instead.', 'error');
  }
});

$('#download').addEventListener('click', () => {
  const blob = new Blob([generatedStrategy], { type: 'text/markdown;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'test-strategy.md';
  link.click();
  URL.revokeObjectURL(link.href);
});

$('#create-jira').addEventListener('click', async (event) => {
  const projectKey = $('#jira-project').value.trim().toUpperCase();
  const tasks = $('#jira-tasks').value.split(/\r?\n/).map((task) => task.trim()).filter(Boolean);
  if (!/^[A-Z][A-Z0-9_]{1,9}$/.test(projectKey) || tasks.length === 0) {
    showNotice('Enter a Jira project key and at least one reviewed task summary.', 'error');
    $('#jira-actions').open = true;
    $('#jira-project').focus();
    return;
  }
  if (tasks.length > 10 || tasks.some((task) => task.length > 250)) {
    showNotice('Enter up to 10 task summaries, each no longer than 250 characters.', 'error');
    return;
  }
  if (!window.confirm(`Create ${tasks.length} reviewed Jira task(s) in ${projectKey}?`)) return;

  const button = event.currentTarget;
  setBusy(button, true, 'Creating…');
  try {
    const data = await request('/api/jira/create', { projectKey, tasks });
    $('#jira-created').textContent = `Created ${data.created.length} issue(s): ${data.created.map((issue) => issue.key).join(', ')}`;
  } catch (error) {
    $('#jira-created').textContent = error.message;
  } finally {
    setBusy(button, false);
  }
});

loadStatus().catch((error) => {
  $('#groq-status').textContent = 'Could not reach the local app server';
  $('#groq-status').classList.add('error');
  showNotice(error.message, 'error');
});
