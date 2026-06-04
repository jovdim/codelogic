/* ============================================================
 * CodeLogic admin: replace every <select> on admin FORM pages
 * (change_form / add_form) with the same custom dark dropdown
 * widget used by the filter bar.
 *
 * Why: Django's stock admin renders dropdowns as native
 * <select> elements. The native option panel is drawn by the
 * OS/browser shell and ignores our dark theme - it always
 * comes out white-on-light, which looks broken against the
 * dark form surface around it.
 *
 * Strategy:
 *   1. For each <select> inside a fieldset.module or div.form-row
 *      on a form page (the changelist's bulk-action <select>
 *      is intentionally left alone - it's handled elsewhere),
 *      build a custom dropdown widget and visually hide the
 *      original.
 *   2. The widget mirrors the same look as the filter dropdowns:
 *      pill trigger + dark popover menu with checkmark on the
 *      currently-selected option.
 *   3. Clicking an option updates the hidden <select> value
 *      and dispatches a 'change' event so any Django admin JS
 *      (e.g. dependent fields) still works.
 *   4. Form submission is unchanged - the browser submits the
 *      hidden <select>'s value as usual.
 *
 * Bonus: <select name="year_level"> gets a small extra step.
 * If a row in the DB ever held a value not in the model's
 * choices list (legacy data), the value is still posted back
 * verbatim. We also append a "(other...)" sentinel that opens
 * an inline number input so admins can type any positive
 * integer without us having to keep widening YEAR_LEVEL_CHOICES.
 * ============================================================ */
