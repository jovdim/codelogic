"""
Management command to seed lesson slides for all topics.
Each level gets 2-3 short lessons shown before quiz questions.
Format: (level, title, content, code_example, tip)
"""

from django.core.management.base import BaseCommand
from game.models import Topic, Lesson


def L(level, title, content, code='', tip=''):
    """Shorthand to create a lesson tuple."""
    return (level, title, content, code, tip)


# ============================================================
# HTML LESSONS
# ============================================================
HTML_LESSONS = [
    # Level 1: HTML Basics
    L(1, 'What is HTML?',
      'HTML (Hyper Text Markup Language) is the standard language for creating web pages. Every website you visit is built with HTML at its core. It uses tags like <h1>, <p>, and <body> to tell the browser what to display and how to structure the content.',
      '<!DOCTYPE html>\n<html>\n<head>\n  <title>My First Page</title>\n</head>\n<body>\n  <h1>Hello World</h1>\n  <p>Welcome to my website.</p>\n</body>\n</html>',
      'Every HTML page needs three things: <!DOCTYPE html> at the top, a <head> section for page info, and a <body> section for all visible content.'),
    L(1, 'Tags, Elements, and Structure',
      'HTML uses opening tags like <p> and closing tags like </p> to wrap content. The <body> tag contains everything visible on the page. Headings range from <h1> (the largest) to <h6> (the smallest). Always close your tags properly — writing <title> instead of </title> is a common mistake.',
      '<h1>Main Heading</h1>\n<h2>Subheading</h2>\n<h3>Smaller Heading</h3>\n<p>A paragraph of text.</p>\n<br>\n<!-- br is a self-closing tag -->',
      'Some tags like <br> and <img> are self-closing — they do not need a separate closing tag. The <head> tag is for metadata, not visible content.'),

    # Level 2: Text Elements
    L(2, 'Headings and Paragraphs',
      'HTML has 6 heading levels: <h1> is the biggest and most important, <h6> is the smallest. Use <p> for regular paragraph text. Every opening <p> tag needs a matching </p> closing tag, or your content will not render correctly.',
      '<h1>Main Title</h1>\n<h2>Subtitle</h2>\n<p>This is a paragraph.</p>\n<p>This is another paragraph.</p>\n<!-- Each <p> must be closed with </p> -->',
      'Use only one <h1> per page for good SEO. The <br> tag creates a line break within a paragraph without starting a new one.'),
    L(2, 'Bold, Italic, and Inline Text',
      'Use <strong> to mark important text (displays bold) and <em> to emphasize text (displays italic). While older tags <b> and <i> also work, <strong> and <em> carry semantic meaning that screen readers understand.',
      '<p>This is <strong>important</strong> text.</p>\n<p>This is <em>emphasized</em> text.</p>\n<p>You can <strong>nest <em>both</em></strong>.</p>',
      'Always match your closing tags: <strong>text</strong> not <strong>text<strong>. Screen readers rely on <strong> and <em> to understand emphasis.'),

    # Level 3: Links and Images
    L(3, 'Creating Links with Anchor Tags',
      'The <a> tag creates clickable links. The href attribute tells the browser where to go when the link is clicked. You can link to external URLs, other pages on your site, or even sections within the same page. Use target="_blank" to open links in a new tab.',
      '<a href="https://example.com">Visit Example</a>\n<a href="about.html">About Page</a>\n<a href="#top" target="_blank">Open in New Tab</a>',
      'The href attribute is required for links — without it, the <a> tag will not work as a link. Do not confuse href (for links) with src (for images).'),
    L(3, 'Adding Images',
      'The <img> tag displays images on a page. It requires two important attributes: src for the file path and alt for accessibility text. The alt attribute is essential — it describes the image for screen readers and shows text when the image cannot load.',
      '<img src="photo.jpg" alt="A sunset over the ocean">\n<img src="logo.png" alt="Company Logo" width="200">\n<!-- img is self-closing, no </img> needed -->',
      'Always include the alt attribute on every image. It is required for accessibility and helps search engines understand your images.'),

    # Level 4: Lists
    L(4, 'Ordered and Unordered Lists',
      'Use <ul> for bullet-point (unordered) lists and <ol> for numbered (ordered) lists. Each item inside uses the <li> (list item) tag. Every <li> opening tag must have a matching </li> closing tag, or your list will break.',
      '<ul>\n  <li>Apple</li>\n  <li>Banana</li>\n</ul>\n\n<ol>\n  <li>First step</li>\n  <li>Second step</li>\n</ol>',
      'Always close your <li> tags! An unclosed <li> is a very common HTML error. You can nest lists inside each other to create sub-lists.'),
    L(4, 'Description Lists',
      'Description lists use <dl> as the container, <dt> for terms, and <dd> for definitions. They are perfect for glossaries, FAQs, or any content with term-description pairs.',
      '<dl>\n  <dt>HTML</dt>\n  <dd>A markup language for web pages</dd>\n  <dt>CSS</dt>\n  <dd>A language for styling</dd>\n</dl>',
      'Remember the tags: <dl> = description list, <dt> = description term, <dd> = description data/definition.'),

    # Level 5: Tables
    L(5, 'Building Tables',
      'Tables organize data in rows and columns. The structure uses <table> as the container, <tr> for each row, <th> for header cells (bold and centered), and <td> for data cells. Table cells <td> must always be inside a <tr> row — putting <td> directly inside <table> is an error.',
      '<table>\n  <tr>\n    <th>Name</th>\n    <th>Age</th>\n  </tr>\n  <tr>\n    <td>Alice</td>\n    <td>25</td>\n  </tr>\n</table>',
      'Remember: <tr> = table row, <th> = table header, <td> = table data. Never put <td> outside of a <tr> — that is a common mistake.'),
    L(5, 'Spanning and Sectioning Tables',
      'Use colspan to make a cell span multiple columns and rowspan for multiple rows. Group table sections with <thead>, <tbody>, and <tfoot> for better structure and accessibility.',
      '<table>\n  <thead>\n    <tr><th colspan="2">Full Width Header</th></tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td>Cell 1</td>\n      <td>Cell 2</td>\n    </tr>\n  </tbody>\n</table>',
      'Tables should only be used for tabular data, not for page layout. Use CSS Flexbox or Grid for layouts instead.'),

    # Level 6: Forms Basics
    L(6, 'Creating Forms',
      'The <form> tag collects user input and sends it to a server. The action attribute specifies WHERE to send the data, and the method attribute specifies HOW (GET or POST). Every input field should have a name attribute — without it, the data will not be submitted.',
      '<form action="/submit" method="post">\n  <input type="text" name="username">\n  <button type="submit">Send</button>\n</form>',
      'The action attribute tells the form where to send data. The name attribute on inputs is required for the data to be included in the submission.'),
    L(6, 'Input Types',
      'The <input> tag creates form fields. The type attribute determines the field type: text for regular text, password for hidden text, email for email validation, and number for numeric values. Using the correct type enables built-in browser validation and shows the right keyboard on mobile.',
      '<input type="text" name="user" placeholder="Name">\n<input type="password" name="pass">\n<input type="email" name="email">\n<input type="number" name="age" min="1" max="120">',
      'Always specify the type attribute — it defaults to "text" but being explicit makes your code clearer and enables proper validation.'),

    # Level 7: Form Elements
    L(7, 'Dropdowns and Textareas',
      'Use <select> with <option> tags to create dropdown menus. Use <textarea> for multi-line text input. Radio buttons in the same group must share the same name attribute so the browser knows they are related choices.',
      '<select name="color">\n  <option value="red">Red</option>\n  <option value="blue">Blue</option>\n</select>\n\n<textarea name="message" rows="4" cols="50">\nEnter your message</textarea>',
      'Radio buttons in a group need the SAME name attribute. If they have different name values, users can select multiple — which defeats the purpose.'),
    L(7, 'Labels, Accessibility, and Checkboxes',
      'The <label> tag connects descriptive text to an input using the for attribute, which must match the input id. This makes forms accessible to screen readers and lets users click the label to focus the input. Checkboxes use type="checkbox".',
      '<label for="email">Email:</label>\n<input type="email" id="email" name="email">\n\n<input type="checkbox" id="agree" name="agree">\n<label for="agree">I agree</label>',
      'The for attribute on <label> must match the id attribute on <input> — not the name. This is crucial for accessibility.'),

    # Level 8: Semantic HTML
    L(8, 'What is Semantic HTML?',
      'Semantic tags describe the meaning of content, not just how it looks. Key semantic tags include: <header> for site headers, <nav> for navigation links, <main> for primary content, <aside> for sidebars, and <footer> for page footers. They help search engines and screen readers understand your page structure.',
      '<header>Site Header</header>\n<nav>Navigation Links</nav>\n<main>Main Content</main>\n<aside>Sidebar Content</aside>\n<footer>Site Footer</footer>',
      'Using semantic tags improves SEO and accessibility. <nav> is the correct tag for navigation — not <navigation> or <menu>.'),
    L(8, 'Article, Section, and Page Structure',
      'Use <article> for self-contained content that could stand alone (like a blog post or news story). Use <section> to group related content together. The <aside> tag is specifically for sidebar content that is tangentially related to the main content.',
      '<article>\n  <h2>How to Learn HTML</h2>\n  <p>Start with the basics...</p>\n</article>\n\n<section>\n  <h2>Features</h2>\n  <p>Our product offers...</p>\n</section>',
      'Remember: <article> = self-contained, <section> = grouped content, <aside> = sidebar, <footer> = page bottom.'),

    # Level 9: HTML5 Features
    L(9, 'Modern Input Types',
      'HTML5 added input types with built-in validation: type="email" validates email format, type="date" shows a date picker, type="color" shows a color picker, and type="range" creates a slider. The required attribute prevents form submission until the field is filled.',
      '<input type="email" required>\n<input type="date" name="birthday">\n<input type="color" value="#ff0000">\n<input type="range" min="0" max="100" value="50">',
      'The required attribute ensures a field must be filled. A range input value should always be between its min and max — a value of 150 with max="100" is invalid.'),
    L(9, 'Placeholder and Autofocus',
      'The placeholder attribute shows hint text inside an input that disappears when the user starts typing. The autofocus attribute automatically moves the cursor to that input when the page loads. These improve user experience but are not substitutes for labels.',
      '<input type="text" placeholder="Search...">\n<input type="text" autofocus>\n<input type="text" placeholder="Enter name" required>',
      'Placeholder text is NOT a replacement for <label> — screen readers may not read it. Always pair inputs with proper labels.'),

    # Level 10: Multimedia
    L(10, 'Video and Audio Elements',
      'HTML5 lets you embed video and audio directly using <video> and <audio> tags. The controls attribute adds play/pause buttons. The loop attribute makes media repeat, and autoplay starts playing automatically when the page loads.',
      '<video src="movie.mp4" controls width="640">\n  Your browser does not support video.\n</video>\n\n<audio src="song.mp3" controls></audio>',
      'The controls attribute is essential — without it, users cannot play or pause the media. The text between tags is a fallback for unsupported browsers.'),
    L(10, 'Source Elements and Formats',
      'Use multiple <source> tags inside <video> or <audio> to provide different file formats. The browser picks the first format it supports. MP4 is the most widely supported video format.',
      '<video controls>\n  <source src="movie.mp4" type="video/mp4">\n  <source src="movie.webm" type="video/webm">\n</video>',
      'MP4 works in almost all browsers. The autoplay attribute starts playback immediately, and loop makes it repeat continuously.'),

    # Level 11: Canvas and SVG
    L(11, 'SVG — Scalable Vector Graphics',
      'SVG stands for Scalable Vector Graphics. Unlike pixel-based images, SVGs never get blurry when zoomed because they are drawn with math. Common shapes include <circle> (with cx, cy, r attributes) and <rect> (with x, y, width, height attributes).',
      '<svg width="100" height="100">\n  <circle cx="50" cy="50" r="40"\n    fill="blue" stroke="black" />\n  <rect x="10" y="10" width="30"\n    height="30" fill="red" />\n</svg>',
      'SVG shapes: <circle> uses cx/cy (center) and r (radius). <rect> uses x/y (position) and width/height. SVGs can be styled with CSS.'),
    L(11, 'Canvas for JavaScript Graphics',
      'The <canvas> element provides a drawing area controlled by JavaScript. You can draw shapes, create charts, build animations, and even make games. Unlike SVG (vector), canvas draws pixels (raster), making it better for complex animations.',
      '<canvas id="myCanvas" width="400" height="300">\n</canvas>\n\n<script>\nconst ctx = document.getElementById("myCanvas")\n  .getContext("2d");\nctx.fillStyle = "blue";\nctx.fillRect(10, 10, 100, 50);\n</script>',
      'Canvas draws pixels (raster), SVG draws shapes (vector). Use canvas for complex animations and games, SVG for icons and logos.'),

    # Level 12: Meta Tags and SEO
    L(12, 'Meta Tags',
      'Meta tags go inside <head> and provide information about your page to browsers and search engines. The charset meta sets character encoding, the description meta helps SEO, and the viewport meta is essential for mobile-friendly design. Use the name attribute to specify the type of metadata.',
      '<head>\n  <meta charset="UTF-8">\n  <meta name="description"\n    content="Learn HTML basics">\n  <meta name="viewport"\n    content="width=device-width,\n    initial-scale=1">\n</head>',
      'Meta description uses name="description" with a content attribute — writing <meta description="..."> is wrong. The viewport meta is essential for mobile.'),
    L(12, 'SEO Best Practices',
      'Good SEO starts with proper HTML: one <h1> per page, a descriptive <title> tag, meta descriptions, and the lang attribute on <html> to specify the page language. The lang attribute helps both search engines and accessibility tools understand your content.',
      '<html lang="en">\n<head>\n  <title>Learn HTML - Free Tutorial</title>\n  <meta name="description"\n    content="A beginner guide to HTML.">\n</head>',
      'The lang attribute on <html> specifies the page language for accessibility and SEO. Keep title tags under 60 characters for search results.'),

    # Level 13: Accessibility
    L(13, 'ARIA Attributes',
      'ARIA (Accessible Rich Internet Applications) attributes help screen readers understand interactive elements. Use aria-label to provide accessible names and role to define element types. The first rule of ARIA: prefer native HTML elements over ARIA when possible.',
      '<button aria-label="Close menu">X</button>\n<div role="alert">Form saved!</div>\n<nav aria-label="Main navigation">\n  ...\n</nav>',
      'Use aria-label (not aria-name or aria-title) to describe elements for screen readers. The role attribute defines what type of UI element something is.'),
    L(13, 'Focus Management and Tab Order',
      'Keyboard users navigate with the Tab key. Interactive elements like links and buttons are naturally focusable. Use tabindex="0" to add a non-interactive element to the tab order, and tabindex="-1" to make it focusable only by JavaScript.',
      '<button>First (focusable)</button>\n<button>Second (focusable)</button>\n<div tabindex="0">Now I am focusable too</div>\n<div tabindex="-1">Only JS can focus me</div>',
      'tabindex="0" makes an element focusable via Tab key. tabindex="-1" makes it focusable only through JavaScript, not by tabbing.'),

    # Level 14: Advanced Forms
    L(14, 'Datalist and Form Validation',
      'The <datalist> element provides autocomplete suggestions for an input. Unlike <select>, users can still type freely. The pattern attribute validates input using regular expressions, and the accept attribute on file inputs limits allowed file types.',
      '<input list="langs" placeholder="Language">\n<datalist id="langs">\n  <option value="JavaScript">\n  <option value="Python">\n</datalist>\n\n<input type="number" min="1" max="100">',
      '<datalist> provides suggestions but allows free text input — unlike <select> which limits choices. The min and max attributes set valid ranges for number inputs.'),
    L(14, 'Fieldset, Legend, and Pattern',
      'Use <fieldset> to group related form fields and <legend> to label the group. A <fieldset> without a <legend> is considered incomplete. The pattern attribute uses regex to validate input format.',
      '<fieldset>\n  <legend>Contact Info</legend>\n  <input type="email" required\n    placeholder="Email">\n  <input type="tel"\n    pattern="[0-9]{10}"\n    placeholder="Phone">\n</fieldset>',
      'Always include a <legend> inside <fieldset> — it is important for accessibility. The pattern attribute uses regular expressions to validate data format.'),

    # Level 15: HTML APIs and Advanced Features
    L(15, 'Browser APIs and Interactive Attributes',
      'Modern HTML includes powerful APIs and attributes: localStorage for saving data in the browser, contenteditable for inline editing, and draggable for drag-and-drop functionality. These add interactivity without needing a framework.',
      '<div contenteditable="true">\n  Click to edit this text\n</div>\n\n<div draggable="true">\n  Drag me around\n</div>',
      'localStorage stores up to 5MB of data per domain and persists even after the browser is closed. contenteditable and draggable both take "true" as their value.'),
    L(15, 'Template and Details Elements',
      'The <template> tag holds HTML content that is not rendered until JavaScript activates it — it is hidden by default. The <details> element creates a native collapsible section with <summary>, requiring no CSS or JavaScript to work.',
      '<details>\n  <summary>Click to expand</summary>\n  <p>Hidden content here!</p>\n</details>\n\n<template id="card">\n  <div class="card">\n    <h3>Title</h3>\n  </div>\n</template>',
      '<details> is interactive by default — no JavaScript needed. <template> holds content that is NOT rendered until used by JavaScript.'),
]


class Command(BaseCommand):
    help = 'Seed lesson slides for all topics'

    def handle(self, *args, **options):
        from game.management.commands._lessons_data import get_all_lessons

        self.stdout.write('Clearing existing lessons...')
        Lesson.objects.all().delete()

        all_lessons = get_all_lessons()

        total = 0
        for topic_slug, lessons in all_lessons.items():
            try:
                topic = Topic.objects.get(slug=topic_slug)
            except Topic.DoesNotExist:
                self.stdout.write(self.style.WARNING(f'Topic "{topic_slug}" not found, skipping'))
                continue

            self.stdout.write(f'\nSeeding {topic.name} lessons...')
            for order, (level, title, content, code, tip) in enumerate(lessons, 1):
                Lesson.objects.create(
                    topic=topic,
                    level=level,
                    title=title,
                    content=content,
                    code_example=code,
                    tip=tip,
                    order=order
                )
            levels_covered = len(set(l[0] for l in lessons))
            self.stdout.write(self.style.SUCCESS(
                f'  {len(lessons)} lessons across {levels_covered} levels'
            ))
            total += len(lessons)

        self.stdout.write(self.style.SUCCESS(f'\nTotal: {total} lessons seeded'))
