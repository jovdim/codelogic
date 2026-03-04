"""Lesson data for all topics. Imported by seed_lessons command."""

def L(lv, title, content, code='', tip=''):
    return (lv, title, content, code, tip)

def get_all_lessons():
    from game.management.commands._lessons_py import PY
    from game.management.commands._lessons_js import JS
    from game.management.commands._lessons_css import CSS
    from game.management.commands._lessons_react import REACT
    from game.management.commands._lessons_java import JAVA
    from game.management.commands._lessons_cpp import CPP
    from game.management.commands._lessons_sql import SQL
    from game.management.commands._lessons_bash import BASH
    from game.management.commands.seed_lessons import HTML_LESSONS
    return {
        'html': HTML_LESSONS, 'python': PY, 'javascript': JS,
        'css': CSS, 'react': REACT, 'java': JAVA,
        'cpp': CPP, 'sql': SQL, 'bash': BASH,
    }
