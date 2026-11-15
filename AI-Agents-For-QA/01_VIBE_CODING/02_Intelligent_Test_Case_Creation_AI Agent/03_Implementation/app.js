const $ = (selector) => document.querySelector(selector);
const requirements = $('#requirements');
const casesBody = $('#cases');
let generated = [];

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

function addCell(row, value) {
  const cell = document.createElement('td');
  cell.textContent = value || '—';
  row.append(cell);
}

function render(data) {
  generated = data.testCases;
  casesBody.replaceChildren();
  for (const item of generated) {
    const row = document.createElement('tr');
    [
      item.id, item.requirementReference, item.summary, item.preconditions,
      item.testData, item.steps.map((step, index) => `${index + 1}. ${step}`).join('\n'),
      item.expectedResult, item.priority, item.testType, 'Not Run',
    ].forEach((value) => addCell(row, value));
    casesBody.append(row);
  }
  $('#coverage').textContent = data.coverageSummary || `${generated.length} test case(s) generated.`;
  const ambiguities = $('#ambiguities');
  const list = $('#ambiguity-list');
  list.replaceChildren();
  for (const text of data.ambiguities || []) {
    const item = document.createElement('li');
    item.textContent = text;
    list.append(item);
  }
  ambiguities.hidden = !list.childElementCount;
  $('#results').hidden = false;
  $('#jira-created').textContent = '';
}

function csvEscape(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

function toCsv(items) {
  const headers = ['Test Case ID', 'Requirement / Acceptance Criteria Reference', 'Summary', 'Preconditions', 'Test Data', 'Steps', 'Expected Result', 'Priority', 'Test Type', 'Status'];
  const rows = items.map((item) => [
    item.id, item.requirementReference, item.summary, item.preconditions, item.testData,
    item.steps.map((step, index) => `${index + 1}. ${step}`).join('\n'),
    item.expectedResult, item.priority, item.testType, 'Not Run',
  ]);
  return [headers, ...rows].map((row) => row.map(csvEscape).join(',')).join('\r\n');
}

async function loadStatus() {
  const status = await fetch('/api/status').then((response) => response.json());
  $('#groq-status').textContent = status.groqConfigured ? `Ready · ${status.model}` : 'Groq API key not configured';
  $('#groq-status').classList.toggle('ready', status.groqConfigured);
  $('#groq-detail').textContent = status.groqConfigured ? `Configured · ${status.model}` : 'Add GROQ_API_KEY to AI-Agents-For-QA/.env';
  $('#jira-detail').textContent = status.jiraConfigured ? 'Configured in AI-Agents-For-QA/.env' : 'Not configured';
  $('#create-jira').hidden = !status.jiraConfigured;
}

requirements.addEventListener('input', () => {
  $('#char-count').textContent = `${requirements.value.length} / 5000`;
});

$('#generate').addEventListener('click', async (event) => {
  const button = event.currentTarget;
  $('#notice').hidden = true;
  if (!requirements.value.trim()) {
    showNotice('Add a requirement or user story first.', 'error');
    requirements.focus();
    return;
  }
  setBusy(button, true, 'Generating…');
  try {
    const data = await request('/api/generate', {
      requirements: requirements.value,
      testType: $('#test-type').value,
      priority: $('#priority').value,
      count: Number($('#case-count').value),
    });
    render(data);
    const requested = Number($('#case-count').value);
    const sourceLabel = data.source ? ` from Jira ${data.source.key}` : '';
    showNotice(generated.length < requested
      ? `Generated ${generated.length} supported case(s)${sourceLabel}; fewer than requested to avoid unsupported scenarios.`
      : `Test cases generated${sourceLabel}. Review them before use.`);
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

$('#copy').addEventListener('click', async (event) => {
  try {
    await navigator.clipboard.writeText(toCsv(generated));
    showNotice('Test cases copied to the clipboard.');
  } catch {
    showNotice('Clipboard access is unavailable in this browser. Use Download CSV instead.', 'error');
  }
});

$('#download').addEventListener('click', () => {
  const blob = new Blob([toCsv(generated)], { type: 'text/csv;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'test-cases.csv';
  link.click();
  URL.revokeObjectURL(link.href);
});

$('#create-jira').addEventListener('click', async (event) => {
  const projectKey = $('#jira-project').value.trim().toUpperCase();
  if (!/^[A-Z][A-Z0-9_]{1,9}$/.test(projectKey)) {
    showNotice('Enter a valid Jira project key in Settings first.', 'error');
    $('#settings').hidden = false;
    $('#settings-toggle').setAttribute('aria-expanded', 'true');
    $('#jira-project').focus();
    return;
  }
  if (!window.confirm(`Create ${generated.length} Jira Task issue(s) in ${projectKey}?`)) return;
  const button = event.currentTarget;
  setBusy(button, true, 'Creating…');
  try {
    const data = await request('/api/jira/create', { projectKey, testCases: generated });
    $('#jira-created').textContent = `Created ${data.created.length} issue(s): ${data.created.map((issue) => issue.key).join(', ')}`;
    showNotice('Jira issues created successfully.');
  } catch (error) {
    showNotice(error.message, 'error');
  } finally {
    setBusy(button, false);
  }
});

loadStatus().catch((error) => {
  $('#groq-status').textContent = 'Could not reach local app server';
  $('#groq-status').classList.add('error');
  showNotice(error.message, 'error');
});
