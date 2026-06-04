/* ============================================================
 * CodeLogic admin: live password-requirements checklist
 *
 * The frontend /register page shows a real-time list of password
 * rules that flip from grey-x to green-check as the user types.
 * The admin's Add User / Change Password forms historically just
 * printed the rules as a flat block of grey text. This script
 * mirrors the register UX so admins get the same instant feedback.
 *
 * The five rules MUST match StrongPasswordValidator on the backend
 * and the passwordRequirements list in frontend/.../register/page.tsx.
 * If those change, change this list too.
 * ============================================================ */
(function () {
  var RULES = [
    { label: 'At least 12 characters', test: function (p) { return p.length >= 12; } },
    { label: 'At least one lowercase letter', test: function (p) { return /[a-z]/.test(p); } },
    { label: 'At least one uppercase letter', test: function (p) { return /[A-Z]/.test(p); } },
    { label: 'At least one number', test: function (p) { return /\d/.test(p); } },
    {
      label: 'At least one special character (@ $ ! % * # ? & _ ^ ( ) -)',
      test: function (p) { return /[@$!%*#?&_^()\-]/.test(p); },
    },
  ];

  function attach(passwordInput) {
    if (!passwordInput || passwordInput.dataset.clStrengthWired === '1') return;
    passwordInput.dataset.clStrengthWired = '1';

    // Find the existing password-rules block for this field and swap
    // its content with our checklist. Django renders this block as
    // `<div class="help">...</div>` in the change_form/add_form context
    // (older Django versions and some widgets use `.helptext`). Match
    // either so the original block is REPLACED rather than left next
    // to our checklist as a duplicate.
    var row = passwordInput.closest('.form-row');
    if (!row) return;
    var helptext = row.querySelector('.help, .helptext');

    var container = document.createElement('div');
    container.className = 'cl-pwd-strength';

    var bar = document.createElement('div');
    bar.className = 'cl-pwd-strength-bar';
    var fill = document.createElement('div');
    fill.className = 'cl-pwd-strength-fill';
    bar.appendChild(fill);
    var label = document.createElement('div');
    label.className = 'cl-pwd-strength-label';
    label.textContent = 'Password strength';

    var list = document.createElement('ul');
    list.className = 'cl-pwd-rules';

    var items = RULES.map(function (rule) {
      var li = document.createElement('li');
      li.className = 'cl-pwd-rule';
      var icon = document.createElement('span');
      icon.className = 'cl-pwd-icon';
      icon.innerHTML =
        '<svg class="cl-pwd-icon-x" viewBox="0 0 24 24" width="14" height="14" ' +
        'fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" ' +
        'stroke-linejoin="round"><line x1="6" y1="6" x2="18" y2="18"/>' +
        '<line x1="18" y1="6" x2="6" y2="18"/></svg>' +
        '<svg class="cl-pwd-icon-check" viewBox="0 0 24 24" width="14" height="14" ' +
        'fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" ' +
        'stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
      var text = document.createElement('span');
      text.textContent = rule.label;
      li.appendChild(icon);
      li.appendChild(text);
      list.appendChild(li);
      return { el: li, rule: rule };
    });

    container.appendChild(label);
    container.appendChild(bar);
    container.appendChild(list);

    if (helptext) {
      helptext.innerHTML = '';
      helptext.appendChild(container);
      // Drop the callout border the global CSS put around helptext -
      // our checklist already has its own surface.
      helptext.classList.add('cl-pwd-helptext-replaced');
    } else {
      row.appendChild(container);
    }
    // Defensive: if Django emitted MORE than one help node (some custom
    // widgets stack a `.help` AND a `.helptext`), wipe the extras so the
    // page doesn't show duplicate password-rules text above our list.
    row.querySelectorAll('.help, .helptext').forEach(function (n) {
      if (n === helptext) return;
      n.remove();
    });

    function evaluate() {
      var pwd = passwordInput.value || '';
      var pass = 0;
      items.forEach(function (item) {
        var ok = item.rule.test(pwd);
        item.el.classList.toggle('cl-pwd-rule-met', ok);
        if (ok) pass++;
      });
      var pct = (pass / items.length) * 100;
      fill.style.width = pct + '%';
      // Color the bar: red < 60%, amber 60-99%, green at 100%.
      var color = '#ef4444';
      if (pct >= 100) color = '#10b981';
      else if (pct >= 60) color = '#f59e0b';
      fill.style.background = color;
    }

    passwordInput.addEventListener('input', evaluate);
    evaluate();
  }

  function init() {
    // Match both password1 (Add User) and other password fields that
    // route through the same StrongPasswordValidator. The change
    // password page uses `password` / `new_password1` / `new_password2`.
    document
      .querySelectorAll('input[type="password"][name="password1"], ' +
                       'input[type="password"][name="new_password1"]')
      .forEach(attach);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
