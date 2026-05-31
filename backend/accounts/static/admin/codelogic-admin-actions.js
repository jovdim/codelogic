/* ============================================================
 * CodeLogic admin: prominent Select All + Delete Selected
 *
 * Django's stock changelist already has bulk-action support
 * (the small "Action: [Delete selected]  Go" row) but the
 * client said it "looks like just design" because the
 * row-toggle checkbox + dropdown + Go button flow is not
 * obvious. We add a clearer toolbar above each list with:
 *   - "Select All on Page"  toggles the row checkboxes on/off
 *   - "Delete Selected (N)" one-click delete of selected rows
 *
 * Both buttons hook into the existing Django machinery
 * (#action-toggle + .action-select + the action <form>) so
 * Django's permission checks, confirmation page, and audit
 * log all keep working.
 * ============================================================ */
(function () {
  function init() {
    var changelistForm = document.getElementById('changelist-form');
    if (!changelistForm) return; // not a list page

    var rowChecks = changelistForm.querySelectorAll('.action-select');
    if (!rowChecks.length) return; // no rows / no action column

    // Some of our custom changelist templates (e.g. accounts/user/change_list)
    // override Django's `result_list` block to render a card grid, which
    // also drops the default `<select name="action">` + Go button.
    // Inject a hidden action select + submit button so the bulk toolbar
    // still has a valid form path. delete_selected is Django's built-in
    // bulk action - always available unless ModelAdmin.actions explicitly
    // removes it.
    var actionSelect = changelistForm.querySelector('select[name="action"]');
    if (!actionSelect) {
      actionSelect = document.createElement('select');
      actionSelect.name = 'action';
      actionSelect.style.display = 'none';
      var opt = document.createElement('option');
      opt.value = 'delete_selected';
      opt.textContent = 'Delete selected';
      actionSelect.appendChild(opt);
      changelistForm.appendChild(actionSelect);
    }
    // Mirror: synthesize a Go button if missing (the JS reaches for it
    // by name="index" to submit the action form).
    if (!changelistForm.querySelector('button[name="index"]')) {
      var goBtn = document.createElement('button');
      goBtn.type = 'submit';
      goBtn.name = 'index';
      goBtn.value = '0';
      goBtn.style.display = 'none';
      changelistForm.appendChild(goBtn);
    }

    // Only add the toolbar once.
    if (document.getElementById('cl-bulk-toolbar')) return;

    var bar = document.createElement('div');
    bar.id = 'cl-bulk-toolbar';
    bar.style.cssText =
      'display:flex;gap:8px;align-items:center;flex-wrap:wrap;' +
      'margin:0 0 12px 0;padding:10px 14px;background:#1a1a2e;' +
      'border:1px solid #2d2d44;border-radius:8px;color:#cbd5e1;';

    var selectAllBtn = document.createElement('button');
    selectAllBtn.type = 'button';
    selectAllBtn.id = 'cl-select-all-btn';
    selectAllBtn.textContent = 'Select All on Page';
    styleBtn(selectAllBtn, '#7c3aed');

    var clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.id = 'cl-clear-selection-btn';
    clearBtn.textContent = 'Clear Selection';
    styleBtn(clearBtn, '#475569');

    var deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.id = 'cl-delete-selected-btn';
    deleteBtn.textContent = 'Delete Selected';
    styleBtn(deleteBtn, '#dc2626');

    var counter = document.createElement('span');
    counter.id = 'cl-selection-counter';
    counter.style.cssText = 'margin-left:auto;font-weight:600;color:#a78bfa;';
    counter.textContent = '0 selected';

    bar.appendChild(selectAllBtn);
    bar.appendChild(clearBtn);
    bar.appendChild(deleteBtn);
    bar.appendChild(counter);

    // Mount above the actions row when it exists, otherwise above
    // the result_list table.
    var actionsRow = changelistForm.querySelector('.actions');
    var resultList = document.getElementById('result_list');
    var anchor = actionsRow || resultList;
    if (anchor && anchor.parentNode) {
      anchor.parentNode.insertBefore(bar, anchor);
    } else {
      changelistForm.insertBefore(bar, changelistForm.firstChild);
    }

    function styleBtn(b, color) {
      b.style.cssText =
        'background:' + color + ';color:#fff;border:0;padding:8px 14px;' +
        'border-radius:6px;font-weight:600;cursor:pointer;' +
        'transition:opacity .12s ease, transform .08s ease;';
      b.addEventListener('mouseenter', function () { b.style.opacity = '0.9'; });
      b.addEventListener('mouseleave', function () { b.style.opacity = '1'; });
    }

    function updateCounter() {
      var n = 0;
      rowChecks.forEach(function (cb) { if (cb.checked) n++; });
      counter.textContent = n + ' selected';
      deleteBtn.disabled = n === 0;
      deleteBtn.style.opacity = n === 0 ? '0.5' : '1';
      deleteBtn.style.cursor = n === 0 ? 'not-allowed' : 'pointer';
    }

    // Walk a checkbox -> its visual row container so we can highlight
    // the whole card / table row when selected. Tries the card-style
    // user changelist first (.cl-user-card), then falls back to the
    // standard Django table row.
    function rowFor(cb) {
      return cb.closest('.cl-user-card') || cb.closest('tr');
    }

    function syncRowHighlight() {
      rowChecks.forEach(function (cb) {
        var row = rowFor(cb);
        if (!row) return;
        if (cb.checked) {
          row.classList.add('cl-row-selected');
        } else {
          row.classList.remove('cl-row-selected');
        }
      });
    }

    function refresh() {
      updateCounter();
      syncRowHighlight();
    }

    rowChecks.forEach(function (cb) {
      cb.addEventListener('change', refresh);
    });

    // Make the whole row/card clickable to toggle the checkbox. We
    // ignore clicks on interactive children (links, buttons, inputs,
    // selects, textareas) so admins can still click "Edit ->" without
    // also toggling selection.
    rowChecks.forEach(function (cb) {
      var row = rowFor(cb);
      if (!row || row.dataset.clClickWired === '1') return;
      row.dataset.clClickWired = '1';
      row.addEventListener('click', function (e) {
        var t = e.target;
        if (!t) return;
        // Don't intercept clicks meant for the checkbox itself - the
        // browser already toggles it.
        if (t === cb) return;
        // Skip if the user clicked an interactive element.
        if (t.closest('a, button, input, select, textarea, label')) return;
        cb.checked = !cb.checked;
        refresh();
      });
      row.style.cursor = 'pointer';
    });

    refresh();

    selectAllBtn.addEventListener('click', function () {
      rowChecks.forEach(function (cb) { cb.checked = true; });
      var toggle = document.getElementById('action-toggle');
      if (toggle) toggle.checked = true;
      refresh();
    });

    clearBtn.addEventListener('click', function () {
      rowChecks.forEach(function (cb) { cb.checked = false; });
      var toggle = document.getElementById('action-toggle');
      if (toggle) toggle.checked = false;
      refresh();
    });

    deleteBtn.addEventListener('click', function () {
      var anyChecked = Array.prototype.some.call(rowChecks, function (cb) { return cb.checked; });
      if (!anyChecked) return;

      // delete_selected is Django's built-in bulk action - always
      // present unless ModelAdmin.actions removes it.
      var hasDelete = false;
      for (var i = 0; i < actionSelect.options.length; i++) {
        if (actionSelect.options[i].value === 'delete_selected') {
          hasDelete = true;
          actionSelect.value = 'delete_selected';
          break;
        }
      }
      if (!hasDelete) {
        alert('Delete is not available on this list. Choose a different action.');
        return;
      }

      // Submit through the existing action form. Django renders a
      // confirmation page next so this is not destructive on its own.
      var goBtn = changelistForm.querySelector('button[name="index"]');
      if (goBtn) {
        goBtn.click();
      } else {
        // Fallback: submit the form directly.
        changelistForm.submit();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
