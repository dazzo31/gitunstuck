import knowledge from './knowledge.mjs';
import { validateKnowledge } from './schema.mjs';
import { matchesFilters } from './filter.mjs';
import { textElement } from './dom.mjs';
import { formatSnippet } from './shell-format.mjs';
(() => {
'use strict';
validateKnowledge(knowledge);
window.GitUnstuckKnowledge = knowledge;
const {undoSolutions,graphScenarios,pipelineConfigs,commands,workflows}=knowledge;
// Storage Safety Helpers (with strict value validation)
    function safeStorageGet(key, defaultVal, allowedValues) {
      try {
        const val = localStorage.getItem(`gitunstuck.${key}`) ?? localStorage.getItem(key);
        if (allowedValues && !allowedValues.includes(val)) {
          return defaultVal;
        }
        return val !== null ? val : defaultVal;
      } catch (e) {
        return defaultVal;
      }
    }

    function safeStorageSet(key, val) {
      try {
        localStorage.setItem(`gitunstuck.${key}`, val);
      } catch (e) {
        // Silently ignore storage errors
      }
    }

    function announceState(message) {
      const announcer = document.getElementById('liveAnnouncer');
      if (announcer) {
        announcer.textContent = '';
        setTimeout(() => { announcer.textContent = message; }, 50);
      }
    }

    // DOM Elements
    const htmlElem = document.documentElement;
    const themeToggleBtn = document.getElementById('themeToggle');
    const modeButtons = document.querySelectorAll('.mode-btn');
    const filterPills = document.querySelectorAll('.filter-pill');
    const riskPills = document.querySelectorAll('.risk-pill');
    const searchInput = document.getElementById('searchInput');
    const searchFeedbackElem = document.getElementById('searchFeedback');
    const searchFeedbackTextElem = document.getElementById('searchFeedbackText');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const cards = document.querySelectorAll('.card');
    const noResultsElem = document.getElementById('noResults');
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');
    const taskChips = document.querySelectorAll('.task-chip');
    const treeChoiceBtns = document.querySelectorAll('.tree-choice-btn');
    const treeSolutionPanel = document.getElementById('treeSolutionPanel');
    const graphTabBtns = document.querySelectorAll('.graph-tab-btn');
    const graphSvgContainer = document.getElementById('graphSvgContainer');
    const graphExplanationPanel = document.getElementById('graphExplanationPanel');

    // 1. Theme Management
    const sunIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>`;

    const moonIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>`;

    function applyTheme(theme) {
      if (theme !== 'dark' && theme !== 'light') theme = 'dark';
      htmlElem.setAttribute('data-theme', theme);
      safeStorageSet('theme', theme);
      if (themeToggleBtn) {
        themeToggleBtn.innerHTML = theme === 'dark' ? sunIcon : moonIcon;
        themeToggleBtn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
      }
    }

    const systemPrefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    const initialTheme = safeStorageGet('theme', systemPrefersLight ? 'light' : 'dark', ['light', 'dark']);
    applyTheme(initialTheme);

    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        const current = htmlElem.getAttribute('data-theme') || 'dark';
        const nextTheme = current === 'dark' ? 'light' : 'dark';
        applyTheme(nextTheme);
        announceState(`Theme switched to ${nextTheme} mode`);
      });
    }

    // 2. Interactive Undo Decision Tree Logic
    function renderUndoSolution(locationKey) {
      const data = undoSolutions[locationKey];
      if (!data || !treeSolutionPanel) return;
      const element = (tag, className, text) => textElement(document, tag, className, text);
      const top = element('div', 'solution-top');
      top.append(element('h3', 'solution-title', data.title));
      const badges = element('div');
      badges.append(element('span', 'badge badge-scope', `Scope: ${data.scope}`));
      badges.append(element('span', 'badge badge-risk-caution', data.riskBadge.replace(/<[^>]*>/g, '')));
      top.append(badges);
      const snippet = element('div', 'snippet-block');
      const header = element('div', 'snippet-header');
      const button = element('button', 'copy-btn', 'Copy');
      button.type = 'button';
      button.setAttribute('aria-label', 'Copy snippet to clipboard');
      if (['unstaged', 'local-commit'].includes(locationKey)) { button.disabled = true; button.title = 'Choose a verified individual action in the guided recovery flow; mixed destructive recipes are not one-click copied.'; }
      button.addEventListener('click', () => copySnippet(button));
      header.append(element('span', '', 'Recommended Command'), button);
      const pre = element('pre', 'code-content');
      pre.tabIndex = 0;
      pre.setAttribute('aria-label', 'Code example');
      pre.append(element('code', '', formatSnippet(data.code, getShell())));
      snippet.append(header, pre);
      treeSolutionPanel.replaceChildren(top, element('p', '', data.desc), snippet,
        element('div', 'card-effect', `What happens: ${data.effect}`),
        element('div', 'card-verify', `Verify result: ${data.verify}`),
        element('div', 'callout warning', data.warning));
    }

    treeChoiceBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        treeChoiceBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-checked', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-checked', 'true');
        const loc = btn.getAttribute('data-location');
        renderUndoSolution(loc);
        announceState(`Decision tree updated for ${btn.querySelector('.choice-label')?.innerText || loc}`);
      });
    });

    // Render initial decision tree solution
    renderUndoSolution('unstaged');

    // 2b. Visual Commit Timeline & Branch Map Logic
    function renderGraphScenario(key) {
      const data = graphScenarios[key];
      if (!data || !graphSvgContainer || !graphExplanationPanel) return;

      graphSvgContainer.innerHTML = data.svg;
      graphExplanationPanel.innerHTML = `
        <div class="graph-explanation-header">
          <span class="graph-scenario-name">${data.name}</span>
          <code class="graph-command-chip"></code>
        </div>
        <ul class="graph-details-list">
          ${data.bullets.map(b => `<li>${b}</li>`).join('')}
        </ul>
        <div class="callout tip" style="margin-top:12px;">
          <strong>Architectural Takeaway:</strong> ${data.rule}
        </div>
      `;
      graphExplanationPanel.querySelector('.graph-command-chip').textContent = formatSnippet(data.command, getShell());
    }

    graphTabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        graphTabBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-checked', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-checked', 'true');
        const sc = btn.getAttribute('data-scenario');
        renderGraphScenario(sc);
        announceState(`Commit graph updated to ${btn.innerText.trim()}`);
      });
    });

    // Render initial graph scenario
    renderGraphScenario('linear');

    // 3. Active Filter & Card Search Logic
    let activeFilter = 'all';
    let activeRiskFilter = 'all';

    function filterCards() {
      const query = (searchInput && searchInput.value ? searchInput.value : '').toLowerCase().trim();
      const queryTokens = query ? query.split(/\s+/).filter(Boolean) : [];
      let visibleCount = 0;

      if (queryTokens.length > 0 && document.getElementById?.('view-reference')?.hidden !== true) {
        document.body.classList.add('is-searching');
      } else {
        document.body.classList.remove('is-searching');
      }

      cards.forEach(card => {
        const category = card.getAttribute('data-category');
        const cardEffects = (card.getAttribute('data-effects') || '').split(' ');
        const keywords = (card.getAttribute('data-keywords') || '').toLowerCase();
        const title = card.querySelector('.card-title')?.textContent.toLowerCase() || '';
        const content = (card.textContent || '').toLowerCase();


        const cardSearchText = `${title} ${keywords} ${content}`;

        if (matchesFilters({ category, effects: cardEffects, text: cardSearchText }, { query, category: activeFilter, effect: activeRiskFilter })) {
          card.style.display = 'flex';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      if (noResultsElem) {
        noResultsElem.style.display = visibleCount === 0 ? 'block' : 'none';
      }

      if (searchFeedbackElem && searchFeedbackTextElem) {
        if (queryTokens.length > 0) {
          searchFeedbackElem.style.display = 'flex';
          searchFeedbackTextElem.textContent = `Showing ${visibleCount} module${visibleCount === 1 ? '' : 's'} matching "${searchInput.value.trim()}"`;
        } else {
          searchFeedbackElem.style.display = 'none';
        }
      }

      announceState(`Showing ${visibleCount} modules`);
    }

    // 4. View Switcher Logic (Beginner vs Pro with Auto-Filter Reset)
    function setMode(mode) {
      if (mode !== 'beginner' && mode !== 'pro') mode = 'beginner';
      htmlElem.setAttribute('data-view', mode);
      safeStorageSet('mode', mode);

      modeButtons.forEach(btn => {
        const isActive = btn.getAttribute('data-mode') === mode;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });


      filterCards();
      announceState(`Switched to ${mode === 'beginner' ? 'Plain English' : 'Developer Hub'} mode`);
    }

    modeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetMode = btn.getAttribute('data-mode');
        if (targetMode) setMode(targetMode);
      });
    });

    // 5. Category Filter Button Listeners
    filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        filterPills.forEach(p => {
          p.classList.remove('active');
          p.setAttribute('aria-pressed', 'false');
        });
        pill.classList.add('active');
        pill.setAttribute('aria-pressed', 'true');
        activeFilter = pill.getAttribute('data-filter') || 'all';
        filterCards();
      });
    });

    // 5b. Risk-Level Filter Button Listeners
    riskPills.forEach(pill => {
      pill.addEventListener('click', () => {
        riskPills.forEach(p => {
          p.classList.remove('active');
          p.setAttribute('aria-pressed', 'false');
        });
        pill.classList.add('active');
        pill.setAttribute('aria-pressed', 'true');
        activeRiskFilter = pill.getAttribute('data-risk-filter') || 'all';
        filterCards();
      });
    });

    // 6. Search Input Listeners with Keyboard Shortcuts (/ & Ctrl+K)
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        filterCards();
      });
    }

    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        if (searchInput) {
          searchInput.value = '';
          filterCards();
          searchInput.focus();
        }
      });
    }

    window.addEventListener('keydown', (e) => {
      const isInputFocused = document.activeElement && 
        (document.activeElement.tagName === 'INPUT' || 
         document.activeElement.tagName === 'TEXTAREA' || 
         document.activeElement.isContentEditable);

      // Focus search on '/' (when not typing in an input) or 'Ctrl+K' / 'Cmd+K' (globally)
      if ((e.key === '/' && !isInputFocused) || ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K'))) {
        e.preventDefault();
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      } else if (e.key === 'Escape' && document.activeElement === searchInput) {
        if (searchInput.value) {
          searchInput.value = '';
          filterCards();
        } else {
          searchInput.blur();
        }
      }
    });

    if (resetFiltersBtn) {
      resetFiltersBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        activeFilter = 'all';
        activeRiskFilter = 'all';
        filterPills.forEach(pill => {
          const isAll = pill.getAttribute('data-filter') === 'all';
          pill.classList.toggle('active', isAll);
          pill.setAttribute('aria-pressed', isAll ? 'true' : 'false');
        });
        riskPills.forEach(pill => {
          const isAll = pill.getAttribute('data-risk-filter') === 'all';
          pill.classList.toggle('active', isAll);
          pill.setAttribute('aria-pressed', isAll ? 'true' : 'false');
        });
        filterCards();
        if (searchInput) searchInput.focus();
      });
    }

    // 7. Task-Navigator Quick-Jump Handler
    taskChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const targetId = chip.getAttribute('data-target');
        const targetElem = document.getElementById(targetId);
        if (!targetElem) return;

        // Reset search query and filters to ensure target is visible
        if (searchInput) searchInput.value = '';
        activeFilter = 'all';
        activeRiskFilter = 'all';
        filterPills.forEach(p => {
          const isAll = p.getAttribute('data-filter') === 'all';
          p.classList.toggle('active', isAll);
          p.setAttribute('aria-pressed', isAll ? 'true' : 'false');
        });
        riskPills.forEach(p => {
          const isAll = p.getAttribute('data-risk-filter') === 'all';
          p.classList.toggle('active', isAll);
          p.setAttribute('aria-pressed', isAll ? 'true' : 'false');
        });
        filterCards();

        // Scroll into view with smooth animation & visual highlight
        targetElem.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
        targetElem.classList.add('highlighted');
        announceState(`Jumped to ${targetElem.querySelector('h2')?.innerText || 'module'}`);
        setTimeout(() => { targetElem.classList.remove('highlighted'); }, 2200);
      });
    });

    // 8. Dependable Copy Snippet
    function copySnippet(btn) {
      const effects = btn.closest('.card')?.getAttribute('data-effects') || '';
      if (effects.includes('data-loss-potential') || effects.includes('history-rewrite')) { announceState('Choose a verified individual action; combined high-risk recipes are not copied as a script.'); return; }
      const codeElem = btn.closest('.snippet-block')?.querySelector('pre.code-content code') ||
                       btn.closest('.snippet-block')?.querySelector('pre.code-content');
      if (!codeElem) return;
      const textToCopy = codeElem.innerText.trim();

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          setCopyButtonFeedback(btn, 'Copied!', true);
          announceState('Command snippet copied to clipboard');
        }).catch(() => {
          fallbackCopyText(textToCopy, btn);
        });
      } else {
        fallbackCopyText(textToCopy, btn);
      }
    }

    function fallbackCopyText(text, btn) {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        if (success) {
          setCopyButtonFeedback(btn, 'Copied!', true);
          announceState('Command snippet copied to clipboard');
        } else {
          setCopyButtonFeedback(btn, 'Copy failed', false);
          announceState('Copy operation failed');
        }
      } catch (err) {
        setCopyButtonFeedback(btn, 'Copy failed', false);
        announceState('Copy operation failed');
      }
    }

    function setCopyButtonFeedback(btn, text, isSuccess) {
      btn.innerText = text;
      btn.classList.toggle('copied', isSuccess);
      btn.classList.toggle('copy-error', !isSuccess);
      btn.setAttribute('aria-label', text);
      setTimeout(() => {
        btn.innerText = 'Copy';
        btn.classList.remove('copied', 'copy-error');
        btn.setAttribute('aria-label', 'Copy snippet to clipboard');
      }, 2000);
    }

    // 8. CI/CD Multi-Host Provider Switcher in card-pipeline
    const pipelineTabBtns = document.querySelectorAll('.pipeline-tab-btn');
    const pipelineSnippetTitle = document.getElementById('pipelineSnippetTitle');
    const pipelineSnippetCode = document.getElementById('pipelineSnippetCode');

    pipelineTabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        pipelineTabBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        const provider = btn.getAttribute('data-provider');
        const config = pipelineConfigs[provider];
        if (config && pipelineSnippetTitle && pipelineSnippetCode) {
          pipelineSnippetTitle.textContent = config.title;
          pipelineSnippetCode.textContent = formatSnippet(config.code, getShell());
          announceState(`Pipeline configuration switched to ${config.title}`);
        }
      });
    });

    // Initialize Mode with Validated Storage Value
    const initialMode = safeStorageGet('mode', 'beginner', ['beginner', 'pro']);
    setMode(initialMode);
  
