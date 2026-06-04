/* ============================================================
 * CodeLogic admin: collapse the right-side filter sidebar into
 * a compact custom-dropdown bar above the results table.
 *
 * Django's default `#changelist-filter` is a tall right column
 * with one filter group per `list_filter` entry. On lists with
 * many filters (e.g. the User admin) it eats a huge slice of
 * horizontal space.
 *
 * We:
 *   1. Find every filter group in #changelist-filter. Modern
 *      Django (5.x+) renders them as
 *          <details data-filter-title="role">
 *            <summary>By role</summary>
 *            <ul><li class="selected"><a href="?">All</a></li>...</ul>
 *          </details>
 *      Legacy Django renders <h3>By role</h3><ul>...</ul>.
 *   2. Build a CUSTOM dropdown widget per group instead of a
 *      native <select>. Native <select> option panels are drawn
 *      by the OS/browser shell and ignore our dark theme - they
 *      come out white-on-light no matter what CSS we throw at
 *      them. The custom widget below is fully stylable.
 *   3. Each option is an <a> that carries the same href Django
 *      generated, so navigation/querystring logic is unchanged.
 *   4. Add a "Clear all" chip when at least one filter is active.
 *   5. Hide the original sidebar via the
 *      `body.cl-filters-collapsed` class.
 *
 * Keyboard: Tab focuses each trigger; Enter/Space toggles open;
 * Arrow Up/Down moves through options; Enter activates; Esc closes.
 * ============================================================ */
(function () {
  // Track the open dropdown so opening another closes it.
  var openDropdown = null;

  function closeOpen() {
    if (!openDropdown) return;
    openDropdown.classList.remove('cl-filter-open');
    var trig = openDropdown.querySelector('.cl-filter-trigger');
    if (trig) trig.setAttribute('aria-expanded', 'false');
    openDropdown = null;
  }

  function init() {
    var sidebar = document.getElementById('changelist-filter');
    if (!sidebar) return;

    // 1) Discover filter groups.
    var groups = [];
    var detailsList = sidebar.querySelectorAll('details');
    if (detailsList.length) {
      detailsList.forEach(function (det) {
        var ul = det.querySelector('ul');
        if (!ul) return;
        var summary = det.querySelector('summary');
        var label = det.getAttribute('data-filter-title')
          || (summary ? summary.textContent : '')
          || '';
        label = label.replace(/^\s*by\s+/i, '').trim();
        groups.push({ label: label, ul: ul });
      });
    } else {
      sidebar.querySelectorAll('h3').forEach(function (h3) {
        var ul = h3.nextElementSibling;
        while (ul && ul.tagName !== 'UL') ul = ul.nextElementSibling;
        if (!ul) return;
        var lbl = (h3.textContent || '').replace(/^\s*by\s+/i, '').trim();
        groups.push({ label: lbl, ul: ul });
      });
    }
    if (!groups.length) return;

    // 2) Build the bar.
    var bar = document.createElement('div');
    bar.id = 'cl-filter-bar';

    var anyActive = false;

    groups.forEach(function (group) {
      var anchors = group.ul.querySelectorAll('a');
      if (!anchors.length) return;

      var dropdown = document.createElement('div');
      dropdown.className = 'cl-filter-dropdown';

      var trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'cl-filter-trigger';
      trigger.setAttribute('aria-haspopup', 'listbox');
      trigger.setAttribute('aria-expanded', 'false');

      var labelEl = document.createElement('span');
      labelEl.className = 'cl-filter-label';
      labelEl.textContent = group.label;

      var valueEl = document.createElement('span');
      valueEl.className = 'cl-filter-value';

      var chevron = document.createElement('span');
      chevron.className = 'cl-filter-chevron';
      chevron.setAttribute('aria-hidden', 'true');
      chevron.innerHTML =
        '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" ' +
        'stroke="currentColor" stroke-width="3" stroke-linecap="round" ' +
        'stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';

      trigger.appendChild(labelEl);
      trigger.appendChild(valueEl);
      trigger.appendChild(chevron);
      dropdown.appendChild(trigger);

      var menu = document.createElement('div');
      menu.className = 'cl-filter-menu';
      menu.setAttribute('role', 'listbox');

      var selectedText = '';
      var selectedIdx = -1;
      anchors.forEach(function (a, idx) {
        var href = a.getAttribute('href') || '';
        var text = (a.textContent || '').trim() || '(blank)';
        var li = a.parentElement;
        var isSelected = li && li.classList.contains('selected');

        var opt = document.createElement('a');
        opt.className = 'cl-filter-option';
        opt.setAttribute('role', 'option');
        opt.href = href;
        opt.textContent = text;
        if (isSelected) {
          opt.classList.add('cl-filter-option-selected');
          opt.setAttribute('aria-selected', 'true');
          selectedText = text;
          selectedIdx = idx;
        }
        menu.appendChild(opt);
      });

      valueEl.textContent = selectedText || 'All';
      if (selectedIdx > 0) {
        dropdown.classList.add('cl-filter-active');
        anyActive = true;
      }

      dropdown.appendChild(menu);

      // ---- Behaviour ----

      // Toggle on trigger click.
      trigger.addEventListener('click', function (e) {
        e.stopPropagation();
        var wasOpen = dropdown.classList.contains('cl-filter-open');
        closeOpen();
        if (!wasOpen) {
          dropdown.classList.add('cl-filter-open');
          trigger.setAttribute('aria-expanded', 'true');
          openDropdown = dropdown;
          // Focus the currently-selected option for keyboard users.
          var current = menu.querySelector('.cl-filter-option-selected')
            || menu.querySelector('.cl-filter-option');
          if (current) current.focus();
        }
      });

      // Keyboard navigation on the trigger.
      trigger.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (!dropdown.classList.contains('cl-filter-open')) {
            trigger.click();
          }
        } else if (e.key === 'Escape') {
          closeOpen();
        }
      });

      // Keyboard navigation INSIDE the menu (Up/Down/Esc).
      menu.addEventListener('keydown', function (e) {
        var opts = menu.querySelectorAll('.cl-filter-option');
        var active = document.activeElement;
        var i = -1;
        for (var n = 0; n < opts.length; n++) {
          if (opts[n] === active) { i = n; break; }
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          var next = opts[(i + 1) % opts.length];
          if (next) next.focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          var prev = opts[(i - 1 + opts.length) % opts.length];
          if (prev) prev.focus();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          closeOpen();
          trigger.focus();
        }
      });

      bar.appendChild(dropdown);
    });

    if (!bar.childElementCount) return;

    if (anyActive) {
      var resetHref = window.location.pathname;
      var clearLink = document.createElement('a');
      clearLink.href = resetHref;
      clearLink.id = 'cl-filter-clear';
      clearLink.textContent = 'Clear all';
      bar.appendChild(clearLink);
    }

    document.body.classList.add('cl-filters-collapsed');

    var changelist = document.getElementById('changelist');
    var anchorEl = document.getElementById('toolbar')
      || (changelist && changelist.firstElementChild)
      || changelist;
    if (anchorEl && anchorEl.parentNode) {
      anchorEl.parentNode.insertBefore(bar, anchorEl.nextSibling);
    } else if (changelist) {
      changelist.insertBefore(bar, changelist.firstChild);
    }

    // Global close-on-outside-click.
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