(function () {
  var openDropdown = null;

  function closeOpen() {
    if (!openDropdown) return;
    openDropdown.classList.remove('cl-form-open');
    var trig = openDropdown.querySelector('.cl-form-trigger');
    if (trig) trig.setAttribute('aria-expanded', 'false');
    // Restore z-index on the parent form-row (paired with the lift
    // applied when we opened the menu - see trigger click handler).
    var row = openDropdown.closest('.form-row');
    if (row) row.classList.remove('cl-form-row-open');
    openDropdown = null;
  }

  function chevronSvg() {
    return (
      '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" ' +
      'stroke="currentColor" stroke-width="3" stroke-linecap="round" ' +
      'stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>'
    );
  }

  function wrapSelect(select) {
    if (select.dataset.clCustomized === '1') return;
    // Skip selects that have multiple selection or size > 1 - those
    // render as list boxes, and our pill widget can't represent that.
    if (select.multiple || select.size > 1) return;
    // Skip the changelist bulk-action selector and the workflow
    // action selectors (those live inside .actions, not the form).
    if (select.closest('.actions')) return;
    // Skip selects that are already inside our own widgets (defensive).
    if (select.closest('.cl-form-dropdown')) return;

    select.dataset.clCustomized = '1';
    select.classList.add('cl-form-hidden-select');

    var wrap = document.createElement('div');
    wrap.className = 'cl-form-dropdown';

    var trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'cl-form-trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');

    var valueSpan = document.createElement('span');
    valueSpan.className = 'cl-form-value';

    var chev = document.createElement('span');
    chev.className = 'cl-form-chevron';
    chev.setAttribute('aria-hidden', 'true');
    chev.innerHTML = chevronSvg();

    trigger.appendChild(valueSpan);
    trigger.appendChild(chev);

    var menu = document.createElement('div');
    menu.className = 'cl-form-menu';
    menu.setAttribute('role', 'listbox');

    function refreshFromSelect() {
      var sel = select.options[select.selectedIndex];
      valueSpan.textContent = sel
        ? (sel.textContent || '').trim() || '(none)'
        : '(none)';
      menu.querySelectorAll('.cl-form-option').forEach(function (opt) {
        var isMatch = opt.dataset.value === select.value;
        opt.classList.toggle('cl-form-option-selected', isMatch);
        if (isMatch) opt.setAttribute('aria-selected', 'true');
        else opt.removeAttribute('aria-selected');
      });
    }

    Array.from(select.options).forEach(function (option) {
      var opt = document.createElement('button');
      opt.type = 'button';
      opt.className = 'cl-form-option';
      opt.setAttribute('role', 'option');
      opt.dataset.value = option.value;
      var label = (option.textContent || '').trim();
      // Django renders the "no value" placeholder as a row of dashes
      // ("---------"). Rewrite that to a clearer "(none)" in the menu.
      if (/^-+$/.test(label)) label = '(none)';
      opt.textContent = label;
      opt.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        select.value = option.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        refreshFromSelect();
        closeOpen();
        trigger.focus();
      });
      menu.appendChild(opt);
    });

    // === Year-level "Other..." extension =================================
    // For the year_level <select> only, append a sentinel option that
    // shows an inline number input. Submitting the form posts the typed
    // number through the underlying <select> by adding a one-off <option>.
    if (select.name === 'year_level' || /\byear_level\b/.test(select.id || '')) {
      var otherBtn = document.createElement('button');
      otherBtn.type = 'button';
      otherBtn.className = 'cl-form-option cl-form-option-custom';
      otherBtn.textContent = 'Other...';

      var customRow = document.createElement('div');
      customRow.className = 'cl-form-custom-row';
      customRow.innerHTML =
        '<input type="number" min="1" max="50" step="1" ' +
        'class="cl-form-custom-input" placeholder="Year #" />' +
        '<button type="button" class="cl-form-custom-set">Set</button>';

      function commitCustom() {
        var input = customRow.querySelector('.cl-form-custom-input');
        var raw = parseInt(input.value, 10);
        if (!raw || raw < 1) return;
        // Inject a one-off <option> into the hidden select if the value
        // isn't already there, then select it.
        var found = Array.from(select.options).some(function (o) {
          return parseInt(o.value, 10) === raw;
        });
        if (!found) {
          var extra = document.createElement('option');
          extra.value = String(raw);
          extra.textContent = raw + 'th Year';
          select.appendChild(extra);
        }
        select.value = String(raw);
        select.dispatchEvent(new Event('change', { bubbles: true }));
        // Add a matching option button so re-opening shows the
        // selection in the list (above the Other... row).
        var exists = Array.from(menu.querySelectorAll('.cl-form-option'))
          .some(function (o) { return parseInt(o.dataset.value, 10) === raw; });
        if (!exists) {
          var newOpt = document.createElement('button');
          newOpt.type = 'button';
          newOpt.className = 'cl-form-option';
          newOpt.dataset.value = String(raw);
          newOpt.textContent = raw + 'th Year';
          newOpt.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            select.value = String(raw);
            select.dispatchEvent(new Event('change', { bubbles: true }));
            refreshFromSelect();
            closeOpen();
            trigger.focus();
          });
          menu.insertBefore(newOpt, otherBtn);
        }
        refreshFromSelect();
        closeOpen();
        trigger.focus();
      }

      otherBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        customRow.classList.add('cl-form-custom-open');
        var input = customRow.querySelector('.cl-form-custom-input');
        if (input) input.focus();
      });
      customRow.querySelector('.cl-form-custom-set').addEventListener('click', commitCustom);
      customRow.querySelector('.cl-form-custom-input').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          commitCustom();
        }
      });

      menu.appendChild(otherBtn);
      menu.appendChild(customRow);
    }

    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      var wasOpen = wrap.classList.contains('cl-form-open');
      closeOpen();
      if (!wasOpen) {
        wrap.classList.add('cl-form-open');
        trigger.setAttribute('aria-expanded', 'true');
        // Lift the parent form-row so the popover paints OVER the
        // next form-row (Department/etc) instead of being clipped.
        // The CSS :has() selector handles this on modern browsers
        // but we set an explicit class too for older browsers.
        var row = wrap.closest('.form-row');
        if (row) row.classList.add('cl-form-row-open');
        openDropdown = wrap;
        var current = menu.querySelector('.cl-form-option-selected')
          || menu.querySelector('.cl-form-option');
        if (current) current.focus();
      }
    });

    trigger.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!wrap.classList.contains('cl-form-open')) trigger.click();
      } else if (e.key === 'Escape') {
        closeOpen();
      }
    });

    menu.addEventListener('keydown', function (e) {
      var opts = menu.querySelectorAll('.cl-form-option');
      var i = -1;
      for (var n = 0; n < opts.length; n++) {
        if (opts[n] === document.activeElement) { i = n; break; }
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        var nxt = opts[(i + 1) % opts.length];
        if (nxt) nxt.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        var prv = opts[(i - 1 + opts.length) % opts.length];
        if (prv) prv.focus();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeOpen();
        trigger.focus();
      }
    });

    wrap.appendChild(trigger);
    wrap.appendChild(menu);
    select.parentNode.insertBefore(wrap, select.nextSibling);

    refreshFromSelect();
  }

  /* ============================================================
   * Role-dependent field visibility.
   *
   * year_level and section are STUDENT-only fields (the
   * `scoping_year_level` property on User returns None for
   * non-students anyway). Showing them in the form for teachers
   * and admins is confusing - it looks like they apply when they
   * don't.
   *
   * When role changes, hide / re-show those form rows. Works on
   * both the change_form and the add_form. The role <select> may
   * have already been replaced by our custom dropdown widget by
   * the time this runs, so we listen for 'change' on the hidden
   * <select> - which our wrapSelect() dispatches.
   * ============================================================ */
  function syncRoleVisibility() {
    var roleSelect = document.querySelector(
      'fieldset.module select[name="role"]'
    );
    if (!roleSelect) return;

    var studentOnlyRowSelectors = [
      '.form-row.field-year_level',
      '.form-row.field-section',
    ];

    function apply() {
      var isStudent = roleSelect.value === 'student' || !roleSelect.value;
      studentOnlyRowSelectors.forEach(function (sel) {
        document.querySelectorAll(sel).forEach(function (row) {
          row.style.display = isStudent ? '' : 'none';
        });
      });
    }

    apply();
    roleSelect.addEventListener('change', apply);
  }

  function init() {
    // Only on form pages: there's an #content-main form with fieldset.module.
    var fieldsets = document.querySelectorAll('fieldset.module');
    if (!fieldsets.length) return;

    fieldsets.forEach(function (fs) {
      fs.querySelectorAll('select').forEach(wrapSelect);
    });

    syncRoleVisibility();

    document.addEventListener('click', function (e) {
      if (!openDropdown) return;
      if (!openDropdown.contains(e.target)) closeOpen();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeOpen();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