window.copySnippet = copySnippet;
window.GitUnstuck = { renderUndoSolution, setMode, filterCards, applyShell, setTheme: applyTheme };
function getShell() { return document.getElementById('shellSelect')?.value || 'powershell'; }
function applyShell(shell = getShell()) {
// Validate static fallback parity in CI; use canonical text at runtime.
for (const recipe of workflows) {
 const nodes=document.querySelectorAll('#'+recipe.id+' pre code');
 recipe.commands.forEach((id,index)=>{if(nodes[index]) nodes[index].textContent=formatSnippet(commands.find(c=>c.id===id).syntax, shell);});
}
const recovery = document.querySelector('.tree-choice-btn.active')?.getAttribute('data-location');
if (recovery) renderUndoSolution(recovery);
const graph = document.querySelector('.graph-tab-btn.active')?.getAttribute('data-scenario');
if (graph) renderGraphScenario(graph);
const provider = document.querySelector('.pipeline-tab-btn.active')?.getAttribute('data-provider');
if (provider && pipelineSnippetCode) pipelineSnippetCode.textContent = formatSnippet(pipelineConfigs[provider].code, shell);
}
applyShell();
document.querySelectorAll('.card[data-effects] .copy-btn').forEach(button => {
  const effects = button.closest('.card').getAttribute('data-effects');
  if (effects.includes('data-loss-potential') || effects.includes('history-rewrite')) { button.disabled = true; button.title = 'Combined high-risk recipe: inspect and choose an individual action in guided recovery.'; }
});
})();
