/* ============================================================
 * CodeLogic admin: collapse the right-side filter sidebar into
 * a compact dropdown bar above the results table.
 *
 * Django's default `#changelist-filter` is a tall right column
 * with one <h3> per `list_filter` entry and a <ul> of <a> links
 * for each option. On lists with many filters (e.g. the User
 * admin: role / department / year_level / section / verified /
 * active / staff / joined) it eats a huge slice of horizontal
 * space and pushes the actual data into a narrow column.
 *
 * We:
 *   1. Walk every (h3 + following ul) pair inside #changelist-filter
 *   2. Build a <select> per group, each <option> carrying the
 *      <a href> from the original sidebar link
 *   3. Pre-select whichever option matches the currently-active
 *      filter (the <li class="selected">)
 *   4. On change, navigate to that href (Django already encodes
 *      the right querystring on each link, so no rebuilding)
 *   5. Add a "Clear filters" link when at least one non-default
 *      filter is active
 *   6. Hide the original sidebar via the codelogic-admin.css
 *      `body.cl-filters-collapsed #changelist-filter { display:none }`
 *      class we set here
 *
 * No backend changes. Works on every changelist that registers
 * a `list_filter` because we hook the standard Django markup.
 * ============================================================ */
(function () {
  function init() {
    var sidebar = document.getElementById('changelist-filter');
    if (!sidebar) return;

    // Collect every <h3, ul> pair. Django emits one per registered
    // list_filter entry. We use querySelectorAll('h3') + nextElementSibling
    // rather than ':has' so older browsers work too.
    var headings = sidebar.querySelectorAll('h3');
    if (!headings.length) return;

    var bar = document.createElement('div');
    bar.id = 'cl-filter-bar';
    // Each dropdown ends up in here, plus an optional "Clear" link.

    var anyActive = false;
    var clearUrl = null;

    headings.forEach(function (h3) {
      var ul = h3.nextElementSibling;
      while (ul && ul.tagName !== 'UL') ul = ul.nextElementSibling;
      if (!ul) return;
      var anchors = ul.querySelectorAll('a');
      if (!anchors.length) return;

      var label = (h3.textContent || '').trim();

      // Build wrapper: small uppercase label + <select>.
      var wrap = document.createElement('label');
      wrap.className = 'cl-filter-dropdown';

      var caption = document.createElement('span');
      caption.className = 'cl-filter-label';
      caption.textContent = label;

      var select = document.createElement('select');
      select.className = 'cl-filter-select';

      var selectedValue = '';
      anchors.forEach(function (a, idx) {
        var opt = document.createElement('option');
        opt.value = a.getAttribute('href') || '';
        opt.textContent = (a.textContent || '').trim();
        // The .selected class is on the <li>, not the <a>.
        var li = a.parentElement;
        if (li && li.classList.contains('selected')) {
          selectedValue = opt.value;
          // The first option is conventionally "All" - if anything
          // OTHER than that is selected, mark filters as active.
          if (idx !== 0) anyActive = true;
        }
        select.appendChild(opt);
      });
      if (selectedValue) select.value = selectedValue;

      // The first <a> on every filter group is "All" (no constraint)
      // and shares the same href across groups (the changelist URL
      // with the OTHER filters preserved). Remember it so the
      // Clear-all link below can reuse it.
      if (!clearUrl && anchors[0]) {
        clearUrl = anchors[0].getAttribute('href') || null;
      }

      select.addEventListener('change', function () {
        if (select.value) window.location.href = select.value;
      });

      wrap.appendChild(caption);
      wrap.appendChild(select);
      bar.appendChild(wrap);
    });

    if (!bar.childElementCount) return; // nothing to show

    if (anyActive && clearUrl) {
      // Strip every querystring param from the changelist URL to
      // produce a true "no filters" reset. clearUrl from the first
      // group only clears that group, so we go to pathname alone.
      var resetHref = window.location.pathname;
      var clearLink = document.createElement('a');
      clearLink.href = resetHref;
      clearLink.id = 'cl-filter-clear';
      clearLink.textContent = 'Clear filters';
      bar.appendChild(clearLink);
    }

    // Mark <body> so the CSS rule can hide the sidebar and let the
    // main column take the full width.
    document.body.classList.add('cl-filters-collapsed');

    // Mount the bar at the top of #changelist, above the actions row.
    var changelist = document.getElementById('changelist');
    var anchorEl = document.getElementById('toolbar')
      || (changelist && changelist.firstElementChild)
      || changelist;
    if (anchorEl && anchorEl.parentNode) {
      anchorEl.parentNode.insertBefore(bar, anchorEl.nextSibling);
    } else if (changelist) {
      changelist.insertBefore(bar, changelist.firstChild);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
