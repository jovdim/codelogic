/* CodeLogic Question admin: show/hide fieldsets based on question_type.
 *
 * Fieldsets are tagged with classes (see QuestionAdmin.fieldsets):
 *   cl-fs-code    : code snippet + highlight_line (Find Error / Output / Fill-Blank)
 *   cl-fs-mc      : options + correct_answer       (Multiple Choice only)
 *   cl-fs-typed   : correct_text_answer + accepted_answers (Fill Blank / Output)
 *
 * Rules:
 *   multiple-choice  -> show: mc                     hide: typed   (code optional)
 *   find-error       -> show: code                   hide: mc, typed
 *   fill-blank       -> show: typed, code (optional) hide: mc
 *   output           -> show: typed, code            hide: mc
 */
(function () {
  'use strict';

  function applyTypeVisibility(qtype) {
    var sets = document.querySelectorAll('fieldset.module');
    sets.forEach(function (fs) {
      var isMc = fs.classList.contains('cl-fs-mc');
      var isTyped = fs.classList.contains('cl-fs-typed');
      var isCode = fs.classList.contains('cl-fs-code');
      if (!isMc && !isTyped && !isCode) return; // leave Question/Explanation/Settings alone

      var show = true;
      if (qtype === 'multiple-choice') {
        if (isTyped) show = false;
      } else if (qtype === 'find-error') {
        if (isMc) show = false;
        if (isTyped) show = false;
      } else if (qtype === 'fill-blank' || qtype === 'output') {
        if (isMc) show = false;
      }
      fs.style.display = show ? '' : 'none';
    });

    // highlight_line only matters for find-error (the user clicks that line).
    // Hide its form row otherwise so admins don't get confused by it on
    // fill-blank / output / multiple-choice forms.
    var hlField = document.getElementById('id_highlight_line');
    if (hlField) {
      var row = hlField.closest('.form-row');
      if (row) {
        row.style.display = (qtype === 'find-error') ? '' : 'none';
      }
    }
  }

  function init() {
    var select = document.getElementById('id_question_type');
    if (!select) return;
    applyTypeVisibility(select.value);
    select.addEventListener('change', function () {
      applyTypeVisibility(select.value);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
