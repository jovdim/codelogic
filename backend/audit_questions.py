"""
Audit every Question row for production-readiness before pushing the
typed-answer / find-error-click changes.

For each question we check that the data is internally consistent for
the question_type and would grade correctly in the play flow.

Reports:
  - Counts by type
  - Per-type breakdown (single-line vs multi-line for find-error;
    fallback-to-options vs has-correct-text for fill-blank/output)
  - Hard FAILures the user must fix before pushing
  - Soft WARNings the user should be aware of
"""
import os
import sys
import django

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from game.models import Question  # noqa: E402


def audit():
    failures = []  # list of (question, severity, reason)
    warnings = []

    counts = {
        'multiple-choice': 0,
        'find-error': 0,
        'fill-blank': 0,
        'output': 0,
    }

    fe_multi = 0
    fe_single = 0
    fe_missing_hl = 0

    typed_using_fallback = 0
    typed_with_text = 0
    typed_with_variants = 0

    qs = Question.objects.all().select_related('topic')
    total = qs.count()

    for q in qs:
        # Audit against the EFFECTIVE type - that's what the user actually
        # plays and what the server grades against.
        qtype = q.effective_question_type
        counts[qtype] = counts.get(qtype, 0) + 1

        if qtype == 'multiple-choice':
            opts = q.options or []
            if not isinstance(opts, list) or len(opts) < 2:
                failures.append((q, 'FAIL', f'MC question has <2 options: {opts!r}'))
                continue
            if q.correct_answer is None or q.correct_answer >= len(opts):
                failures.append((q, 'FAIL', f'MC correct_answer={q.correct_answer} but only {len(opts)} options'))
                continue

        elif qtype == 'find-error':
            if not q.code_snippet:
                failures.append((q, 'FAIL', 'find-error has no code_snippet'))
                continue
            lines = q.code_snippet.split('\n')
            is_single = len(lines) <= 1
            if is_single:
                fe_single += 1
                # Single-line falls back to MC - verify the MC data is valid.
                opts = q.options or []
                if not isinstance(opts, list) or len(opts) < 2:
                    failures.append((q, 'FAIL', f'single-line find-error falls back to MC but has only {len(opts)} options'))
                    continue
                if q.correct_answer is None or q.correct_answer >= len(opts):
                    failures.append((q, 'FAIL', f'single-line find-error correct_answer={q.correct_answer} but {len(opts)} options'))
                    continue
            else:
                fe_multi += 1
                if not q.highlight_line:
                    fe_missing_hl += 1
                    # Falls back to MC - same checks as single-line.
                    opts = q.options or []
                    if not isinstance(opts, list) or len(opts) < 2:
                        failures.append((q, 'FAIL', f'multi-line find-error has no highlight_line and falls back to MC, but only {len(opts)} options'))
                        continue
                    warnings.append((q, 'WARN', f'multi-line find-error has no highlight_line --> falls back to MC options. Consider setting highlight_line.'))
                elif q.highlight_line > len(lines):
                    failures.append((q, 'FAIL', f'highlight_line={q.highlight_line} but code has only {len(lines)} lines'))
                    continue

        elif qtype in ('fill-blank', 'output'):
            resolved = q.resolved_text_answer
            if not resolved:
                failures.append((q, 'FAIL', f'{qtype} has no correct_text_answer AND no usable options[correct_answer] fallback'))
                continue
            if q.correct_text_answer:
                typed_with_text += 1
            else:
                typed_using_fallback += 1
            if q.accepted_answers:
                typed_with_variants += 1
            # Soft warning: trailing/leading whitespace in resolved answer is dangerous
            # since we trim user input but not the stored answer.
            if resolved != resolved.strip():
                warnings.append((q, 'WARN', f'{qtype} resolved answer has leading/trailing whitespace - user typing same text without space will not match'))

    print('=' * 78)
    print(f'TOTAL QUESTIONS: {total}')
    print('=' * 78)
    print()
    print('Counts by type:')
    for k, v in counts.items():
        print(f'  {k:18s}: {v}')
    print()
    print('Find-error breakdown:')
    print(f'  Multi-line (click-the-line UI): {fe_multi}')
    print(f'    of which missing highlight_line (falls back to MC): {fe_missing_hl}')
    print(f'  Single-line (falls back to MC options): {fe_single}')
    print()
    print('Typed-answer (fill-blank + output) breakdown:')
    print(f'  Has explicit correct_text_answer: {typed_with_text}')
    print(f'  Using options[correct_answer] fallback: {typed_using_fallback}')
    print(f'  Has accepted_answers variants: {typed_with_variants}')
    print()
    print('=' * 78)
    print(f'HARD FAILURES ({len(failures)}) - must fix before push:')
    print('=' * 78)
    if not failures:
        print('  (none)')
    else:
        for q, sev, reason in failures[:50]:
            print(f'  [{sev}] {q.topic.name} L{q.level}: {q.question_text[:50]}')
            print(f'         --> {reason}')
        if len(failures) > 50:
            print(f'  ... and {len(failures) - 50} more')
    print()
    print('=' * 78)
    print(f'SOFT WARNINGS ({len(warnings)}) - worth reviewing:')
    print('=' * 78)
    if not warnings:
        print('  (none)')
    else:
        for q, sev, reason in warnings[:30]:
            print(f'  [{sev}] {q.topic.name} L{q.level}: {q.question_text[:50]}')
            print(f'         --> {reason}')
        if len(warnings) > 30:
            print(f'  ... and {len(warnings) - 30} more')
    print()
    print('=' * 78)
    print('SAMPLE ANSWERS (first 5 of each typed type, to eyeball):')
    print('=' * 78)
    for qtype in ('fill-blank', 'output'):
        print(f'\n--- {qtype} samples ---')
        for q in Question.objects.filter(question_type=qtype)[:5]:
            print(f'  Q: {q.question_text[:60]}')
            print(f'  Answer user must type: {q.resolved_text_answer!r}')
            if q.accepted_answers:
                print(f'  Also accepted: {q.accepted_answers!r}')

    return failures, warnings


if __name__ == '__main__':
    failures, warnings = audit()
    sys.exit(1 if failures else 0)
