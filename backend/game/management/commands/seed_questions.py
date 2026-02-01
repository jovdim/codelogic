"""
Management command to seed quiz questions for CodeLogic.
Comprehensive questions for HTML (Frontend) and Python (Backend) - 15 levels each.
Includes: multiple-choice, find-error, fill-blank, and output question types.
"""

from django.core.management.base import BaseCommand
from game.models import Category, Topic, Question


class Command(BaseCommand):
    help = 'Seed quiz questions for all topics'

    def handle(self, *args, **options):
        self.stdout.write('Clearing existing game data...')
        Question.objects.all().delete()
        Topic.objects.all().delete()
        Category.objects.all().delete()
        
        # ============================================================
        # CREATE CATEGORIES
        # ============================================================
        
        frontend, _ = Category.objects.get_or_create(
            slug='frontend',
            defaults={
                'name': 'Frontend', 
                'description': 'Master the art of creating stunning web interfaces with HTML, CSS, JavaScript, and more.',
                'icon': 'Code', 
                'color': '#8b5cf6', 
                'order': 1
            }
        )
        self.stdout.write(self.style.SUCCESS(f'Created Category: {frontend.name}'))
        
        backend, _ = Category.objects.get_or_create(
            slug='backend', 
            defaults={
                'name': 'Backend', 
                'description': 'Learn to build robust server applications with Python, Node.js, databases, and APIs.',
                'icon': 'Server', 
                'color': '#10b981', 
                'order': 2
            }
        )
        self.stdout.write(self.style.SUCCESS(f'Created Category: {backend.name}'))
        
        devops, _ = Category.objects.get_or_create(
            slug='devops',
            defaults={
                'name': 'DevOps',
                'description': 'Master deployment, CI/CD, containers, databases, and cloud infrastructure.',
                'icon': 'Cloud',
                'color': '#f59e0b',
                'order': 3
            }
        )
        self.stdout.write(self.style.SUCCESS(f'Created Category: {devops.name}'))
        
        # ============================================================
        # CREATE TOPICS (All with 15 levels)
        # ============================================================
        
        # Frontend Topics
        js_topic, _ = Topic.objects.get_or_create(
            category=frontend, slug='javascript',
            defaults={'name': 'JavaScript', 'description': 'Interactive web programming', 'order': 1, 'total_levels': 15}
        )
        self.stdout.write(f'  Topic: {js_topic.name}')
        
        html_topic, _ = Topic.objects.get_or_create(
            category=frontend, slug='html',
            defaults={'name': 'HTML', 'description': 'Web structure and markup', 'order': 2, 'total_levels': 15}
        )
        self.stdout.write(f'  Topic: {html_topic.name}')
        
        css_topic, _ = Topic.objects.get_or_create(
            category=frontend, slug='css',
            defaults={'name': 'CSS', 'description': 'Styling and visual design', 'order': 3, 'total_levels': 15}
        )
        self.stdout.write(f'  Topic: {css_topic.name}')
        
        react_topic, _ = Topic.objects.get_or_create(
            category=frontend, slug='react',
            defaults={'name': 'React', 'description': 'Component-based UI library', 'order': 4, 'total_levels': 15}
        )
        self.stdout.write(f'  Topic: {react_topic.name}')
        
        # Backend Topics
        py_topic, _ = Topic.objects.get_or_create(
            category=backend, slug='python',
            defaults={'name': 'Python', 'description': 'Versatile programming language', 'order': 1, 'total_levels': 15}
        )
        self.stdout.write(f'  Topic: {py_topic.name}')
        
        java_topic, _ = Topic.objects.get_or_create(
            category=backend, slug='java',
            defaults={'name': 'Java', 'description': 'Object-oriented enterprise language', 'order': 2, 'total_levels': 15}
        )
        self.stdout.write(f'  Topic: {java_topic.name}')
        
        cpp_topic, _ = Topic.objects.get_or_create(
            category=backend, slug='cpp',
            defaults={'name': 'C++', 'description': 'High-performance systems programming', 'order': 3, 'total_levels': 15}
        )
        self.stdout.write(f'  Topic: {cpp_topic.name}')
        
        # DevOps Topics
        sql_topic, _ = Topic.objects.get_or_create(
            category=devops, slug='sql',
            defaults={'name': 'SQL', 'description': 'Database query language', 'order': 1, 'total_levels': 15}
        )
        self.stdout.write(f'  Topic: {sql_topic.name}')
        
        bash_topic, _ = Topic.objects.get_or_create(
            category=devops, slug='bash',
            defaults={'name': 'Bash', 'description': 'Shell scripting and command line', 'order': 2, 'total_levels': 15}
        )
        self.stdout.write(f'  Topic: {bash_topic.name}')
        
        # ============================================================
        # HTML QUESTIONS (15 Levels × 5 Questions = 75 Questions)
        # ============================================================
        
        html_questions = {
            # Level 1: HTML Basics - Introduction
            1: [
                {'question_type': 'multiple-choice', 'question_text': 'What does HTML stand for?',
                 'options': ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlink Text Mode Language'],
                 'correct_answer': 0, 'explanation': 'HTML stands for Hyper Text Markup Language, used to structure web content.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'Which tag is used to define the main content of an HTML document?',
                 'options': ['<content>', '<main>', '<body>', '<section>'],
                 'correct_answer': 2, 'explanation': 'The <body> tag contains all the visible content of a web page.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Complete the HTML document structure:',
                 'code_snippet': '<!DOCTYPE html>\n<html>\n<head>\n  <title>My Page</title>\n</head>\n<____>\n  <h1>Hello World</h1>\n</____>',
                 'options': ['body', 'main', 'content', 'div'],
                 'correct_answer': 0, 'explanation': 'The <body> tag wraps all visible content in an HTML document.'},
                
                {'question_type': 'find-error', 'question_text': 'Find the error in this HTML:',
                 'code_snippet': '<html>\n<head>\n  <title>My Page<title>\n</head>\n<body>\n  Hello World\n</body>\n</html>',
                 'highlight_line': 3,
                 'options': ['Missing DOCTYPE', 'Unclosed title tag', 'Wrong head tag', 'Missing body content'],
                 'correct_answer': 1, 'explanation': 'The closing tag should be </title>, not <title>.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What is the correct HTML tag for the largest heading?',
                 'options': ['<heading>', '<h6>', '<h1>', '<head>'],
                 'correct_answer': 2, 'explanation': '<h1> is the largest heading, <h6> is the smallest.'},
            ],
            
            # Level 2: Text Elements
            2: [
                {'question_type': 'multiple-choice', 'question_text': 'Which tag is used to create a paragraph?',
                 'options': ['<paragraph>', '<p>', '<para>', '<text>'],
                 'correct_answer': 1, 'explanation': 'The <p> tag defines a paragraph in HTML.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Complete the code to make text bold:',
                 'code_snippet': '<p>This is <____>important</____> text.</p>',
                 'options': ['strong', 'bold', 'b', 'em'],
                 'correct_answer': 0, 'explanation': '<strong> is the semantic tag for important text (displays bold).'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What does the <em> tag do?',
                 'options': ['Creates a line break', 'Emphasizes text (italic)', 'Makes text bold', 'Creates a horizontal line'],
                 'correct_answer': 1, 'explanation': '<em> emphasizes text, typically displayed in italics.'},
                
                {'question_type': 'find-error', 'question_text': 'What is wrong with this code?',
                 'code_snippet': '<p>First paragraph\n<p>Second paragraph</p>',
                 'highlight_line': 1,
                 'options': ['Nothing wrong', 'First <p> tag not closed', 'Wrong tag name', 'Missing DOCTYPE'],
                 'correct_answer': 1, 'explanation': 'Every opening <p> tag needs a closing </p> tag.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'Which tag creates a line break without starting a new paragraph?',
                 'options': ['<break>', '<lb>', '<br>', '<newline>'],
                 'correct_answer': 2, 'explanation': '<br> creates a line break without creating a new paragraph.'},
            ],
            
            # Level 3: Links and Images
            3: [
                {'question_type': 'fill-blank', 'question_text': 'Complete the anchor tag to create a link:',
                 'code_snippet': '<a ____="https://example.com">Visit Site</a>',
                 'options': ['href', 'src', 'link', 'url'],
                 'correct_answer': 0, 'explanation': 'The href attribute specifies the URL destination of a link.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'Which attribute makes a link open in a new tab?',
                 'options': ['new="tab"', 'target="_blank"', 'open="new"', 'window="new"'],
                 'correct_answer': 1, 'explanation': 'target="_blank" opens the link in a new browser tab.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Complete the image tag:',
                 'code_snippet': '<img ____="photo.jpg" alt="A photo">',
                 'options': ['src', 'href', 'source', 'img'],
                 'correct_answer': 0, 'explanation': 'The src attribute specifies the path to the image.'},
                
                {'question_type': 'find-error', 'question_text': 'Find the error:',
                 'code_snippet': '<img src="cat.jpg">\n  Missing something important for accessibility',
                 'highlight_line': 1,
                 'options': ['Missing closing tag', 'Missing alt attribute', 'Wrong attribute name', 'Nothing wrong'],
                 'correct_answer': 1, 'explanation': 'Images should have an alt attribute for accessibility.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What does the alt attribute in an image do?',
                 'options': ['Sets the image size', 'Provides alternative text for accessibility', 'Changes the image style', 'Links to another image'],
                 'correct_answer': 1, 'explanation': 'The alt attribute provides alternative text when the image cannot be displayed.'},
            ],
            
            # Level 4: Lists
            4: [
                {'question_type': 'multiple-choice', 'question_text': 'Which tag creates an unordered (bulleted) list?',
                 'options': ['<list>', '<ul>', '<ol>', '<li>'],
                 'correct_answer': 1, 'explanation': '<ul> creates an unordered list with bullet points.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Complete the numbered list:',
                 'code_snippet': '<____>\n  <li>First item</li>\n  <li>Second item</li>\n</____>',
                 'options': ['ol', 'ul', 'list', 'nl'],
                 'correct_answer': 0, 'explanation': '<ol> creates an ordered (numbered) list.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What does <li> stand for?',
                 'options': ['Line item', 'List item', 'Link item', 'Literal item'],
                 'correct_answer': 1, 'explanation': '<li> stands for list item, used inside <ul> or <ol>.'},
                
                {'question_type': 'find-error', 'question_text': 'What is wrong with this list?',
                 'code_snippet': '<ul>\n  <li>Apple\n  <li>Banana</li>\n  <li>Orange</li>\n</ul>',
                 'highlight_line': 2,
                 'options': ['Missing </ul>', 'First <li> not closed', 'Wrong list type', 'Nothing wrong'],
                 'correct_answer': 1, 'explanation': 'The first <li> tag is missing its closing </li> tag.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'Which creates a description list?',
                 'options': ['<dl>, <dt>, <dd>', '<ul>, <li>', '<ol>, <li>', '<desc>, <item>'],
                 'correct_answer': 0, 'explanation': '<dl> is description list, <dt> is term, <dd> is description.'},
            ],
            
            # Level 5: Tables Basics
            5: [
                {'question_type': 'fill-blank', 'question_text': 'Complete the table structure:',
                 'code_snippet': '<____>\n  <tr>\n    <td>Cell 1</td>\n    <td>Cell 2</td>\n  </tr>\n</____>',
                 'options': ['table', 'grid', 'data', 'tbl'],
                 'correct_answer': 0, 'explanation': '<table> is the container for HTML tables.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What does <tr> represent in a table?',
                 'options': ['Table data', 'Table row', 'Table right', 'Table record'],
                 'correct_answer': 1, 'explanation': '<tr> defines a table row.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'Which tag is used for table header cells?',
                 'options': ['<td>', '<th>', '<thead>', '<header>'],
                 'correct_answer': 1, 'explanation': '<th> defines a header cell, usually bold and centered.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Complete the table cell tag:',
                 'code_snippet': '<tr>\n  <____>Data goes here</____>\n</tr>',
                 'options': ['td', 'tc', 'cell', 'data'],
                 'correct_answer': 0, 'explanation': '<td> stands for table data and contains cell content.'},
                
                {'question_type': 'find-error', 'question_text': 'Find the error in this table:',
                 'code_snippet': '<table>\n  <td>Cell 1</td>\n  <td>Cell 2</td>\n</table>',
                 'highlight_line': 2,
                 'options': ['Missing <thead>', 'Missing <tr> tag', 'Wrong cell tag', 'Table not needed'],
                 'correct_answer': 1, 'explanation': 'Table cells <td> must be wrapped in a table row <tr>.'},
            ],
            
            # Level 6: Forms Basics
            6: [
                {'question_type': 'multiple-choice', 'question_text': 'Which tag is used to create an HTML form?',
                 'options': ['<input>', '<form>', '<submit>', '<field>'],
                 'correct_answer': 1, 'explanation': '<form> is the container for form elements.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Complete the text input field:',
                 'code_snippet': '<input ____="text" name="username">',
                 'options': ['type', 'kind', 'input', 'field'],
                 'correct_answer': 0, 'explanation': 'The type attribute specifies what kind of input to display.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What input type creates a password field?',
                 'options': ['type="hidden"', 'type="password"', 'type="secret"', 'type="secure"'],
                 'correct_answer': 1, 'explanation': 'type="password" creates a field that hides the input.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Complete the form to submit data:',
                 'code_snippet': '<form ____="submit.php" method="post">\n  <input type="text" name="email">\n</form>',
                 'options': ['action', 'target', 'href', 'src'],
                 'correct_answer': 0, 'explanation': 'The action attribute specifies where to send form data.'},
                
                {'question_type': 'find-error', 'question_text': 'What is wrong with this form input?',
                 'code_snippet': '<form>\n  <input type="text">\n  <button>Submit</button>\n</form>',
                 'highlight_line': 2,
                 'options': ['Nothing wrong', 'Missing name attribute', 'Wrong input type', 'Missing form action'],
                 'correct_answer': 1, 'explanation': 'Input fields should have a name attribute to submit data.'},
            ],
            
            # Level 7: Form Elements
            7: [
                {'question_type': 'multiple-choice', 'question_text': 'Which tag creates a dropdown selection list?',
                 'options': ['<dropdown>', '<list>', '<select>', '<choice>'],
                 'correct_answer': 2, 'explanation': '<select> creates a dropdown list with <option> elements.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Complete the textarea for multi-line text:',
                 'code_snippet': '<____  name="message" rows="4" cols="50">Enter your message</____>',
                 'options': ['textarea', 'textbox', 'input', 'multiline'],
                 'correct_answer': 0, 'explanation': '<textarea> creates a multi-line text input field.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What input type creates a checkbox?',
                 'options': ['type="check"', 'type="checkbox"', 'type="tick"', 'type="boolean"'],
                 'correct_answer': 1, 'explanation': 'type="checkbox" creates a checkable box input.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Complete the label to associate with an input:',
                 'code_snippet': '<label ____="email">Email:</label>\n<input type="email" id="email">',
                 'options': ['for', 'id', 'name', 'ref'],
                 'correct_answer': 0, 'explanation': 'The for attribute links a label to an input with matching id.'},
                
                {'question_type': 'find-error', 'question_text': 'Find the error in this radio group:',
                 'code_snippet': '<input type="radio" name="size" value="small"> Small\n<input type="radio" name="color" value="medium"> Medium',
                 'highlight_line': 2,
                 'options': ['Missing labels', 'Different name attributes', 'Wrong input type', 'Missing values'],
                 'correct_answer': 1, 'explanation': 'Radio buttons in the same group must share the same name attribute.'},
            ],
            
            # Level 8: Semantic HTML
            8: [
                {'question_type': 'multiple-choice', 'question_text': 'Which semantic tag represents the main navigation?',
                 'options': ['<navigation>', '<nav>', '<menu>', '<links>'],
                 'correct_answer': 1, 'explanation': '<nav> represents a section of navigation links.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Complete the semantic structure:',
                 'code_snippet': '<____>\n  <h1>Website Title</h1>\n  <nav>Navigation here</nav>\n</____>',
                 'options': ['header', 'head', 'top', 'banner'],
                 'correct_answer': 0, 'explanation': '<header> represents introductory content or navigational aids.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What does the <article> tag represent?',
                 'options': ['A news article only', 'Self-contained content', 'A sidebar', 'The footer'],
                 'correct_answer': 1, 'explanation': '<article> represents self-contained content that could stand alone.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Complete the page footer:',
                 'code_snippet': '<____>\n  <p>&copy; 2024 My Website</p>\n</____>',
                 'options': ['footer', 'bottom', 'end', 'closing'],
                 'correct_answer': 0, 'explanation': '<footer> represents the footer of a document or section.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'Which tag is best for sidebar content?',
                 'options': ['<sidebar>', '<aside>', '<side>', '<secondary>'],
                 'correct_answer': 1, 'explanation': '<aside> represents content tangentially related to the main content.'},
            ],
            
            # Level 9: HTML5 Features
            9: [
                {'question_type': 'multiple-choice', 'question_text': 'Which input type validates email addresses?',
                 'options': ['type="text"', 'type="mail"', 'type="email"', 'type="address"'],
                 'correct_answer': 2, 'explanation': 'type="email" provides built-in email validation.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Complete the date input:',
                 'code_snippet': '<input ____="date" name="birthday">',
                 'options': ['type', 'kind', 'input', 'format'],
                 'correct_answer': 0, 'explanation': 'type="date" creates a date picker input.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'Which attribute makes an input field required?',
                 'options': ['mandatory', 'required', 'needed', 'must'],
                 'correct_answer': 1, 'explanation': 'The required attribute ensures the field must be filled before submission.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Add placeholder text to an input:',
                 'code_snippet': '<input type="text" ____="Enter your name">',
                 'options': ['placeholder', 'hint', 'default', 'preview'],
                 'correct_answer': 0, 'explanation': 'The placeholder attribute shows hint text inside the input.'},
                
                {'question_type': 'find-error', 'question_text': 'Find the error in this range input:',
                 'code_snippet': '<input type="range" min="0" max="100" value="150">',
                 'highlight_line': 1,
                 'options': ['Wrong type', 'Value exceeds max', 'Missing name', 'Nothing wrong'],
                 'correct_answer': 1, 'explanation': 'The value (150) is greater than the max (100), which is invalid.'},
            ],
            
            # Level 10: Multimedia
            10: [
                {'question_type': 'fill-blank', 'question_text': 'Complete the video element:',
                 'code_snippet': '<____ controls>\n  <source src="movie.mp4" type="video/mp4">\n</____>',
                 'options': ['video', 'media', 'movie', 'player'],
                 'correct_answer': 0, 'explanation': '<video> embeds video content with optional controls.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What attribute adds playback controls to video?',
                 'options': ['buttons', 'controls', 'player', 'toolbar'],
                 'correct_answer': 1, 'explanation': 'The controls attribute adds play, pause, and other controls.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Complete the audio element:',
                 'code_snippet': '<____ src="song.mp3" controls></____>',
                 'options': ['audio', 'sound', 'music', 'player'],
                 'correct_answer': 0, 'explanation': '<audio> embeds audio content in a web page.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'Which attribute makes a video loop continuously?',
                 'options': ['repeat', 'loop', 'continuous', 'forever'],
                 'correct_answer': 1, 'explanation': 'The loop attribute makes the media play repeatedly.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What does the autoplay attribute do?',
                 'options': ['Plays only on click', 'Starts playing automatically', 'Shows play button', 'Downloads the file'],
                 'correct_answer': 1, 'explanation': 'autoplay makes the media start playing when the page loads.'},
            ],
            
            # Level 11: Canvas and SVG
            11: [
                {'question_type': 'multiple-choice', 'question_text': 'Which element is used for drawing graphics via JavaScript?',
                 'options': ['<graphics>', '<draw>', '<canvas>', '<paint>'],
                 'correct_answer': 2, 'explanation': '<canvas> provides a drawable region for JavaScript graphics.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Complete the canvas element:',
                 'code_snippet': '<____ id="myCanvas" width="500" height="400"></____>',
                 'options': ['canvas', 'draw', 'graphics', 'img'],
                 'correct_answer': 0, 'explanation': '<canvas> creates a bitmap drawing surface.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What does SVG stand for?',
                 'options': ['Simple Vector Graphics', 'Scalable Vector Graphics', 'Standard Visual Graphics', 'Styled Vector Graphics'],
                 'correct_answer': 1, 'explanation': 'SVG stands for Scalable Vector Graphics.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Draw a circle in SVG:',
                 'code_snippet': '<svg>\n  <____ cx="50" cy="50" r="40" fill="red"/>\n</svg>',
                 'options': ['circle', 'round', 'oval', 'dot'],
                 'correct_answer': 0, 'explanation': '<circle> draws a circle with cx, cy (center) and r (radius).'},
                
                {'question_type': 'multiple-choice', 'question_text': 'Which SVG element draws a rectangle?',
                 'options': ['<rectangle>', '<rect>', '<box>', '<square>'],
                 'correct_answer': 1, 'explanation': '<rect> draws rectangles with x, y, width, and height attributes.'},
            ],
            
            # Level 12: Meta and SEO
            12: [
                {'question_type': 'fill-blank', 'question_text': 'Complete the meta description for SEO:',
                 'code_snippet': '<meta ____="description" content="A great website about coding">',
                 'options': ['name', 'type', 'id', 'meta'],
                 'correct_answer': 0, 'explanation': 'Meta tags use name to specify the type of metadata.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'Which meta tag sets the character encoding?',
                 'options': ['<meta name="encoding">', '<meta charset="UTF-8">', '<meta type="text">', '<meta encode="UTF-8">'],
                 'correct_answer': 1, 'explanation': '<meta charset="UTF-8"> sets the character encoding for the page.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Make the page responsive on mobile:',
                 'code_snippet': '<meta name="____" content="width=device-width, initial-scale=1">',
                 'options': ['viewport', 'mobile', 'responsive', 'screen'],
                 'correct_answer': 0, 'explanation': 'The viewport meta tag controls layout on mobile browsers.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What does the lang attribute on <html> do?',
                 'options': ['Sets programming language', 'Specifies page language for accessibility/SEO', 'Changes font', 'Sets text direction'],
                 'correct_answer': 1, 'explanation': 'The lang attribute helps search engines and accessibility tools.'},
                
                {'question_type': 'find-error', 'question_text': 'Find the error in this head section:',
                 'code_snippet': '<head>\n  <title>My Site</title>\n  <meta description="A website">\n</head>',
                 'highlight_line': 3,
                 'options': ['Nothing wrong', 'Meta missing name attribute', 'Title wrong', 'Missing charset'],
                 'correct_answer': 1, 'explanation': 'Meta should be <meta name="description" content="...">'},
            ],
            
            # Level 13: Accessibility (a11y)
            13: [
                {'question_type': 'multiple-choice', 'question_text': 'What does ARIA stand for?',
                 'options': ['Accessible Rich Internet Applications', 'Advanced Rendering Internet Apps', 'Automated Reading Interface API', 'Accessible Responsive Image Attributes'],
                 'correct_answer': 0, 'explanation': 'ARIA provides accessibility information for assistive technologies.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Add a label for screen readers:',
                 'code_snippet': '<button ____-label="Close menu">X</button>',
                 'options': ['aria', 'a11y', 'screen', 'voice'],
                 'correct_answer': 0, 'explanation': 'aria-label provides an accessible name for screen readers.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'Which attribute defines an element\'s role for assistive tech?',
                 'options': ['type', 'role', 'aria-type', 'a11y'],
                 'correct_answer': 1, 'explanation': 'The role attribute defines the type of UI element.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Mark a navigation as the main navigation:',
                 'code_snippet': '<nav aria-____="Main navigation">\n  ...\n</nav>',
                 'options': ['label', 'name', 'title', 'desc'],
                 'correct_answer': 0, 'explanation': 'aria-label describes the purpose of the element.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What is the purpose of tabindex="0"?',
                 'options': ['Removes from tab order', 'Makes element focusable via tab', 'Sets tab size', 'First in tab order'],
                 'correct_answer': 1, 'explanation': 'tabindex="0" makes an element focusable in the natural tab order.'},
            ],
            
            # Level 14: Advanced Forms
            14: [
                {'question_type': 'fill-blank', 'question_text': 'Create a datalist for autocomplete suggestions:',
                 'code_snippet': '<input list="browsers">\n<____ id="browsers">\n  <option value="Chrome">\n  <option value="Firefox">\n</____>',
                 'options': ['datalist', 'list', 'options', 'select'],
                 'correct_answer': 0, 'explanation': '<datalist> provides autocomplete suggestions for an input.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'Which attribute limits file types in file upload?',
                 'options': ['type', 'accept', 'allow', 'filter'],
                 'correct_answer': 1, 'explanation': 'accept specifies allowed file types, e.g., accept="image/*"'},
                
                {'question_type': 'fill-blank', 'question_text': 'Set minimum and maximum values:',
                 'code_snippet': '<input type="number" ____="1" max="100" value="50">',
                 'options': ['min', 'minimum', 'low', 'start'],
                 'correct_answer': 0, 'explanation': 'min and max attributes set the allowed range for number inputs.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What does the pattern attribute do?',
                 'options': ['Sets visual pattern', 'Validates input with regex', 'Creates a pattern background', 'Formats the input'],
                 'correct_answer': 1, 'explanation': 'pattern specifies a regular expression for input validation.'},
                
                {'question_type': 'find-error', 'question_text': 'Find the error in this fieldset:',
                 'code_snippet': '<fieldset>\n  <input type="text" name="name">\n  <input type="email" name="email">\n</fieldset>',
                 'highlight_line': 1,
                 'options': ['Missing legend', 'Wrong tag', 'Missing form', 'Nothing wrong'],
                 'correct_answer': 0, 'explanation': 'Fieldsets should include a <legend> to describe the group.'},
            ],
            
            # Level 15: HTML APIs and Advanced
            15: [
                {'question_type': 'multiple-choice', 'question_text': 'Which API allows storing data in the browser?',
                 'options': ['CacheAPI', 'LocalStorage', 'FileAPI', 'DatabaseAPI'],
                 'correct_answer': 1, 'explanation': 'LocalStorage stores key-value pairs persistently in the browser.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Make content editable:',
                 'code_snippet': '<div ____="true">Click to edit this text</div>',
                 'options': ['contenteditable', 'editable', 'edit', 'writable'],
                 'correct_answer': 0, 'explanation': 'contenteditable="true" makes content directly editable.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'Which attribute enables drag and drop?',
                 'options': ['movable', 'draggable', 'dragdrop', 'moveable'],
                 'correct_answer': 1, 'explanation': 'draggable="true" enables drag and drop functionality.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Create a collapsible section:',
                 'code_snippet': '<____>\n  <summary>Click to expand</summary>\n  <p>Hidden content here</p>\n</____>',
                 'options': ['details', 'collapse', 'expand', 'accordion'],
                 'correct_answer': 0, 'explanation': '<details> creates a collapsible section with <summary>.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What does the <template> tag do?',
                 'options': ['Displays template text', 'Holds content that is not rendered until used', 'Creates a form template', 'Styles the page'],
                 'correct_answer': 1, 'explanation': '<template> holds HTML that is not rendered until activated by JavaScript.'},
            ],
        }
        
        # ============================================================
        # PYTHON QUESTIONS (15 Levels × 5 Questions = 75 Questions)
        # ============================================================
        
        python_questions = {
            # Level 1: Python Basics
            1: [
                {'question_type': 'multiple-choice', 'question_text': 'How do you print "Hello" in Python?',
                 'options': ['echo("Hello")', 'print("Hello")', 'console.log("Hello")', 'printf("Hello")'],
                 'correct_answer': 1, 'explanation': 'print() is the function used to output text in Python.'},
                
                {'question_type': 'output', 'question_text': 'What is the output of this code?',
                 'code_snippet': 'x = 5\ny = 3\nprint(x + y)',
                 'options': ['53', '8', 'x + y', 'Error'],
                 'correct_answer': 1, 'explanation': '5 + 3 equals 8, which is printed.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Complete the variable assignment:',
                 'code_snippet': 'name ____ "Alice"\nprint(name)',
                 'options': ['=', '==', ':=', '->'],
                 'correct_answer': 0, 'explanation': 'Single = is used for assignment in Python.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'Which is NOT a valid variable name in Python?',
                 'options': ['my_var', '_count', '2ndPlace', 'firstName'],
                 'correct_answer': 2, 'explanation': 'Variable names cannot start with a number.'},
                
                {'question_type': 'find-error', 'question_text': 'Find the error in this code:',
                 'code_snippet': 'message = "Hello World\nprint(message)',
                 'highlight_line': 1,
                 'options': ['Missing closing quote', 'Wrong print syntax', 'Invalid variable name', 'Nothing wrong'],
                 'correct_answer': 0, 'explanation': 'The string is missing its closing quotation mark.'},
            ],
            
            # Level 2: Data Types
            2: [
                {'question_type': 'multiple-choice', 'question_text': 'What is the data type of 3.14?',
                 'options': ['int', 'float', 'double', 'decimal'],
                 'correct_answer': 1, 'explanation': 'Decimal numbers in Python are of type float.'},
                
                {'question_type': 'output', 'question_text': 'What is the output?',
                 'code_snippet': 'print(type(True))',
                 'options': ["<class 'bool'>", "<class 'int'>", "True", "<class 'boolean'>"],
                 'correct_answer': 0, 'explanation': 'True is a boolean value, so type() returns bool.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Convert a string to an integer:',
                 'code_snippet': 'age = "25"\nage_num = ____(age)\nprint(age_num + 5)',
                 'options': ['int', 'str', 'float', 'num'],
                 'correct_answer': 0, 'explanation': 'int() converts a string to an integer.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'Which creates an empty list?',
                 'options': ['list = {}', 'list = []', 'list = ()', 'list = ""'],
                 'correct_answer': 1, 'explanation': 'Square brackets [] create an empty list.'},
                
                {'question_type': 'output', 'question_text': 'What does this print?',
                 'code_snippet': 'x = "5"\ny = "3"\nprint(x + y)',
                 'options': ['8', '53', 'Error', '5 3'],
                 'correct_answer': 1, 'explanation': 'String concatenation joins "5" and "3" to make "53".'},
            ],
            
            # Level 3: Strings
            3: [
                {'question_type': 'fill-blank', 'question_text': 'Get the length of a string:',
                 'code_snippet': 'message = "Hello"\nprint(____(message))',
                 'options': ['len', 'length', 'size', 'count'],
                 'correct_answer': 0, 'explanation': 'len() returns the length of a string.'},
                
                {'question_type': 'output', 'question_text': 'What is the output?',
                 'code_snippet': 'word = "Python"\nprint(word[0])',
                 'options': ['P', 'Python', 'y', '0'],
                 'correct_answer': 0, 'explanation': 'Index 0 gives the first character, which is "P".'},
                
                {'question_type': 'multiple-choice', 'question_text': 'Which method converts a string to uppercase?',
                 'options': ['.uppercase()', '.toUpper()', '.upper()', '.caps()'],
                 'correct_answer': 2, 'explanation': '.upper() converts all characters to uppercase.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Use an f-string to include a variable:',
                 'code_snippet': 'name = "Alice"\nprint(____"Hello, {name}!")',
                 'options': ['f', '$', '@', '#'],
                 'correct_answer': 0, 'explanation': 'f-strings start with f and allow {variable} interpolation.'},
                
                {'question_type': 'output', 'question_text': 'What does this print?',
                 'code_snippet': 'text = "Hello World"\nprint(text[6:11])',
                 'options': ['World', 'Hello', 'o Wor', ' Worl'],
                 'correct_answer': 0, 'explanation': 'Slicing from index 6 to 11 extracts "World".'},
            ],
            
            # Level 4: Lists
            4: [
                {'question_type': 'fill-blank', 'question_text': 'Add an item to a list:',
                 'code_snippet': 'fruits = ["apple", "banana"]\nfruits.____(\"orange\")\nprint(fruits)',
                 'options': ['append', 'add', 'push', 'insert'],
                 'correct_answer': 0, 'explanation': '.append() adds an item to the end of a list.'},
                
                {'question_type': 'output', 'question_text': 'What is the output?',
                 'code_snippet': 'nums = [1, 2, 3, 4, 5]\nprint(nums[-1])',
                 'options': ['1', '5', '-1', 'Error'],
                 'correct_answer': 1, 'explanation': 'Negative index -1 accesses the last element, which is 5.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'Which removes and returns the last item?',
                 'options': ['remove()', 'pop()', 'delete()', 'drop()'],
                 'correct_answer': 1, 'explanation': '.pop() removes and returns the last item from a list.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Get the number of items in a list:',
                 'code_snippet': 'items = [1, 2, 3, 4]\ncount = ____(items)\nprint(count)',
                 'options': ['len', 'count', 'size', 'length'],
                 'correct_answer': 0, 'explanation': 'len() returns the number of items in a list.'},
                
                {'question_type': 'output', 'question_text': 'What does this print?',
                 'code_snippet': 'a = [1, 2, 3]\nb = a\nb.append(4)\nprint(a)',
                 'options': ['[1, 2, 3]', '[1, 2, 3, 4]', '[4]', 'Error'],
                 'correct_answer': 1, 'explanation': 'b = a creates a reference, so both point to the same list.'},
            ],
            
            # Level 5: Conditionals
            5: [
                {'question_type': 'fill-blank', 'question_text': 'Complete the if statement:',
                 'code_snippet': 'age = 18\n____ age >= 18:\n    print("Adult")',
                 'options': ['if', 'when', 'check', 'condition'],
                 'correct_answer': 0, 'explanation': 'if is used to start a conditional statement.'},
                
                {'question_type': 'output', 'question_text': 'What is the output?',
                 'code_snippet': 'x = 10\nif x > 5:\n    print("Big")\nelse:\n    print("Small")',
                 'options': ['Big', 'Small', 'Error', 'Nothing'],
                 'correct_answer': 0, 'explanation': '10 > 5 is True, so "Big" is printed.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'Which keyword is used for "else if" in Python?',
                 'options': ['else if', 'elseif', 'elif', 'elsif'],
                 'correct_answer': 2, 'explanation': 'Python uses elif for "else if" conditions.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Complete the comparison:',
                 'code_snippet': 'a = 5\nb = 5\nif a ____ b:\n    print("Equal")',
                 'options': ['==', '=', '===', 'eq'],
                 'correct_answer': 0, 'explanation': '== is the equality comparison operator.'},
                
                {'question_type': 'find-error', 'question_text': 'Find the error:',
                 'code_snippet': 'score = 85\nif score >= 90\n    print("A")\nelse:\n    print("B")',
                 'highlight_line': 2,
                 'options': ['Missing colon after condition', 'Wrong operator', 'Indentation error', 'Nothing wrong'],
                 'correct_answer': 0, 'explanation': 'The if statement is missing a colon at the end.'},
            ],
            
            # Level 6: Loops
            6: [
                {'question_type': 'fill-blank', 'question_text': 'Complete the for loop:',
                 'code_snippet': '____ i in range(5):\n    print(i)',
                 'options': ['for', 'foreach', 'loop', 'iterate'],
                 'correct_answer': 0, 'explanation': 'for is used to iterate over sequences in Python.'},
                
                {'question_type': 'output', 'question_text': 'What numbers are printed?',
                 'code_snippet': 'for i in range(3):\n    print(i)',
                 'options': ['1 2 3', '0 1 2', '0 1 2 3', '1 2'],
                 'correct_answer': 1, 'explanation': 'range(3) generates 0, 1, 2.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'Which loop runs while a condition is true?',
                 'options': ['for', 'while', 'do', 'until'],
                 'correct_answer': 1, 'explanation': 'while loops continue as long as the condition is True.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Exit a loop early:',
                 'code_snippet': 'for i in range(10):\n    if i == 5:\n        ____\n    print(i)',
                 'options': ['break', 'stop', 'exit', 'return'],
                 'correct_answer': 0, 'explanation': 'break exits the loop immediately.'},
                
                {'question_type': 'output', 'question_text': 'What is printed?',
                 'code_snippet': 'x = 0\nwhile x < 3:\n    x += 1\nprint(x)',
                 'options': ['0', '2', '3', '4'],
                 'correct_answer': 2, 'explanation': 'The loop runs while x < 3, and x becomes 3 when the loop exits.'},
            ],
            
            # Level 7: Functions
            7: [
                {'question_type': 'fill-blank', 'question_text': 'Define a function:',
                 'code_snippet': '____ greet(name):\n    print(f"Hello, {name}!")\n\ngreet("Alice")',
                 'options': ['def', 'function', 'fn', 'func'],
                 'correct_answer': 0, 'explanation': 'def is used to define functions in Python.'},
                
                {'question_type': 'output', 'question_text': 'What is the output?',
                 'code_snippet': 'def add(a, b):\n    return a + b\n\nresult = add(3, 4)\nprint(result)',
                 'options': ['34', '7', 'None', 'Error'],
                 'correct_answer': 1, 'explanation': 'The function returns 3 + 4 = 7.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What does return do in a function?',
                 'options': ['Prints a value', 'Exits the program', 'Sends a value back to the caller', 'Creates a loop'],
                 'correct_answer': 2, 'explanation': 'return sends a value back to where the function was called.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Set a default parameter value:',
                 'code_snippet': 'def greet(name____"Guest"):\n    print(f"Hello, {name}!")',
                 'options': ['=', ':', '==', '->'],
                 'correct_answer': 0, 'explanation': '= is used to set default parameter values.'},
                
                {'question_type': 'find-error', 'question_text': 'Find the error:',
                 'code_snippet': 'def multiply(a, b):\n    a * b\n\nprint(multiply(3, 4))',
                 'highlight_line': 2,
                 'options': ['Missing return statement', 'Wrong operator', 'Missing colon', 'Nothing wrong'],
                 'correct_answer': 0, 'explanation': 'The function calculates but does not return the result.'},
            ],
            
            # Level 8: Dictionaries
            8: [
                {'question_type': 'fill-blank', 'question_text': 'Create a dictionary:',
                 'code_snippet': 'person = ____"name": "Alice", "age": 25____',
                 'options': ['{, }', '[, ]', '(, )', '<, >'],
                 'correct_answer': 0, 'explanation': 'Dictionaries use curly braces {} with key: value pairs.'},
                
                {'question_type': 'output', 'question_text': 'What is the output?',
                 'code_snippet': 'data = {"a": 1, "b": 2}\nprint(data["a"])',
                 'options': ['a', '1', '{"a": 1}', 'Error'],
                 'correct_answer': 1, 'explanation': 'data["a"] retrieves the value associated with key "a".'},
                
                {'question_type': 'multiple-choice', 'question_text': 'Which method returns all keys in a dictionary?',
                 'options': ['.items()', '.keys()', '.values()', '.all()'],
                 'correct_answer': 1, 'explanation': '.keys() returns a view of all dictionary keys.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Get a value with a default:',
                 'code_snippet': 'scores = {"math": 90}\nprint(scores.____(\"science\", 0))',
                 'options': ['get', 'find', 'fetch', 'retrieve'],
                 'correct_answer': 0, 'explanation': '.get() returns the value or a default if key not found.'},
                
                {'question_type': 'output', 'question_text': 'What does this print?',
                 'code_snippet': 'd = {"x": 10}\nd["y"] = 20\nprint(len(d))',
                 'options': ['1', '2', '30', 'Error'],
                 'correct_answer': 1, 'explanation': 'After adding "y", the dictionary has 2 key-value pairs.'},
            ],
            
            # Level 9: File Handling
            9: [
                {'question_type': 'fill-blank', 'question_text': 'Open a file for reading:',
                 'code_snippet': 'with ____(\"data.txt\", \"r\") as f:\n    content = f.read()',
                 'options': ['open', 'file', 'read', 'load'],
                 'correct_answer': 0, 'explanation': 'open() is used to open files in Python.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What mode is used to write to a file?',
                 'options': ['"r"', '"w"', '"a"', '"x"'],
                 'correct_answer': 1, 'explanation': '"w" opens a file for writing (overwrites existing content).'},
                
                {'question_type': 'fill-blank', 'question_text': 'Read all lines into a list:',
                 'code_snippet': 'with open("file.txt", "r") as f:\n    lines = f.____()',
                 'options': ['readlines', 'read', 'getlines', 'lines'],
                 'correct_answer': 0, 'explanation': '.readlines() returns all lines as a list.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What does "a" mode do when opening a file?',
                 'options': ['Reads the file', 'Writes and overwrites', 'Appends to the end', 'Creates only if not exists'],
                 'correct_answer': 2, 'explanation': '"a" mode appends data to the end of the file.'},
                
                {'question_type': 'find-error', 'question_text': 'Find the issue:',
                 'code_snippet': 'f = open("data.txt", "r")\ncontent = f.read()\nprint(content)',
                 'highlight_line': 3,
                 'options': ['File not closed properly', 'Wrong read method', 'Invalid mode', 'Nothing wrong'],
                 'correct_answer': 0, 'explanation': 'The file should be closed with f.close() or use a with statement.'},
            ],
            
            # Level 10: Error Handling
            10: [
                {'question_type': 'fill-blank', 'question_text': 'Catch an exception:',
                 'code_snippet': 'try:\n    result = 10 / 0\n____ ZeroDivisionError:\n    print("Cannot divide by zero")',
                 'options': ['except', 'catch', 'handle', 'error'],
                 'correct_answer': 0, 'explanation': 'except is used to catch exceptions in Python.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'Which block runs regardless of an error?',
                 'options': ['else', 'except', 'finally', 'always'],
                 'correct_answer': 2, 'explanation': 'finally always executes, whether an exception occurred or not.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Raise a custom exception:',
                 'code_snippet': 'age = -5\nif age < 0:\n    ____ ValueError("Age cannot be negative")',
                 'options': ['raise', 'throw', 'error', 'except'],
                 'correct_answer': 0, 'explanation': 'raise is used to throw exceptions in Python.'},
                
                {'question_type': 'output', 'question_text': 'What is printed?',
                 'code_snippet': 'try:\n    x = int("abc")\nexcept:\n    print("Error")\nelse:\n    print("Success")',
                 'options': ['Error', 'Success', 'abc', 'Nothing'],
                 'correct_answer': 0, 'explanation': 'Converting "abc" to int raises ValueError, so "Error" is printed.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What type of error is accessing index 10 in a 5-element list?',
                 'options': ['ValueError', 'TypeError', 'IndexError', 'KeyError'],
                 'correct_answer': 2, 'explanation': 'IndexError is raised when a list index is out of range.'},
            ],
            
            # Level 11: List Comprehensions
            11: [
                {'question_type': 'output', 'question_text': 'What is the output?',
                 'code_snippet': 'nums = [x * 2 for x in range(4)]\nprint(nums)',
                 'options': ['[0, 1, 2, 3]', '[2, 4, 6, 8]', '[0, 2, 4, 6]', '[1, 2, 3, 4]'],
                 'correct_answer': 2, 'explanation': 'Each x (0,1,2,3) is multiplied by 2: [0,2,4,6].'},
                
                {'question_type': 'fill-blank', 'question_text': 'Filter even numbers:',
                 'code_snippet': 'nums = [1, 2, 3, 4, 5, 6]\nevens = [x for x in nums ____ x % 2 == 0]',
                 'options': ['if', 'when', 'where', 'filter'],
                 'correct_answer': 0, 'explanation': 'if is used to filter items in list comprehensions.'},
                
                {'question_type': 'output', 'question_text': 'What does this create?',
                 'code_snippet': 'words = ["hi", "bye"]\nupper = [w.upper() for w in words]\nprint(upper)',
                 'options': ["['HI', 'BYE']", "['hi', 'bye']", "['Hi', 'Bye']", 'Error'],
                 'correct_answer': 0, 'explanation': '.upper() converts each word to uppercase.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What does {x: x**2 for x in range(3)} create?',
                 'options': ['A list', 'A tuple', 'A dictionary', 'A set'],
                 'correct_answer': 2, 'explanation': 'Using key: value syntax inside {} creates a dictionary.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Create a set comprehension:',
                 'code_snippet': 'nums = [1, 2, 2, 3, 3, 3]\nunique = ____x for x in nums____',
                 'options': ['{, }', '[, ]', '(, )', '<, >'],
                 'correct_answer': 0, 'explanation': 'Set comprehensions use curly braces {} without colons.'},
            ],
            
            # Level 12: Classes and OOP
            12: [
                {'question_type': 'fill-blank', 'question_text': 'Define a class:',
                 'code_snippet': '____ Dog:\n    def __init__(self, name):\n        self.name = name',
                 'options': ['class', 'def', 'object', 'type'],
                 'correct_answer': 0, 'explanation': 'class keyword is used to define classes in Python.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What is __init__ in a class?',
                 'options': ['A destructor', 'A constructor', 'A decorator', 'A module'],
                 'correct_answer': 1, 'explanation': '__init__ is the constructor method, called when creating an instance.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Access instance attribute:',
                 'code_snippet': 'class Car:\n    def __init__(self, brand):\n        ____.brand = brand',
                 'options': ['self', 'this', 'me', 'instance'],
                 'correct_answer': 0, 'explanation': 'self refers to the instance and is used to access its attributes.'},
                
                {'question_type': 'output', 'question_text': 'What is printed?',
                 'code_snippet': 'class Counter:\n    count = 0\n    def __init__(self):\n        Counter.count += 1\n\na = Counter()\nb = Counter()\nprint(Counter.count)',
                 'options': ['0', '1', '2', 'Error'],
                 'correct_answer': 2, 'explanation': 'count is a class variable incremented each time an instance is created.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'How do you inherit from a parent class?',
                 'options': ['class Child extends Parent:', 'class Child(Parent):', 'class Child inherits Parent:', 'class Child : Parent'],
                 'correct_answer': 1, 'explanation': 'Python uses class Child(Parent): syntax for inheritance.'},
            ],
            
            # Level 13: Modules and Imports
            13: [
                {'question_type': 'fill-blank', 'question_text': 'Import a module:',
                 'code_snippet': '____ math\nprint(math.sqrt(16))',
                 'options': ['import', 'include', 'require', 'use'],
                 'correct_answer': 0, 'explanation': 'import is used to load modules in Python.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What does "from math import sqrt" do?',
                 'options': ['Imports all of math', 'Imports only sqrt function', 'Creates a math alias', 'Errors out'],
                 'correct_answer': 1, 'explanation': 'This imports only the sqrt function from the math module.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Import with an alias:',
                 'code_snippet': 'import pandas ____ pd\ndf = pd.DataFrame()',
                 'options': ['as', 'alias', 'name', 'called'],
                 'correct_answer': 0, 'explanation': 'as creates an alias for the imported module.'},
                
                {'question_type': 'output', 'question_text': 'What is printed?',
                 'code_snippet': 'from random import randint\nimport random\nrandom.seed(42)\nprint(randint(1, 1))',
                 'options': ['42', '1', 'Random number', 'Error'],
                 'correct_answer': 1, 'explanation': 'randint(1, 1) can only return 1 since min equals max.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What does if __name__ == "__main__": check?',
                 'options': ['If the module is installed', 'If the script is run directly', 'If main function exists', 'If there are errors'],
                 'correct_answer': 1, 'explanation': 'This checks if the script is being run directly, not imported.'},
            ],
            
            # Level 14: Lambda and Higher-Order Functions
            14: [
                {'question_type': 'fill-blank', 'question_text': 'Create a lambda function:',
                 'code_snippet': 'square = ____ x: x ** 2\nprint(square(5))',
                 'options': ['lambda', 'func', 'def', 'fn'],
                 'correct_answer': 0, 'explanation': 'lambda creates anonymous functions in Python.'},
                
                {'question_type': 'output', 'question_text': 'What is the output?',
                 'code_snippet': 'nums = [1, 2, 3, 4]\nresult = list(map(lambda x: x * 2, nums))\nprint(result)',
                 'options': ['[1, 2, 3, 4]', '[2, 4, 6, 8]', '8', 'Error'],
                 'correct_answer': 1, 'explanation': 'map applies the lambda to each element, doubling them.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Filter a list:',
                 'code_snippet': 'nums = [1, 2, 3, 4, 5]\nevens = list(____(lambda x: x % 2 == 0, nums))',
                 'options': ['filter', 'select', 'where', 'find'],
                 'correct_answer': 0, 'explanation': 'filter() keeps elements where the function returns True.'},
                
                {'question_type': 'output', 'question_text': 'What does this print?',
                 'code_snippet': 'from functools import reduce\nnums = [1, 2, 3, 4]\nresult = reduce(lambda a, b: a + b, nums)\nprint(result)',
                 'options': ['[1, 2, 3, 4]', '10', '4', 'Error'],
                 'correct_answer': 1, 'explanation': 'reduce combines all elements: 1+2+3+4 = 10.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What does sorted(items, key=len) sort by?',
                 'options': ['Alphabetically', 'By length', 'Numerically', 'Randomly'],
                 'correct_answer': 1, 'explanation': 'key=len sorts items by their length.'},
            ],
            
            # Level 15: Decorators and Advanced
            15: [
                {'question_type': 'fill-blank', 'question_text': 'Apply a decorator:',
                 'code_snippet': '____my_decorator\ndef say_hello():\n    print("Hello!")',
                 'options': ['@', '#', '$', '&'],
                 'correct_answer': 0, 'explanation': '@ symbol is used to apply decorators in Python.'},
                
                {'question_type': 'output', 'question_text': 'What is the output?',
                 'code_snippet': 'def add_star(func):\n    def wrapper():\n        return "*" + func() + "*"\n    return wrapper\n\n@add_star\ndef greet():\n    return "Hi"\n\nprint(greet())',
                 'options': ['Hi', '*Hi*', 'greet', 'Error'],
                 'correct_answer': 1, 'explanation': 'The decorator wraps "Hi" with asterisks.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What are *args used for?',
                 'options': ['Keyword arguments', 'Variable number of positional arguments', 'Required arguments', 'Default arguments'],
                 'correct_answer': 1, 'explanation': '*args allows passing a variable number of positional arguments.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Accept any keyword arguments:',
                 'code_snippet': 'def func(____kwargs):\n    for k, v in kwargs.items():\n        print(f"{k}: {v}")',
                 'options': ['**', '*', '&', '@@'],
                 'correct_answer': 0, 'explanation': '**kwargs accepts any keyword arguments as a dictionary.'},
                
                {'question_type': 'output', 'question_text': 'What is printed?',
                 'code_snippet': 'def outer():\n    x = 1\n    def inner():\n        nonlocal x\n        x += 1\n        return x\n    return inner()\n\nprint(outer())',
                 'options': ['1', '2', 'Error', 'None'],
                 'correct_answer': 1, 'explanation': 'nonlocal allows inner to modify x from outer, result is 2.'},
            ],
        }
        
        # ============================================================
        # SEED THE QUESTIONS
        # ============================================================
        
        # Seed HTML questions
        self.stdout.write('\nSeeding HTML questions...')
        for level, questions in html_questions.items():
            for order, q in enumerate(questions, 1):
                Question.objects.create(
                    topic=html_topic,
                    level=level,
                    question_type=q['question_type'],
                    question_text=q['question_text'],
                    code_snippet=q.get('code_snippet', ''),
                    highlight_line=q.get('highlight_line'),
                    options=q['options'],
                    correct_answer=q['correct_answer'],
                    explanation=q['explanation'],
                    order=order
                )
            self.stdout.write(f'  Level {level}: {len(questions)} questions')
        
        # Seed Python questions
        self.stdout.write('\nSeeding Python questions...')
        for level, questions in python_questions.items():
            for order, q in enumerate(questions, 1):
                Question.objects.create(
                    topic=py_topic,
                    level=level,
                    question_type=q['question_type'],
                    question_text=q['question_text'],
                    code_snippet=q.get('code_snippet', ''),
                    highlight_line=q.get('highlight_line'),
                    options=q['options'],
                    correct_answer=q['correct_answer'],
                    explanation=q['explanation'],
                    order=order
                )
            self.stdout.write(f'  Level {level}: {len(questions)} questions')
        
        # ============================================================
        # JAVASCRIPT QUESTIONS (15 Levels × 5 Questions = 75 Questions)
        # ============================================================
        
        js_questions = {
            # Level 1: JavaScript Basics
            1: [
                {'question_type': 'multiple-choice', 'question_text': 'What is JavaScript primarily used for?',
                 'options': ['Styling web pages', 'Adding interactivity to websites', 'Creating databases', 'Designing layouts'],
                 'correct_answer': 1, 'explanation': 'JavaScript adds interactivity and dynamic behavior to websites.'},
                
                {'question_type': 'output', 'question_text': 'What will this code output?',
                 'code_snippet': 'console.log("Hello, World!");',
                 'options': ['Hello, World!', 'hello, world!', 'Error', 'undefined'],
                 'correct_answer': 0, 'explanation': 'console.log() prints the string exactly as written.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Complete the code to print a message:',
                 'code_snippet': '____.____(\"Welcome!\");',
                 'options': ['console.log', 'print.out', 'document.write', 'window.alert'],
                 'correct_answer': 0, 'explanation': 'console.log() is the standard way to print to the console.'},
                
                {'question_type': 'find-error', 'question_text': 'Find the error in this code:',
                 'code_snippet': 'console.log("Hello World)',
                 'highlight_line': 1,
                 'options': ['Missing semicolon', 'Missing closing quote', 'Wrong function name', 'Nothing is wrong'],
                 'correct_answer': 1, 'explanation': 'The string is missing its closing quotation mark.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'Where is JavaScript code typically placed in HTML?',
                 'options': ['<style> tag', '<script> tag', '<js> tag', '<code> tag'],
                 'correct_answer': 1, 'explanation': 'JavaScript code is placed inside <script> tags in HTML.'},
            ],
            
            # Level 2: Variables
            2: [
                {'question_type': 'fill-blank', 'question_text': 'Declare a variable that cannot be reassigned:',
                 'code_snippet': '____ PI = 3.14159;\nconsole.log(PI);',
                 'options': ['const', 'let', 'var', 'fixed'],
                 'correct_answer': 0, 'explanation': 'const declares a constant that cannot be reassigned.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What is the difference between let and var?',
                 'options': ['let is function-scoped, var is block-scoped', 'let is block-scoped, var is function-scoped', 'They are identical', 'var cannot be reassigned'],
                 'correct_answer': 1, 'explanation': 'let is block-scoped while var is function-scoped.'},
                
                {'question_type': 'output', 'question_text': 'What is the output?',
                 'code_snippet': 'let x = 10;\nlet y = 5;\nconsole.log(x + y);',
                 'options': ['105', '15', 'x + y', 'Error'],
                 'correct_answer': 1, 'explanation': '10 + 5 equals 15.'},
                
                {'question_type': 'find-error', 'question_text': 'Find the error:',
                 'code_snippet': 'const name = "Alice";\nname = "Bob";\nconsole.log(name);',
                 'highlight_line': 2,
                 'options': ['Cannot reassign const', 'Missing semicolon', 'Invalid variable name', 'Nothing wrong'],
                 'correct_answer': 0, 'explanation': 'const variables cannot be reassigned after declaration.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'Which is a valid variable name?',
                 'options': ['2names', 'my-var', '_count', 'class'],
                 'correct_answer': 2, 'explanation': 'Variable names can start with underscore. They cannot start with numbers or use reserved words.'},
            ],
            
            # Level 3: Data Types
            3: [
                {'question_type': 'output', 'question_text': 'What does typeof return?',
                 'code_snippet': 'console.log(typeof 42);',
                 'options': ['integer', 'number', 'Number', 'int'],
                 'correct_answer': 1, 'explanation': 'typeof 42 returns "number" (lowercase).'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What is the result of typeof null?',
                 'options': ['null', 'undefined', 'object', 'None'],
                 'correct_answer': 2, 'explanation': 'typeof null returns "object" - a known JavaScript quirk.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Check if a value is not a number:',
                 'code_snippet': 'let value = "hello";\nconsole.log(____(value));',
                 'options': ['isNaN', 'isNumber', 'checkNaN', 'notNumber'],
                 'correct_answer': 0, 'explanation': 'isNaN() checks if a value is Not-a-Number.'},
                
                {'question_type': 'output', 'question_text': 'What is the output?',
                 'code_snippet': 'let x = "5";\nlet y = 3;\nconsole.log(x + y);',
                 'options': ['8', '53', 'Error', 'NaN'],
                 'correct_answer': 1, 'explanation': 'String + number results in string concatenation: "5" + 3 = "53".'},
                
                {'question_type': 'multiple-choice', 'question_text': 'Which is a primitive data type in JavaScript?',
                 'options': ['Array', 'Object', 'Function', 'Boolean'],
                 'correct_answer': 3, 'explanation': 'Boolean is a primitive type. Arrays, Objects, and Functions are reference types.'},
            ],
            
            # Level 4: Operators
            4: [
                {'question_type': 'output', 'question_text': 'What is the result?',
                 'code_snippet': 'console.log(10 % 3);',
                 'options': ['3', '1', '3.33', '0'],
                 'correct_answer': 1, 'explanation': 'The modulo operator % returns the remainder: 10 ÷ 3 = 3 remainder 1.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Complete the strict equality check:',
                 'code_snippet': 'let a = 5;\nlet b = "5";\nconsole.log(a ____ b);',
                 'options': ['===', '==', '!=', '='],
                 'correct_answer': 0, 'explanation': '=== checks both value and type (strict equality).'},
                
                {'question_type': 'output', 'question_text': 'What does this evaluate to?',
                 'code_snippet': 'console.log(5 == "5");',
                 'options': ['true', 'false', 'Error', 'undefined'],
                 'correct_answer': 0, 'explanation': '== performs type coercion, so 5 equals "5".'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What does && represent?',
                 'options': ['OR operator', 'AND operator', 'NOT operator', 'XOR operator'],
                 'correct_answer': 1, 'explanation': '&& is the logical AND operator.'},
                
                {'question_type': 'output', 'question_text': 'What is the output?',
                 'code_snippet': 'let x = 5;\nx += 3;\nconsole.log(x);',
                 'options': ['5', '3', '8', '53'],
                 'correct_answer': 2, 'explanation': 'x += 3 is shorthand for x = x + 3, so x becomes 8.'},
            ],
            
            # Level 5: Arrays
            5: [
                {'question_type': 'fill-blank', 'question_text': 'Create an array:',
                 'code_snippet': 'let fruits = ____"apple", "banana", "orange"____;\nconsole.log(fruits);',
                 'options': ['[, ]', '(, )', '{, }', '<, >'],
                 'correct_answer': 0, 'explanation': 'Arrays are created with square brackets [].'},
                
                {'question_type': 'output', 'question_text': 'What is the output?',
                 'code_snippet': 'let arr = [10, 20, 30];\nconsole.log(arr[1]);',
                 'options': ['10', '20', '30', 'undefined'],
                 'correct_answer': 1, 'explanation': 'Array indices start at 0, so arr[1] is the second element: 20.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Add an item to the end of an array:',
                 'code_snippet': 'let nums = [1, 2, 3];\nnums.____(4);\nconsole.log(nums);',
                 'options': ['push', 'add', 'append', 'insert'],
                 'correct_answer': 0, 'explanation': 'push() adds elements to the end of an array.'},
                
                {'question_type': 'output', 'question_text': 'What is the length?',
                 'code_snippet': 'let arr = ["a", "b", "c", "d"];\nconsole.log(arr.length);',
                 'options': ['3', '4', '5', 'undefined'],
                 'correct_answer': 1, 'explanation': 'The array has 4 elements, so length is 4.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'Which method removes the last element?',
                 'options': ['shift()', 'pop()', 'remove()', 'delete()'],
                 'correct_answer': 1, 'explanation': 'pop() removes and returns the last element of an array.'},
            ],
            
            # Level 6: Functions
            6: [
                {'question_type': 'fill-blank', 'question_text': 'Define a function:',
                 'code_snippet': '____ greet(name) {\n  return "Hello, " + name;\n}',
                 'options': ['function', 'def', 'fn', 'func'],
                 'correct_answer': 0, 'explanation': 'function keyword is used to declare functions in JavaScript.'},
                
                {'question_type': 'output', 'question_text': 'What is returned?',
                 'code_snippet': 'function add(a, b) {\n  return a + b;\n}\nconsole.log(add(3, 4));',
                 'options': ['34', '7', 'undefined', 'NaN'],
                 'correct_answer': 1, 'explanation': 'The function returns 3 + 4 = 7.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Create an arrow function:',
                 'code_snippet': 'const double = (x) ____ x * 2;\nconsole.log(double(5));',
                 'options': ['=>', '->', ':', '>>'],
                 'correct_answer': 0, 'explanation': 'Arrow functions use => syntax.'},
                
                {'question_type': 'output', 'question_text': 'What happens here?',
                 'code_snippet': 'function test() {\n  console.log("Hello");\n}\nconsole.log(test());',
                 'options': ['Hello', 'undefined', 'Hello then undefined', 'Error'],
                 'correct_answer': 2, 'explanation': 'The function logs "Hello", then returns undefined (no return statement).'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What is a default parameter?',
                 'options': ['Required parameter', 'Parameter with a preset value', 'First parameter', 'Global parameter'],
                 'correct_answer': 1, 'explanation': 'Default parameters have preset values used when no argument is passed.'},
            ],
            
            # Level 7: Higher-Order Functions
            7: [
                {'question_type': 'output', 'question_text': 'What is the result?',
                 'code_snippet': 'let nums = [1, 2, 3];\nlet doubled = nums.map(x => x * 2);\nconsole.log(doubled);',
                 'options': ['[1, 2, 3]', '[2, 4, 6]', '[1, 4, 9]', 'Error'],
                 'correct_answer': 1, 'explanation': 'map() transforms each element: [1*2, 2*2, 3*2] = [2, 4, 6].'},
                
                {'question_type': 'fill-blank', 'question_text': 'Filter even numbers:',
                 'code_snippet': 'let nums = [1, 2, 3, 4, 5];\nlet evens = nums.____(x => x % 2 === 0);\nconsole.log(evens);',
                 'options': ['filter', 'find', 'select', 'where'],
                 'correct_answer': 0, 'explanation': 'filter() creates a new array with elements that pass the test.'},
                
                {'question_type': 'output', 'question_text': 'What does reduce return?',
                 'code_snippet': 'let nums = [1, 2, 3, 4];\nlet sum = nums.reduce((a, b) => a + b, 0);\nconsole.log(sum);',
                 'options': ['[1, 2, 3, 4]', '10', '24', '0'],
                 'correct_answer': 1, 'explanation': 'reduce() accumulates: 0+1+2+3+4 = 10.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What does forEach return?',
                 'options': ['A new array', 'undefined', 'The original array', 'A boolean'],
                 'correct_answer': 1, 'explanation': 'forEach() always returns undefined; it\'s for side effects only.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Find the first matching element:',
                 'code_snippet': 'let users = [{name: "Alice"}, {name: "Bob"}];\nlet user = users.____(u => u.name === "Bob");',
                 'options': ['find', 'filter', 'search', 'get'],
                 'correct_answer': 0, 'explanation': 'find() returns the first element matching the condition.'},
            ],
            
            # Level 8: Objects
            8: [
                {'question_type': 'fill-blank', 'question_text': 'Create an object:',
                 'code_snippet': 'let person = ____\n  name: "Alice",\n  age: 25\n____;',
                 'options': ['{, }', '[, ]', '(, )', '<, >'],
                 'correct_answer': 0, 'explanation': 'Objects are created with curly braces {}.'},
                
                {'question_type': 'output', 'question_text': 'What is the output?',
                 'code_snippet': 'let obj = {x: 10, y: 20};\nconsole.log(obj.x);',
                 'options': ['10', '20', 'x', 'undefined'],
                 'correct_answer': 0, 'explanation': 'Dot notation obj.x accesses the value of property x.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Access property with a variable:',
                 'code_snippet': 'let obj = {name: "Alice"};\nlet key = "name";\nconsole.log(obj____key____);',
                 'options': ['[, ]', '., ', '(, )', '{, }'],
                 'correct_answer': 0, 'explanation': 'Bracket notation obj[key] is used with variable keys.'},
                
                {'question_type': 'output', 'question_text': 'What does this log?',
                 'code_snippet': 'let obj = {a: 1, b: 2};\nconsole.log(Object.keys(obj));',
                 'options': ['[1, 2]', '["a", "b"]', '{a: 1, b: 2}', 'undefined'],
                 'correct_answer': 1, 'explanation': 'Object.keys() returns an array of the object\'s property names.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'How do you add a new property to an object?',
                 'options': ['obj.add("key", value)', 'obj.push(key, value)', 'obj.key = value', 'obj.insert(key, value)'],
                 'correct_answer': 2, 'explanation': 'Simply assign a value to a new property: obj.key = value.'},
            ],
            
            # Level 9: Loops
            9: [
                {'question_type': 'fill-blank', 'question_text': 'Complete the for loop:',
                 'code_snippet': '____ (let i = 0; i < 5; i++) {\n  console.log(i);\n}',
                 'options': ['for', 'loop', 'while', 'foreach'],
                 'correct_answer': 0, 'explanation': 'for loops have initialization, condition, and increment.'},
                
                {'question_type': 'output', 'question_text': 'What numbers are logged?',
                 'code_snippet': 'for (let i = 0; i < 3; i++) {\n  console.log(i);\n}',
                 'options': ['1 2 3', '0 1 2', '0 1 2 3', '1 2'],
                 'correct_answer': 1, 'explanation': 'Loop starts at 0 and stops before 3: 0, 1, 2.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Loop through array elements:',
                 'code_snippet': 'let arr = ["a", "b", "c"];\nfor (let item ____ arr) {\n  console.log(item);\n}',
                 'options': ['of', 'in', 'from', 'at'],
                 'correct_answer': 0, 'explanation': 'for...of iterates over array values.'},
                
                {'question_type': 'output', 'question_text': 'What is logged?',
                 'code_snippet': 'let i = 0;\nwhile (i < 3) {\n  i++;\n}\nconsole.log(i);',
                 'options': ['0', '2', '3', '4'],
                 'correct_answer': 2, 'explanation': 'The loop runs while i < 3, so i becomes 3 when it exits.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What does break do in a loop?',
                 'options': ['Skips to next iteration', 'Exits the loop completely', 'Pauses the loop', 'Restarts the loop'],
                 'correct_answer': 1, 'explanation': 'break immediately exits the loop.'},
            ],
            
            # Level 10: Closures
            10: [
                {'question_type': 'output', 'question_text': 'What is the output?',
                 'code_snippet': 'function outer() {\n  let count = 0;\n  return function() {\n    count++;\n    return count;\n  };\n}\nlet counter = outer();\nconsole.log(counter());',
                 'options': ['0', '1', 'undefined', 'Error'],
                 'correct_answer': 1, 'explanation': 'The inner function has closure over count, incrementing it to 1.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What is a closure?',
                 'options': ['A closed function', 'A function with access to its outer scope', 'A private variable', 'A loop terminator'],
                 'correct_answer': 1, 'explanation': 'A closure is a function that remembers variables from its outer scope.'},
                
                {'question_type': 'output', 'question_text': 'What does this log?',
                 'code_snippet': 'function make(x) {\n  return function(y) {\n    return x + y;\n  };\n}\nlet add5 = make(5);\nconsole.log(add5(3));',
                 'options': ['5', '3', '8', 'undefined'],
                 'correct_answer': 2, 'explanation': 'add5 closes over x=5, so add5(3) returns 5+3=8.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Create a private counter:',
                 'code_snippet': 'function createCounter() {\n  let count = 0;\n  return {\n    increment: function() { ____++; },\n    get: function() { return count; }\n  };\n}',
                 'options': ['count', 'this.count', 'self.count', '_count'],
                 'correct_answer': 0, 'explanation': 'The inner functions have closure over the count variable.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'Why are closures useful?',
                 'options': ['They make code faster', 'They enable data privacy and state', 'They reduce file size', 'They prevent errors'],
                 'correct_answer': 1, 'explanation': 'Closures allow functions to maintain private state and data encapsulation.'},
            ],
            
            # Level 11: DOM Basics
            11: [
                {'question_type': 'fill-blank', 'question_text': 'Select an element by ID:',
                 'code_snippet': 'let element = document.____("myId");',
                 'options': ['getElementById', 'getElement', 'selectById', 'findById'],
                 'correct_answer': 0, 'explanation': 'getElementById() selects an element by its ID attribute.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What does DOM stand for?',
                 'options': ['Document Object Model', 'Data Object Management', 'Digital Output Module', 'Document Oriented Markup'],
                 'correct_answer': 0, 'explanation': 'DOM stands for Document Object Model.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Select all elements with a class:',
                 'code_snippet': 'let items = document.____(".item");',
                 'options': ['querySelectorAll', 'getElementsByClass', 'selectAll', 'findAll'],
                 'correct_answer': 0, 'explanation': 'querySelectorAll() selects all matching elements using CSS selectors.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'How do you change an element\'s text?',
                 'options': ['element.text = "new"', 'element.textContent = "new"', 'element.setText("new")', 'element.value = "new"'],
                 'correct_answer': 1, 'explanation': 'textContent property sets or gets the text content of an element.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Create a new element:',
                 'code_snippet': 'let div = document.____("div");',
                 'options': ['createElement', 'newElement', 'createNode', 'makeElement'],
                 'correct_answer': 0, 'explanation': 'createElement() creates a new HTML element.'},
            ],
            
            # Level 12: Events
            12: [
                {'question_type': 'fill-blank', 'question_text': 'Add a click event listener:',
                 'code_snippet': 'button.____("click", function() {\n  console.log("Clicked!");\n});',
                 'options': ['addEventListener', 'onClick', 'addEvent', 'on'],
                 'correct_answer': 0, 'explanation': 'addEventListener() attaches an event handler to an element.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'Which event fires when a page finishes loading?',
                 'options': ['onready', 'DOMContentLoaded', 'pageload', 'onfinish'],
                 'correct_answer': 1, 'explanation': 'DOMContentLoaded fires when the HTML is fully parsed.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Prevent default form submission:',
                 'code_snippet': 'form.addEventListener("submit", function(e) {\n  e.____();\n});',
                 'options': ['preventDefault', 'stopDefault', 'cancel', 'halt'],
                 'correct_answer': 0, 'explanation': 'preventDefault() stops the default action of an event.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What is event bubbling?',
                 'options': ['Events only fire once', 'Events propagate up through parent elements', 'Events create bubbles', 'Events are cancelled'],
                 'correct_answer': 1, 'explanation': 'Event bubbling means events propagate from child to parent elements.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Stop event propagation:',
                 'code_snippet': 'element.addEventListener("click", function(e) {\n  e.____();\n});',
                 'options': ['stopPropagation', 'stopBubbling', 'cancelBubble', 'halt'],
                 'correct_answer': 0, 'explanation': 'stopPropagation() prevents the event from bubbling up.'},
            ],
            
            # Level 13: Async Intro
            13: [
                {'question_type': 'multiple-choice', 'question_text': 'What is asynchronous code?',
                 'options': ['Code that runs in order', 'Code that can run without blocking', 'Code that runs twice', 'Code that runs faster'],
                 'correct_answer': 1, 'explanation': 'Asynchronous code doesn\'t block execution while waiting for operations.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Execute code after 1 second:',
                 'code_snippet': '____(() => {\n  console.log("Done!");\n}, 1000);',
                 'options': ['setTimeout', 'delay', 'wait', 'sleep'],
                 'correct_answer': 0, 'explanation': 'setTimeout() executes a function after a specified delay in milliseconds.'},
                
                {'question_type': 'output', 'question_text': 'What is the order of output?',
                 'code_snippet': 'console.log("1");\nsetTimeout(() => console.log("2"), 0);\nconsole.log("3");',
                 'options': ['1, 2, 3', '1, 3, 2', '2, 1, 3', '3, 2, 1'],
                 'correct_answer': 1, 'explanation': 'setTimeout callbacks run after synchronous code, even with 0ms delay.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What is the callback queue?',
                 'options': ['A list of functions', 'Where async callbacks wait to be executed', 'A type of array', 'A debugging tool'],
                 'correct_answer': 1, 'explanation': 'The callback queue holds callbacks waiting to run after the call stack is empty.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Repeat code every second:',
                 'code_snippet': 'let id = ____(() => {\n  console.log("Tick");\n}, 1000);',
                 'options': ['setInterval', 'setRepeat', 'repeat', 'loop'],
                 'correct_answer': 0, 'explanation': 'setInterval() repeatedly executes a function at specified intervals.'},
            ],
            
            # Level 14: Promises
            14: [
                {'question_type': 'fill-blank', 'question_text': 'Create a new Promise:',
                 'code_snippet': 'let promise = new ____((resolve, reject) => {\n  resolve("Success!");\n});',
                 'options': ['Promise', 'Async', 'Await', 'Future'],
                 'correct_answer': 0, 'explanation': 'new Promise() creates a promise with resolve and reject functions.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Handle a successful promise:',
                 'code_snippet': 'fetch("/api/data")\n  .____((response) => response.json())\n  .then((data) => console.log(data));',
                 'options': ['then', 'success', 'done', 'resolve'],
                 'correct_answer': 0, 'explanation': '.then() handles the resolved value of a promise.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What are the three states of a Promise?',
                 'options': ['start, middle, end', 'pending, fulfilled, rejected', 'open, closed, error', 'waiting, done, failed'],
                 'correct_answer': 1, 'explanation': 'Promises can be pending, fulfilled (resolved), or rejected.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Handle promise errors:',
                 'code_snippet': 'fetch("/api/data")\n  .then((data) => console.log(data))\n  .____((error) => console.error(error));',
                 'options': ['catch', 'error', 'except', 'fail'],
                 'correct_answer': 0, 'explanation': '.catch() handles rejected promises or errors in the chain.'},
                
                {'question_type': 'output', 'question_text': 'What is logged?',
                 'code_snippet': 'Promise.resolve(5)\n  .then(x => x * 2)\n  .then(x => console.log(x));',
                 'options': ['5', '10', 'Promise', 'undefined'],
                 'correct_answer': 1, 'explanation': 'The promise resolves to 5, then maps to 5*2=10.'},
            ],
            
            # Level 15: Final Boss - Advanced JavaScript
            15: [
                {'question_type': 'fill-blank', 'question_text': 'Define an async function:',
                 'code_snippet': '____ function fetchData() {\n  const response = await fetch("/api");\n  return response.json();\n}',
                 'options': ['async', 'await', 'promise', 'defer'],
                 'correct_answer': 0, 'explanation': 'async keyword makes a function return a Promise and allows await inside.'},
                
                {'question_type': 'output', 'question_text': 'What does this log?',
                 'code_snippet': 'const arr = [1, 2, 3];\nconst [a, ...rest] = arr;\nconsole.log(rest);',
                 'options': ['[1, 2, 3]', '[1]', '[2, 3]', '2, 3'],
                 'correct_answer': 2, 'explanation': 'Spread operator ...rest collects remaining elements: [2, 3].'},
                
                {'question_type': 'fill-blank', 'question_text': 'Use optional chaining:',
                 'code_snippet': 'let user = { name: "Alice" };\nconsole.log(user____address____city);',
                 'options': ['?., ?.', '., .', '&&, &&', '||, ||'],
                 'correct_answer': 0, 'explanation': 'Optional chaining ?. safely accesses nested properties.'},
                
                {'question_type': 'output', 'question_text': 'What is the result?',
                 'code_snippet': 'const obj1 = { a: 1 };\nconst obj2 = { b: 2 };\nconst merged = { ...obj1, ...obj2 };\nconsole.log(merged);',
                 'options': ['{ a: 1 }', '{ b: 2 }', '{ a: 1, b: 2 }', 'Error'],
                 'correct_answer': 2, 'explanation': 'Spread operator merges object properties into a new object.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What does the nullish coalescing operator ?? do?',
                 'options': ['Checks for any falsy value', 'Returns right side if left is null or undefined', 'Always returns null', 'Compares two values'],
                 'correct_answer': 1, 'explanation': '?? returns the right operand only if left is null or undefined.'},
            ],
        }
        
        # Seed JavaScript questions
        self.stdout.write('\nSeeding JavaScript questions...')
        for level, questions in js_questions.items():
            for order, q in enumerate(questions, 1):
                Question.objects.create(
                    topic=js_topic,
                    level=level,
                    question_type=q['question_type'],
                    question_text=q['question_text'],
                    code_snippet=q.get('code_snippet', ''),
                    highlight_line=q.get('highlight_line'),
                    options=q['options'],
                    correct_answer=q['correct_answer'],
                    explanation=q['explanation'],
                    order=order
                )
            self.stdout.write(f'  Level {level}: {len(questions)} questions')
        
        # ============================================================
        # SQL QUESTIONS (15 Levels × 5 Questions = 75 Questions)
        # ============================================================
        
        sql_questions = {
            # Level 1: SQL Basics
            1: [
                {'question_type': 'multiple-choice', 'question_text': 'What does SQL stand for?',
                 'options': ['Structured Query Language', 'Simple Query Language', 'Standard Query Logic', 'System Query Language'],
                 'correct_answer': 0, 'explanation': 'SQL stands for Structured Query Language.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Complete the query to select all columns:',
                 'code_snippet': '____ * FROM users;',
                 'options': ['SELECT', 'GET', 'FETCH', 'SHOW'],
                 'correct_answer': 0, 'explanation': 'SELECT is used to retrieve data from a database.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'Which statement is used to retrieve data?',
                 'options': ['GET', 'SELECT', 'FETCH', 'RETRIEVE'],
                 'correct_answer': 1, 'explanation': 'SELECT is the SQL command for retrieving data.'},
                
                {'question_type': 'output', 'question_text': 'What does this query return?',
                 'code_snippet': 'SELECT name FROM users;',
                 'options': ['All columns from users', 'Only the name column', 'User count', 'Error'],
                 'correct_answer': 1, 'explanation': 'This query returns only the name column from the users table.'},
                
                {'question_type': 'find-error', 'question_text': 'Find the error in this query:',
                 'code_snippet': 'SELECT * FROM users',
                 'highlight_line': 1,
                 'options': ['Missing semicolon', 'Wrong keyword', 'Invalid table name', 'Nothing wrong'],
                 'correct_answer': 0, 'explanation': 'SQL statements should end with a semicolon.'},
            ],
            
            # Level 2: SELECT Queries
            2: [
                {'question_type': 'fill-blank', 'question_text': 'Select specific columns:',
                 'code_snippet': 'SELECT name, email ____ users;',
                 'options': ['FROM', 'IN', 'OF', 'AT'],
                 'correct_answer': 0, 'explanation': 'FROM specifies which table to select data from.'},
                
                {'question_type': 'output', 'question_text': 'What does DISTINCT do?',
                 'code_snippet': 'SELECT DISTINCT city FROM customers;',
                 'options': ['Selects all cities', 'Selects unique cities only', 'Counts cities', 'Sorts cities'],
                 'correct_answer': 1, 'explanation': 'DISTINCT removes duplicate values from the result.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'How do you select all columns?',
                 'options': ['SELECT ALL', 'SELECT *', 'SELECT COLUMNS', 'SELECT FULL'],
                 'correct_answer': 1, 'explanation': 'The asterisk * selects all columns from a table.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Rename a column in output:',
                 'code_snippet': 'SELECT name ____ full_name FROM users;',
                 'options': ['AS', 'TO', 'RENAME', 'CALLED'],
                 'correct_answer': 0, 'explanation': 'AS creates an alias for the column in the result.'},
                
                {'question_type': 'find-error', 'question_text': 'Find the error:',
                 'code_snippet': 'SELECT name email FROM users;',
                 'highlight_line': 1,
                 'options': ['Missing comma between columns', 'Wrong table name', 'Invalid syntax', 'Nothing wrong'],
                 'correct_answer': 0, 'explanation': 'Column names must be separated by commas.'},
            ],
            
            # Level 3: Filtering with WHERE
            3: [
                {'question_type': 'fill-blank', 'question_text': 'Filter results:',
                 'code_snippet': 'SELECT * FROM users ____ age > 18;',
                 'options': ['WHERE', 'WHEN', 'IF', 'FILTER'],
                 'correct_answer': 0, 'explanation': 'WHERE clause filters rows based on conditions.'},
                
                {'question_type': 'output', 'question_text': 'What does this return?',
                 'code_snippet': "SELECT * FROM products WHERE price = 0;",
                 'options': ['All products', 'Free products only', 'No products', 'Error'],
                 'correct_answer': 1, 'explanation': 'This returns products where price equals 0 (free items).'},
                
                {'question_type': 'multiple-choice', 'question_text': 'Which operator checks for NULL?',
                 'options': ['= NULL', '== NULL', 'IS NULL', 'EQUALS NULL'],
                 'correct_answer': 2, 'explanation': 'IS NULL is used to check for NULL values, not = or ==.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Check for multiple values:',
                 'code_snippet': "SELECT * FROM users WHERE country ____ ('USA', 'UK', 'Canada');",
                 'options': ['IN', 'EQUALS', 'HAS', 'CONTAINS'],
                 'correct_answer': 0, 'explanation': 'IN checks if a value matches any in a list.'},
                
                {'question_type': 'find-error', 'question_text': 'Find the error:',
                 'code_snippet': "SELECT * FROM users WHERE name = John;",
                 'highlight_line': 1,
                 'options': ['String not quoted', 'Wrong operator', 'Missing WHERE', 'Nothing wrong'],
                 'correct_answer': 0, 'explanation': "String values must be quoted: name = 'John'."},
            ],
            
            # Level 4: Sorting
            4: [
                {'question_type': 'fill-blank', 'question_text': 'Sort results alphabetically:',
                 'code_snippet': 'SELECT * FROM users ____ BY name;',
                 'options': ['ORDER', 'SORT', 'ARRANGE', 'GROUP'],
                 'correct_answer': 0, 'explanation': 'ORDER BY sorts the result set.'},
                
                {'question_type': 'output', 'question_text': 'What order is this?',
                 'code_snippet': 'SELECT * FROM products ORDER BY price DESC;',
                 'options': ['Lowest to highest', 'Highest to lowest', 'Alphabetical', 'Random'],
                 'correct_answer': 1, 'explanation': 'DESC sorts in descending order (highest to lowest).'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What is the default sort order?',
                 'options': ['DESC (descending)', 'ASC (ascending)', 'Random', 'By ID'],
                 'correct_answer': 1, 'explanation': 'The default ORDER BY sort order is ASC (ascending).'},
                
                {'question_type': 'fill-blank', 'question_text': 'Sort by multiple columns:',
                 'code_snippet': 'SELECT * FROM users ORDER BY country, name ____;',
                 'options': ['ASC', 'UP', 'FORWARD', 'ALPHA'],
                 'correct_answer': 0, 'explanation': 'ASC sorts in ascending order (A-Z, 0-9).'},
                
                {'question_type': 'find-error', 'question_text': 'Find the error:',
                 'code_snippet': 'SELECT * FROM users WHERE age > 18 BY name ORDER;',
                 'highlight_line': 1,
                 'options': ['ORDER BY is reversed', 'Missing semicolon', 'Wrong filter', 'Nothing wrong'],
                 'correct_answer': 0, 'explanation': 'Correct syntax is ORDER BY, not BY ... ORDER.'},
            ],
            
            # Level 5: Aggregate Functions
            5: [
                {'question_type': 'fill-blank', 'question_text': 'Count all rows:',
                 'code_snippet': 'SELECT ____(*) FROM users;',
                 'options': ['COUNT', 'TOTAL', 'SUM', 'NUM'],
                 'correct_answer': 0, 'explanation': 'COUNT(*) returns the number of rows.'},
                
                {'question_type': 'output', 'question_text': 'What does this return?',
                 'code_snippet': 'SELECT AVG(price) FROM products;',
                 'options': ['Total price', 'Average price', 'Maximum price', 'Minimum price'],
                 'correct_answer': 1, 'explanation': 'AVG() calculates the average of a column.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'Which finds the highest value?',
                 'options': ['HIGH()', 'MAX()', 'TOP()', 'HIGHEST()'],
                 'correct_answer': 1, 'explanation': 'MAX() returns the maximum value in a column.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Calculate total sales:',
                 'code_snippet': 'SELECT ____(amount) FROM orders;',
                 'options': ['SUM', 'TOTAL', 'ADD', 'PLUS'],
                 'correct_answer': 0, 'explanation': 'SUM() adds up all values in a column.'},
                
                {'question_type': 'output', 'question_text': 'What does MIN do?',
                 'code_snippet': 'SELECT MIN(age) FROM employees;',
                 'options': ['Returns youngest age', 'Returns oldest age', 'Returns average age', 'Counts ages'],
                 'correct_answer': 0, 'explanation': 'MIN() returns the smallest value (youngest age).'},
            ],
            
            # Level 6: Grouping
            6: [
                {'question_type': 'fill-blank', 'question_text': 'Group results by category:',
                 'code_snippet': 'SELECT category, COUNT(*) FROM products ____ BY category;',
                 'options': ['GROUP', 'COLLECT', 'COMBINE', 'CLUSTER'],
                 'correct_answer': 0, 'explanation': 'GROUP BY groups rows with the same values.'},
                
                {'question_type': 'output', 'question_text': 'What does this query do?',
                 'code_snippet': 'SELECT country, COUNT(*) FROM users GROUP BY country;',
                 'options': ['Lists all users', 'Counts users per country', 'Shows country names', 'Error'],
                 'correct_answer': 1, 'explanation': 'This counts the number of users in each country.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Filter grouped results:',
                 'code_snippet': 'SELECT category, AVG(price) FROM products GROUP BY category ____ AVG(price) > 100;',
                 'options': ['HAVING', 'WHERE', 'WHEN', 'IF'],
                 'correct_answer': 0, 'explanation': 'HAVING filters groups (WHERE filters rows before grouping).'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What is the difference between WHERE and HAVING?',
                 'options': ['They are the same', 'WHERE filters rows, HAVING filters groups', 'HAVING is faster', 'WHERE works with COUNT'],
                 'correct_answer': 1, 'explanation': 'WHERE filters before grouping, HAVING filters after grouping.'},
                
                {'question_type': 'find-error', 'question_text': 'Find the error:',
                 'code_snippet': 'SELECT country, COUNT(*) FROM users WHERE COUNT(*) > 5 GROUP BY country;',
                 'highlight_line': 1,
                 'options': ['Use HAVING instead of WHERE for aggregates', 'Wrong function', 'Missing ORDER BY', 'Nothing wrong'],
                 'correct_answer': 0, 'explanation': 'Aggregate conditions must use HAVING, not WHERE.'},
            ],
            
            # Level 7: Joins Basics
            7: [
                {'question_type': 'fill-blank', 'question_text': 'Join two tables:',
                 'code_snippet': 'SELECT * FROM orders ____ JOIN customers ON orders.customer_id = customers.id;',
                 'options': ['INNER', 'OUTER', 'CROSS', 'SELF'],
                 'correct_answer': 0, 'explanation': 'INNER JOIN returns matching rows from both tables.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What does INNER JOIN return?',
                 'options': ['All rows from both tables', 'Only matching rows', 'All rows from left table', 'All rows from right table'],
                 'correct_answer': 1, 'explanation': 'INNER JOIN returns only rows that have matches in both tables.'},
                
                {'question_type': 'output', 'question_text': 'What happens if no match exists in INNER JOIN?',
                 'code_snippet': 'SELECT * FROM orders INNER JOIN customers ON orders.customer_id = customers.id;',
                 'options': ['NULL values shown', 'Row is excluded', 'Error occurs', 'Empty table returned'],
                 'correct_answer': 1, 'explanation': 'INNER JOIN excludes rows without matches.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Specify the join condition:',
                 'code_snippet': 'SELECT * FROM orders JOIN products ____ orders.product_id = products.id;',
                 'options': ['ON', 'WHERE', 'WHEN', 'WITH'],
                 'correct_answer': 0, 'explanation': 'ON specifies the join condition.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'Which keyword can replace INNER JOIN?',
                 'options': ['OUTER JOIN', 'JOIN', 'CROSS JOIN', 'SELF JOIN'],
                 'correct_answer': 1, 'explanation': 'JOIN alone is equivalent to INNER JOIN.'},
            ],
            
            # Level 8: Advanced Joins
            8: [
                {'question_type': 'fill-blank', 'question_text': 'Get all customers, even without orders:',
                 'code_snippet': 'SELECT * FROM customers ____ JOIN orders ON customers.id = orders.customer_id;',
                 'options': ['LEFT', 'RIGHT', 'INNER', 'CROSS'],
                 'correct_answer': 0, 'explanation': 'LEFT JOIN returns all rows from the left table.'},
                
                {'question_type': 'output', 'question_text': 'What does RIGHT JOIN do?',
                 'code_snippet': 'SELECT * FROM orders RIGHT JOIN customers ON orders.customer_id = customers.id;',
                 'options': ['Returns all orders', 'Returns all customers', 'Returns only matches', 'Returns nothing'],
                 'correct_answer': 1, 'explanation': 'RIGHT JOIN returns all rows from the right table (customers).'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What does FULL OUTER JOIN return?',
                 'options': ['Only matching rows', 'All rows from left', 'All rows from right', 'All rows from both tables'],
                 'correct_answer': 3, 'explanation': 'FULL OUTER JOIN returns all rows from both tables.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Join every row with every other row:',
                 'code_snippet': 'SELECT * FROM colors ____ JOIN sizes;',
                 'options': ['CROSS', 'FULL', 'ALL', 'EVERY'],
                 'correct_answer': 0, 'explanation': 'CROSS JOIN creates a Cartesian product of both tables.'},
                
                {'question_type': 'find-error', 'question_text': 'Find the issue:',
                 'code_snippet': 'SELECT * FROM users LEFT JOIN orders;',
                 'highlight_line': 1,
                 'options': ['Missing ON clause', 'Wrong join type', 'Missing WHERE', 'Nothing wrong'],
                 'correct_answer': 0, 'explanation': 'LEFT JOIN requires an ON clause to specify the join condition.'},
            ],
            
            # Level 9: Subqueries
            9: [
                {'question_type': 'output', 'question_text': 'What does this subquery do?',
                 'code_snippet': 'SELECT * FROM products WHERE price > (SELECT AVG(price) FROM products);',
                 'options': ['All products', 'Products above average price', 'Average price only', 'Error'],
                 'correct_answer': 1, 'explanation': 'The subquery calculates average price, then outer query filters.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Use a subquery with IN:',
                 'code_snippet': 'SELECT * FROM users WHERE id ____ (SELECT user_id FROM orders);',
                 'options': ['IN', 'EQUALS', 'HAS', 'MATCHES'],
                 'correct_answer': 0, 'explanation': 'IN checks if a value exists in the subquery results.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'Where can subqueries be used?',
                 'options': ['Only in WHERE', 'Only in SELECT', 'Only in FROM', 'In SELECT, FROM, WHERE, and more'],
                 'correct_answer': 3, 'explanation': 'Subqueries can be used in many parts of a query.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Check if any rows exist:',
                 'code_snippet': 'SELECT * FROM users WHERE ____ (SELECT 1 FROM orders WHERE orders.user_id = users.id);',
                 'options': ['EXISTS', 'HAS', 'CONTAINS', 'FOUND'],
                 'correct_answer': 0, 'explanation': 'EXISTS returns true if the subquery returns any rows.'},
                
                {'question_type': 'output', 'question_text': 'What is a correlated subquery?',
                 'code_snippet': 'SELECT * FROM users u WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);',
                 'options': ['Runs once', 'References outer query', 'Returns multiple rows', 'Is faster'],
                 'correct_answer': 1, 'explanation': 'A correlated subquery references columns from the outer query.'},
            ],
            
            # Level 10: CRUD Operations
            10: [
                {'question_type': 'fill-blank', 'question_text': 'Insert a new row:',
                 'code_snippet': "____ INTO users (name, email) VALUES ('John', 'john@email.com');",
                 'options': ['INSERT', 'ADD', 'CREATE', 'NEW'],
                 'correct_answer': 0, 'explanation': 'INSERT INTO adds new rows to a table.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Update existing data:',
                 'code_snippet': "____ users SET email = 'new@email.com' WHERE id = 1;",
                 'options': ['UPDATE', 'MODIFY', 'CHANGE', 'SET'],
                 'correct_answer': 0, 'explanation': 'UPDATE modifies existing rows in a table.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What happens if UPDATE has no WHERE clause?',
                 'options': ['Error occurs', 'Nothing changes', 'All rows are updated', 'First row updated'],
                 'correct_answer': 2, 'explanation': 'Without WHERE, UPDATE affects ALL rows in the table!'},
                
                {'question_type': 'fill-blank', 'question_text': 'Remove rows from a table:',
                 'code_snippet': '____ FROM users WHERE id = 5;',
                 'options': ['DELETE', 'REMOVE', 'DROP', 'ERASE'],
                 'correct_answer': 0, 'explanation': 'DELETE removes rows from a table.'},
                
                {'question_type': 'find-error', 'question_text': 'Find the dangerous issue:',
                 'code_snippet': 'DELETE FROM users;',
                 'highlight_line': 1,
                 'options': ['Missing WHERE - deletes all rows!', 'Wrong syntax', 'Missing semicolon', 'Nothing wrong'],
                 'correct_answer': 0, 'explanation': 'DELETE without WHERE deletes ALL rows from the table!'},
            ],
            
            # Level 11: Table Design
            11: [
                {'question_type': 'fill-blank', 'question_text': 'Create a new table:',
                 'code_snippet': '____ TABLE users (\n  id INT PRIMARY KEY,\n  name VARCHAR(100)\n);',
                 'options': ['CREATE', 'MAKE', 'NEW', 'BUILD'],
                 'correct_answer': 0, 'explanation': 'CREATE TABLE defines a new table structure.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What does VARCHAR(100) mean?',
                 'options': ['Exactly 100 characters', 'Up to 100 characters', 'Minimum 100 characters', '100 bytes'],
                 'correct_answer': 1, 'explanation': 'VARCHAR(100) stores variable-length strings up to 100 characters.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Remove a table completely:',
                 'code_snippet': '____ TABLE old_users;',
                 'options': ['DROP', 'DELETE', 'REMOVE', 'DESTROY'],
                 'correct_answer': 0, 'explanation': 'DROP TABLE removes the entire table and its data.'},
                
                {'question_type': 'output', 'question_text': 'What does ALTER TABLE do?',
                 'code_snippet': 'ALTER TABLE users ADD COLUMN age INT;',
                 'options': ['Creates new table', 'Modifies table structure', 'Deletes table', 'Renames table'],
                 'correct_answer': 1, 'explanation': 'ALTER TABLE modifies an existing table structure.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What is the difference between DROP and DELETE?',
                 'options': ['They are the same', 'DROP removes table, DELETE removes rows', 'DELETE is faster', 'DROP removes rows'],
                 'correct_answer': 1, 'explanation': 'DROP removes the entire table; DELETE removes rows but keeps the table.'},
            ],
            
            # Level 12: Constraints
            12: [
                {'question_type': 'fill-blank', 'question_text': 'Ensure a column has unique values:',
                 'code_snippet': 'CREATE TABLE users (\n  email VARCHAR(255) ____\n);',
                 'options': ['UNIQUE', 'DISTINCT', 'SINGLE', 'ONLY'],
                 'correct_answer': 0, 'explanation': 'UNIQUE constraint ensures no duplicate values.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What does NOT NULL mean?',
                 'options': ['Can be empty string', 'Must have a value', 'Default is NULL', 'Accepts only numbers'],
                 'correct_answer': 1, 'explanation': 'NOT NULL means the column cannot contain NULL values.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Reference another table:',
                 'code_snippet': 'CREATE TABLE orders (\n  user_id INT ____ KEY REFERENCES users(id)\n);',
                 'options': ['FOREIGN', 'EXTERNAL', 'LINK', 'REF'],
                 'correct_answer': 0, 'explanation': 'FOREIGN KEY creates a relationship to another table.'},
                
                {'question_type': 'output', 'question_text': 'What does PRIMARY KEY do?',
                 'code_snippet': 'CREATE TABLE users (\n  id INT PRIMARY KEY\n);',
                 'options': ['Allows duplicates', 'Uniquely identifies each row', 'Auto-increments', 'Sorts the table'],
                 'correct_answer': 1, 'explanation': 'PRIMARY KEY uniquely identifies each row (unique + not null).'},
                
                {'question_type': 'fill-blank', 'question_text': 'Set a default value:',
                 'code_snippet': "CREATE TABLE users (\n  status VARCHAR(20) ____ 'active'\n);",
                 'options': ['DEFAULT', 'VALUE', 'SET', 'INIT'],
                 'correct_answer': 0, 'explanation': 'DEFAULT sets a value when none is provided.'},
            ],
            
            # Level 13: Indexes
            13: [
                {'question_type': 'fill-blank', 'question_text': 'Create an index for faster searches:',
                 'code_snippet': 'CREATE ____ idx_email ON users(email);',
                 'options': ['INDEX', 'KEY', 'SEARCH', 'FAST'],
                 'correct_answer': 0, 'explanation': 'INDEX speeds up searches on specified columns.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What is the downside of indexes?',
                 'options': ['Slower reads', 'Slower writes/updates', 'Uses less space', 'No downside'],
                 'correct_answer': 1, 'explanation': 'Indexes slow down INSERT/UPDATE as they must be maintained.'},
                
                {'question_type': 'output', 'question_text': 'When are indexes most useful?',
                 'code_snippet': 'CREATE INDEX idx_name ON users(name);',
                 'options': ['For small tables', 'For frequently queried columns', 'For all columns', 'Never useful'],
                 'correct_answer': 1, 'explanation': 'Indexes help columns that are frequently searched or filtered.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Remove an index:',
                 'code_snippet': '____ INDEX idx_email;',
                 'options': ['DROP', 'DELETE', 'REMOVE', 'DESTROY'],
                 'correct_answer': 0, 'explanation': 'DROP INDEX removes an existing index.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'Which columns are automatically indexed?',
                 'options': ['All columns', 'PRIMARY KEY columns', 'VARCHAR columns', 'No columns'],
                 'correct_answer': 1, 'explanation': 'PRIMARY KEY and UNIQUE columns are automatically indexed.'},
            ],
            
            # Level 14: Transactions
            14: [
                {'question_type': 'fill-blank', 'question_text': 'Start a transaction:',
                 'code_snippet': '____ TRANSACTION;\nUPDATE accounts SET balance = balance - 100 WHERE id = 1;\nUPDATE accounts SET balance = balance + 100 WHERE id = 2;',
                 'options': ['BEGIN', 'START', 'OPEN', 'INIT'],
                 'correct_answer': 0, 'explanation': 'BEGIN TRANSACTION starts a new transaction.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Save all changes:',
                 'code_snippet': 'BEGIN TRANSACTION;\nINSERT INTO orders VALUES (1, 100);\n____;',
                 'options': ['COMMIT', 'SAVE', 'FINISH', 'END'],
                 'correct_answer': 0, 'explanation': 'COMMIT saves all changes made in the transaction.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What does ROLLBACK do?',
                 'options': ['Saves changes', 'Undoes all changes in transaction', 'Pauses transaction', 'Continues transaction'],
                 'correct_answer': 1, 'explanation': 'ROLLBACK undoes all changes since BEGIN TRANSACTION.'},
                
                {'question_type': 'output', 'question_text': 'What is ACID in databases?',
                 'code_snippet': '-- Transaction properties',
                 'options': ['A type of join', 'Atomicity, Consistency, Isolation, Durability', 'A query optimizer', 'An index type'],
                 'correct_answer': 1, 'explanation': 'ACID properties ensure reliable transaction processing.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Undo changes if error occurs:',
                 'code_snippet': 'BEGIN TRANSACTION;\nUPDATE users SET balance = -100;\n-- Oops, invalid!\n____;',
                 'options': ['ROLLBACK', 'UNDO', 'REVERT', 'CANCEL'],
                 'correct_answer': 0, 'explanation': 'ROLLBACK cancels all changes in the current transaction.'},
            ],
            
            # Level 15: Final Boss - Advanced SQL
            15: [
                {'question_type': 'fill-blank', 'question_text': 'Create a view:',
                 'code_snippet': 'CREATE ____ active_users AS\nSELECT * FROM users WHERE status = \'active\';',
                 'options': ['VIEW', 'TABLE', 'QUERY', 'SELECT'],
                 'correct_answer': 0, 'explanation': 'VIEW creates a virtual table based on a query.'},
                
                {'question_type': 'output', 'question_text': 'What does UNION do?',
                 'code_snippet': 'SELECT name FROM customers\nUNION\nSELECT name FROM suppliers;',
                 'options': ['Joins tables', 'Combines results without duplicates', 'Intersects results', 'Creates a view'],
                 'correct_answer': 1, 'explanation': 'UNION combines results from multiple queries, removing duplicates.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What is the difference between UNION and UNION ALL?',
                 'options': ['No difference', 'UNION ALL keeps duplicates', 'UNION ALL is slower', 'UNION keeps duplicates'],
                 'correct_answer': 1, 'explanation': 'UNION removes duplicates; UNION ALL keeps all rows.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Use a window function:',
                 'code_snippet': 'SELECT name, salary, RANK() ____ (ORDER BY salary DESC) as rank\nFROM employees;',
                 'options': ['OVER', 'BY', 'WITH', 'USING'],
                 'correct_answer': 0, 'explanation': 'OVER defines the window for window functions like RANK().'},
                
                {'question_type': 'output', 'question_text': 'What does COALESCE do?',
                 'code_snippet': "SELECT COALESCE(nickname, name, 'Unknown') FROM users;",
                 'options': ['Combines strings', 'Returns first non-NULL value', 'Counts values', 'Checks for NULL'],
                 'correct_answer': 1, 'explanation': 'COALESCE returns the first non-NULL value in the list.'},
            ],
        }
        
        # Seed SQL questions
        self.stdout.write('\nSeeding SQL questions...')
        for level, questions in sql_questions.items():
            for order, q in enumerate(questions, 1):
                Question.objects.create(
                    topic=sql_topic,
                    level=level,
                    question_type=q['question_type'],
                    question_text=q['question_text'],
                    code_snippet=q.get('code_snippet', ''),
                    highlight_line=q.get('highlight_line'),
                    options=q['options'],
                    correct_answer=q['correct_answer'],
                    explanation=q['explanation'],
                    order=order
                )
            self.stdout.write(f'  Level {level}: {len(questions)} questions')
        
        # ============================================================
        # BASH QUESTIONS (15 Levels × 5 Questions = 75 Questions)
        # ============================================================
        
        bash_questions = {
            # Level 1: Bash Basics
            1: [
                {'question_type': 'multiple-choice', 'question_text': 'What is Bash?',
                 'options': ['A programming language', 'A Unix shell and command language', 'A text editor', 'A web browser'],
                 'correct_answer': 1, 'explanation': 'Bash (Bourne Again SHell) is a Unix shell and command language.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Print text to the terminal:',
                 'code_snippet': '____ "Hello, World!"',
                 'options': ['echo', 'print', 'say', 'output'],
                 'correct_answer': 0, 'explanation': 'echo prints text to standard output.'},
                
                {'question_type': 'output', 'question_text': 'What does this command do?',
                 'code_snippet': 'pwd',
                 'options': ['Print working directory', 'Password prompt', 'Power down', 'Print word'],
                 'correct_answer': 0, 'explanation': 'pwd (print working directory) shows the current directory path.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'Which command lists files in a directory?',
                 'options': ['dir', 'ls', 'list', 'show'],
                 'correct_answer': 1, 'explanation': 'ls lists directory contents in Unix/Linux systems.'},
                
                {'question_type': 'find-error', 'question_text': 'Find the error:',
                 'code_snippet': 'Echo "Hello"',
                 'highlight_line': 1,
                 'options': ['Commands are case-sensitive (use echo)', 'Missing quotes', 'Wrong syntax', 'Nothing wrong'],
                 'correct_answer': 0, 'explanation': 'Bash commands are case-sensitive. Use echo, not Echo.'},
            ],
            
            # Level 2: File Navigation
            2: [
                {'question_type': 'fill-blank', 'question_text': 'Change to a directory:',
                 'code_snippet': '____ /home/user/documents',
                 'options': ['cd', 'go', 'move', 'dir'],
                 'correct_answer': 0, 'explanation': 'cd (change directory) navigates to a specified path.'},
                
                {'question_type': 'output', 'question_text': 'What does cd .. do?',
                 'code_snippet': 'cd ..',
                 'options': ['Goes to home directory', 'Goes to parent directory', 'Goes to root', 'Shows current directory'],
                 'correct_answer': 1, 'explanation': '.. refers to the parent directory.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What does ~ represent?',
                 'options': ['Root directory', 'Current directory', 'Home directory', 'Parent directory'],
                 'correct_answer': 2, 'explanation': '~ is a shortcut for the user\'s home directory.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Go to home directory:',
                 'code_snippet': 'cd ____',
                 'options': ['~', '/', '..', '.'],
                 'correct_answer': 0, 'explanation': 'cd ~ or just cd goes to your home directory.'},
                
                {'question_type': 'output', 'question_text': 'What does ls -la show?',
                 'code_snippet': 'ls -la',
                 'options': ['Only directories', 'All files including hidden, in long format', 'Only large files', 'Alphabetical list'],
                 'correct_answer': 1, 'explanation': '-l is long format, -a shows all (including hidden) files.'},
            ],
            
            # Level 3: File Operations
            3: [
                {'question_type': 'fill-blank', 'question_text': 'Create a new directory:',
                 'code_snippet': '____ new_folder',
                 'options': ['mkdir', 'create', 'newdir', 'makedir'],
                 'correct_answer': 0, 'explanation': 'mkdir (make directory) creates a new directory.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'Which command removes a file?',
                 'options': ['delete', 'rm', 'remove', 'del'],
                 'correct_answer': 1, 'explanation': 'rm (remove) deletes files.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Copy a file:',
                 'code_snippet': '____ source.txt destination.txt',
                 'options': ['cp', 'copy', 'duplicate', 'clone'],
                 'correct_answer': 0, 'explanation': 'cp (copy) duplicates files.'},
                
                {'question_type': 'output', 'question_text': 'What does mv do?',
                 'code_snippet': 'mv old.txt new.txt',
                 'options': ['Copies file', 'Moves or renames file', 'Creates file', 'Deletes file'],
                 'correct_answer': 1, 'explanation': 'mv moves or renames files and directories.'},
                
                {'question_type': 'find-error', 'question_text': 'What is dangerous about this?',
                 'code_snippet': 'rm -rf /',
                 'highlight_line': 1,
                 'options': ['Deletes everything from root!', 'Invalid syntax', 'Missing file name', 'Nothing dangerous'],
                 'correct_answer': 0, 'explanation': 'rm -rf / recursively deletes everything from root - extremely dangerous!'},
            ],
            
            # Level 4: File Content
            4: [
                {'question_type': 'fill-blank', 'question_text': 'View file contents:',
                 'code_snippet': '____ filename.txt',
                 'options': ['cat', 'view', 'show', 'read'],
                 'correct_answer': 0, 'explanation': 'cat displays the entire file content.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'Which shows only the first 10 lines?',
                 'options': ['tail', 'head', 'top', 'first'],
                 'correct_answer': 1, 'explanation': 'head shows the first lines of a file (default 10).'},
                
                {'question_type': 'fill-blank', 'question_text': 'View last 20 lines:',
                 'code_snippet': '____ -n 20 logfile.txt',
                 'options': ['tail', 'head', 'last', 'end'],
                 'correct_answer': 0, 'explanation': 'tail shows the last lines of a file.'},
                
                {'question_type': 'output', 'question_text': 'What does less do?',
                 'code_snippet': 'less bigfile.txt',
                 'options': ['Shows less content', 'Paginated file viewer', 'Compresses file', 'Counts lines'],
                 'correct_answer': 1, 'explanation': 'less is a paginated file viewer for scrolling through files.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'How do you count lines in a file?',
                 'options': ['count file.txt', 'wc -l file.txt', 'lines file.txt', 'nl file.txt'],
                 'correct_answer': 1, 'explanation': 'wc -l (word count with -l flag) counts lines.'},
            ],
            
            # Level 5: Variables
            5: [
                {'question_type': 'fill-blank', 'question_text': 'Create a variable:',
                 'code_snippet': 'name____"John"\necho $name',
                 'options': ['=', ' = ', ':=', '=='],
                 'correct_answer': 0, 'explanation': 'Variables are assigned with = and NO spaces around it.'},
                
                {'question_type': 'output', 'question_text': 'What is printed?',
                 'code_snippet': 'greeting="Hello"\necho "$greeting World"',
                 'options': ['$greeting World', 'Hello World', 'greeting World', 'Error'],
                 'correct_answer': 1, 'explanation': 'Variables in double quotes are expanded.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Access a variable:',
                 'code_snippet': 'count=5\necho ____count',
                 'options': ['$', '@', '%', '&'],
                 'correct_answer': 0, 'explanation': '$ is used to access variable values.'},
                
                {'question_type': 'find-error', 'question_text': 'Find the error:',
                 'code_snippet': 'name = "John"\necho $name',
                 'highlight_line': 1,
                 'options': ['Spaces around = not allowed', 'Missing quotes', 'Wrong variable name', 'Nothing wrong'],
                 'correct_answer': 0, 'explanation': 'Variable assignment must have NO spaces around =.'},
                
                {'question_type': 'output', 'question_text': 'What is the difference?',
                 'code_snippet': 'var="Hello"\necho \'$var\'\necho "$var"',
                 'options': ['Both print Hello', 'Single quotes: $var, Double quotes: Hello', 'Both print $var', 'Error'],
                 'correct_answer': 1, 'explanation': 'Single quotes are literal; double quotes expand variables.'},
            ],
            
            # Level 6: Input/Output
            6: [
                {'question_type': 'fill-blank', 'question_text': 'Redirect output to a file:',
                 'code_snippet': 'echo "Hello" ____ output.txt',
                 'options': ['>', '>>', '|', '->'],
                 'correct_answer': 0, 'explanation': '> redirects output to a file (overwrites).'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What does >> do?',
                 'options': ['Overwrites file', 'Appends to file', 'Reads from file', 'Creates empty file'],
                 'correct_answer': 1, 'explanation': '>> appends output to a file without overwriting.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Pipe output to another command:',
                 'code_snippet': 'ls -la ____ grep ".txt"',
                 'options': ['|', '>', '>>', '&'],
                 'correct_answer': 0, 'explanation': '| (pipe) sends output of one command to another.'},
                
                {'question_type': 'output', 'question_text': 'What does this do?',
                 'code_snippet': 'cat file.txt | wc -l',
                 'options': ['Shows file content', 'Counts lines in file', 'Copies file', 'Deletes file'],
                 'correct_answer': 1, 'explanation': 'Pipes file content to wc -l which counts lines.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Read user input:',
                 'code_snippet': 'echo "Enter name:"\n____ name\necho "Hello, $name"',
                 'options': ['read', 'input', 'get', 'scan'],
                 'correct_answer': 0, 'explanation': 'read captures user input into a variable.'},
            ],
            
            # Level 7: Conditionals
            7: [
                {'question_type': 'fill-blank', 'question_text': 'Start an if statement:',
                 'code_snippet': '____ [ $age -gt 18 ]; then\n  echo "Adult"\nfi',
                 'options': ['if', 'when', 'check', 'test'],
                 'correct_answer': 0, 'explanation': 'if starts a conditional statement in Bash.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What does -eq mean?',
                 'options': ['Not equal', 'Equal', 'Greater than', 'Less than'],
                 'correct_answer': 1, 'explanation': '-eq tests for equality (equal).'},
                
                {'question_type': 'fill-blank', 'question_text': 'Check if greater than:',
                 'code_snippet': 'if [ $count ____ 10 ]; then\n  echo "Big number"\nfi',
                 'options': ['-gt', '>', '-greater', 'gt'],
                 'correct_answer': 0, 'explanation': '-gt means greater than in Bash tests.'},
                
                {'question_type': 'output', 'question_text': 'What ends an if statement?',
                 'code_snippet': 'if [ condition ]; then\n  commands\nfi',
                 'options': ['end', 'endif', 'fi', 'done'],
                 'correct_answer': 2, 'explanation': 'fi (if backwards) closes an if statement.'},
                
                {'question_type': 'find-error', 'question_text': 'Find the error:',
                 'code_snippet': 'if [$x -eq 5]; then\n  echo "Five"\nfi',
                 'highlight_line': 1,
                 'options': ['Missing spaces inside brackets', 'Wrong operator', 'Missing fi', 'Nothing wrong'],
                 'correct_answer': 0, 'explanation': 'Spaces required: [ $x -eq 5 ] not [$x -eq 5].'},
            ],
            
            # Level 8: Loops
            8: [
                {'question_type': 'fill-blank', 'question_text': 'Loop through items:',
                 'code_snippet': '____ item in apple banana cherry; do\n  echo $item\ndone',
                 'options': ['for', 'foreach', 'loop', 'each'],
                 'correct_answer': 0, 'explanation': 'for loops iterate over a list of items.'},
                
                {'question_type': 'output', 'question_text': 'What does this print?',
                 'code_snippet': 'for i in 1 2 3; do\n  echo $i\ndone',
                 'options': ['123', '1 2 3 on separate lines', '[1, 2, 3]', 'Error'],
                 'correct_answer': 1, 'explanation': 'Each iteration prints the number on a new line.'},
                
                {'question_type': 'fill-blank', 'question_text': 'While loop syntax:',
                 'code_snippet': 'count=0\n____ [ $count -lt 5 ]; do\n  echo $count\n  ((count++))\ndone',
                 'options': ['while', 'loop', 'until', 'for'],
                 'correct_answer': 0, 'explanation': 'while loops while condition is true.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What keyword ends a loop?',
                 'options': ['end', 'done', 'fi', 'stop'],
                 'correct_answer': 1, 'explanation': 'done ends for and while loops.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Loop through files:',
                 'code_snippet': 'for file in ____; do\n  echo $file\ndone',
                 'options': ['*.txt', 'all.txt', 'files.txt', '@.txt'],
                 'correct_answer': 0, 'explanation': '*.txt is a glob pattern matching all .txt files.'},
            ],
            
            # Level 9: Functions
            9: [
                {'question_type': 'fill-blank', 'question_text': 'Define a function:',
                 'code_snippet': '____() {\n  echo "Hello, $1!"\n}\ngreet "World"',
                 'options': ['greet', 'function greet', 'def greet', 'fn greet'],
                 'correct_answer': 0, 'explanation': 'Functions are defined as name() { commands; }.'},
                
                {'question_type': 'output', 'question_text': 'What is $1 in a function?',
                 'code_snippet': 'sayhi() {\n  echo "Hi, $1"\n}\nsayhi "Alice"',
                 'options': ['The number 1', 'First argument', 'Function name', 'Error'],
                 'correct_answer': 1, 'explanation': '$1 is the first argument passed to the function.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What does $# represent?',
                 'options': ['Last argument', 'Number of arguments', 'All arguments', 'Script name'],
                 'correct_answer': 1, 'explanation': '$# is the count of arguments passed.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Return a value:',
                 'code_snippet': 'add() {\n  result=$(($1 + $2))\n  echo $result\n}\nsum=$(add 3 5)\necho "Sum: ____"',
                 'options': ['$sum', 'sum', '$result', 'result'],
                 'correct_answer': 0, 'explanation': '$sum contains the captured output from the function.'},
                
                {'question_type': 'output', 'question_text': 'What is $@ ?',
                 'code_snippet': 'show_all() {\n  echo "$@"\n}\nshow_all a b c',
                 'options': ['First argument', 'Last argument', 'All arguments', 'Argument count'],
                 'correct_answer': 2, 'explanation': '$@ expands to all arguments passed to the function.'},
            ],
            
            # Level 10: Text Processing
            10: [
                {'question_type': 'fill-blank', 'question_text': 'Search for text in files:',
                 'code_snippet': '____ "error" logfile.txt',
                 'options': ['grep', 'find', 'search', 'locate'],
                 'correct_answer': 0, 'explanation': 'grep searches for patterns in files.'},
                
                {'question_type': 'output', 'question_text': 'What does grep -i do?',
                 'code_snippet': 'grep -i "hello" file.txt',
                 'options': ['Inverts match', 'Case-insensitive search', 'Shows line numbers', 'Counts matches'],
                 'correct_answer': 1, 'explanation': '-i flag makes grep case-insensitive.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Replace text in a stream:',
                 'code_snippet': 'echo "hello world" | ____ \'s/world/universe/\'',
                 'options': ['sed', 'replace', 'tr', 'sub'],
                 'correct_answer': 0, 'explanation': 'sed (stream editor) performs text transformations.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What does awk do?',
                 'options': ['Archives files', 'Pattern scanning and processing', 'Network testing', 'User management'],
                 'correct_answer': 1, 'explanation': 'awk is a powerful text processing tool.'},
                
                {'question_type': 'output', 'question_text': 'What does this print?',
                 'code_snippet': 'echo "apple,banana,cherry" | cut -d"," -f2',
                 'options': ['apple', 'banana', 'cherry', 'apple,banana'],
                 'correct_answer': 1, 'explanation': 'cut with -d"," -f2 extracts the second comma-separated field.'},
            ],
            
            # Level 11: Permissions
            11: [
                {'question_type': 'fill-blank', 'question_text': 'Change file permissions:',
                 'code_snippet': '____ 755 script.sh',
                 'options': ['chmod', 'chown', 'chperm', 'perm'],
                 'correct_answer': 0, 'explanation': 'chmod (change mode) modifies file permissions.'},
                
                {'question_type': 'output', 'question_text': 'What does chmod 755 mean?',
                 'code_snippet': 'chmod 755 file.sh',
                 'options': ['Read only', 'Owner: rwx, Group/Others: rx', 'Full access for all', 'No permissions'],
                 'correct_answer': 1, 'explanation': '7=rwx for owner, 5=rx for group and others.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What does chmod +x do?',
                 'options': ['Removes execute permission', 'Adds execute permission', 'Changes owner', 'Deletes file'],
                 'correct_answer': 1, 'explanation': '+x adds execute permission to a file.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Change file owner:',
                 'code_snippet': '____ john:staff file.txt',
                 'options': ['chown', 'chmod', 'chgrp', 'owner'],
                 'correct_answer': 0, 'explanation': 'chown changes file owner and group.'},
                
                {'question_type': 'output', 'question_text': 'What do rwx represent?',
                 'code_snippet': '-rwxr-xr-x file.sh',
                 'options': ['read, write, execute', 'run, write, exit', 'root, web, xml', 'red, white, xray'],
                 'correct_answer': 0, 'explanation': 'r=read, w=write, x=execute permissions.'},
            ],
            
            # Level 12: Process Management
            12: [
                {'question_type': 'fill-blank', 'question_text': 'List running processes:',
                 'code_snippet': '____ aux',
                 'options': ['ps', 'proc', 'list', 'show'],
                 'correct_answer': 0, 'explanation': 'ps (process status) lists running processes.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'How do you stop a process by ID?',
                 'options': ['stop 1234', 'kill 1234', 'end 1234', 'quit 1234'],
                 'correct_answer': 1, 'explanation': 'kill sends signals to processes (default: terminate).'},
                
                {'question_type': 'fill-blank', 'question_text': 'Run a command in background:',
                 'code_snippet': 'long_script.sh ____',
                 'options': ['&', 'bg', 'back', '>>'],
                 'correct_answer': 0, 'explanation': '& at the end runs a command in the background.'},
                
                {'question_type': 'output', 'question_text': 'What does top show?',
                 'code_snippet': 'top',
                 'options': ['Top of file', 'Real-time process monitor', 'Highest permissions', 'Top directory'],
                 'correct_answer': 1, 'explanation': 'top shows real-time system process information.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Force kill a process:',
                 'code_snippet': 'kill ____ 1234',
                 'options': ['-9', '-f', '-force', '-k'],
                 'correct_answer': 0, 'explanation': 'kill -9 (SIGKILL) forcefully terminates a process.'},
            ],
            
            # Level 13: Environment
            13: [
                {'question_type': 'fill-blank', 'question_text': 'Set an environment variable:',
                 'code_snippet': '____ MY_VAR="value"',
                 'options': ['export', 'set', 'env', 'declare'],
                 'correct_answer': 0, 'explanation': 'export makes a variable available to child processes.'},
                
                {'question_type': 'output', 'question_text': 'What does $PATH contain?',
                 'code_snippet': 'echo $PATH',
                 'options': ['Current directory', 'Directories to search for commands', 'File path', 'User home'],
                 'correct_answer': 1, 'explanation': 'PATH lists directories where the shell looks for commands.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'Where are user environment variables typically set?',
                 'options': ['/etc/passwd', '~/.bashrc or ~/.bash_profile', '/usr/bin', '/var/log'],
                 'correct_answer': 1, 'explanation': '~/.bashrc or ~/.bash_profile store user environment settings.'},
                
                {'question_type': 'fill-blank', 'question_text': 'View all environment variables:',
                 'code_snippet': '____',
                 'options': ['env', 'vars', 'show', 'list'],
                 'correct_answer': 0, 'explanation': 'env displays all environment variables.'},
                
                {'question_type': 'output', 'question_text': 'What is $HOME?',
                 'code_snippet': 'echo $HOME',
                 'options': ['Root directory', 'User home directory', 'Current directory', 'Temp directory'],
                 'correct_answer': 1, 'explanation': '$HOME contains the path to the user\'s home directory.'},
            ],
            
            # Level 14: Scripting
            14: [
                {'question_type': 'fill-blank', 'question_text': 'Start a bash script with:',
                 'code_snippet': '____\necho "Hello"',
                 'options': ['#!/bin/bash', '#bash', '//bin/bash', '@bash'],
                 'correct_answer': 0, 'explanation': 'The shebang #!/bin/bash specifies the interpreter.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What is $0 in a script?',
                 'options': ['First argument', 'Script name', 'Exit code', 'Process ID'],
                 'correct_answer': 1, 'explanation': '$0 contains the name of the script itself.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Check last command exit status:',
                 'code_snippet': 'ls /nonexistent\necho "Exit code: ____"',
                 'options': ['$?', '$!', '$$', '$-'],
                 'correct_answer': 0, 'explanation': '$? contains the exit status of the last command.'},
                
                {'question_type': 'output', 'question_text': 'What does exit 0 mean?',
                 'code_snippet': 'exit 0',
                 'options': ['Error occurred', 'Success/no error', 'Script paused', 'Return to start'],
                 'correct_answer': 1, 'explanation': 'Exit code 0 indicates success; non-zero indicates error.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Make script executable:',
                 'code_snippet': 'chmod ____ myscript.sh',
                 'options': ['+x', '+r', '+w', '+e'],
                 'correct_answer': 0, 'explanation': 'chmod +x adds execute permission to run the script.'},
            ],
            
            # Level 15: Final Boss - Advanced Bash
            15: [
                {'question_type': 'fill-blank', 'question_text': 'Command substitution:',
                 'code_snippet': 'current_date=____date +%Y-%m-%d____\necho $current_date',
                 'options': ['$(, )', '`(, )`', '{, }', '[, ]'],
                 'correct_answer': 0, 'explanation': '$() captures command output into a variable.'},
                
                {'question_type': 'output', 'question_text': 'What does set -e do?',
                 'code_snippet': '#!/bin/bash\nset -e\ncommand1\ncommand2',
                 'options': ['Echoes commands', 'Exits on any error', 'Enables debugging', 'Sets environment'],
                 'correct_answer': 1, 'explanation': 'set -e makes the script exit if any command fails.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Use default value if variable is empty:',
                 'code_snippet': 'name=${1____"Guest"}\necho "Hello, $name"',
                 'options': [':-', ':=', ':+', ':?'],
                 'correct_answer': 0, 'explanation': '${var:-default} uses default if var is unset or empty.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What does trap do?',
                 'options': ['Catches errors and runs cleanup code', 'Sets a timer', 'Creates a loop', 'Defines a function'],
                 'correct_answer': 0, 'explanation': 'trap catches signals and can run cleanup code on exit.'},
                
                {'question_type': 'output', 'question_text': 'What does $$ represent?',
                 'code_snippet': 'echo "PID: $$"',
                 'options': ['Parent process ID', 'Current process ID', 'Exit status', 'Argument count'],
                 'correct_answer': 1, 'explanation': '$$ is the process ID of the current shell/script.'},
            ],
        }
        
        # Seed Bash questions
        self.stdout.write('\nSeeding Bash questions...')
        for level, questions in bash_questions.items():
            for order, q in enumerate(questions, 1):
                Question.objects.create(
                    topic=bash_topic,
                    level=level,
                    question_type=q['question_type'],
                    question_text=q['question_text'],
                    code_snippet=q.get('code_snippet', ''),
                    highlight_line=q.get('highlight_line'),
                    options=q['options'],
                    correct_answer=q['correct_answer'],
                    explanation=q['explanation'],
                    order=order
                )
            self.stdout.write(f'  Level {level}: {len(questions)} questions')
        
        # ============================================================
        # CSS QUESTIONS (15 Levels × 5 Questions = 75 Questions)
        # ============================================================
        
        css_questions = {
            # Level 1: CSS Basics
            1: [
                {'question_type': 'multiple-choice', 'question_text': 'What does CSS stand for?',
                 'options': ['Cascading Style Sheets', 'Creative Style System', 'Computer Style Sheets', 'Colorful Style Sheets'],
                 'correct_answer': 0, 'explanation': 'CSS stands for Cascading Style Sheets.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Complete the CSS rule:',
                 'code_snippet': 'p {\n  color: ____;\n}',
                 'options': ['red', '"red"', '#red', 'color-red'],
                 'correct_answer': 0, 'explanation': 'Color values can be keywords like red, blue, green, etc.'},
                
                {'question_type': 'output', 'question_text': 'What does this CSS do?',
                 'code_snippet': 'h1 {\n  color: blue;\n}',
                 'options': ['Makes all h1 text blue', 'Makes page background blue', 'Creates a blue border', 'Nothing'],
                 'correct_answer': 0, 'explanation': 'This rule sets the text color of all h1 elements to blue.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'How do you add CSS to an HTML file?',
                 'options': ['<css> tag', '<style> tag', '<script> tag', '<link> tag only'],
                 'correct_answer': 1, 'explanation': 'Internal CSS is added using the <style> tag in HTML.'},
                
                {'question_type': 'find-error', 'question_text': 'Find the error:',
                 'code_snippet': 'p {\n  color: red\n}',
                 'highlight_line': 2,
                 'options': ['Missing semicolon', 'Wrong property', 'Invalid color', 'Nothing wrong'],
                 'correct_answer': 0, 'explanation': 'CSS declarations should end with a semicolon.'},
            ],
            
            # Level 2: Selectors
            2: [
                {'question_type': 'fill-blank', 'question_text': 'Select element by class:',
                 'code_snippet': '____highlight {\n  background: yellow;\n}',
                 'options': ['.', '#', '@', '*'],
                 'correct_answer': 0, 'explanation': 'A dot (.) is used to select elements by class name.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Select element by ID:',
                 'code_snippet': '____header {\n  font-size: 24px;\n}',
                 'options': ['#', '.', '@', '&'],
                 'correct_answer': 0, 'explanation': 'A hash (#) is used to select elements by ID.'},
                
                {'question_type': 'output', 'question_text': 'What does this select?',
                 'code_snippet': 'div p {\n  color: red;\n}',
                 'options': ['All div and p elements', 'p elements inside div', 'div elements inside p', 'Only first p in div'],
                 'correct_answer': 1, 'explanation': 'This descendant selector targets p elements inside div elements.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What does * select?',
                 'options': ['Nothing', 'All elements', 'Important elements', 'Star-shaped elements'],
                 'correct_answer': 1, 'explanation': 'The universal selector * selects all elements.'},
                
                {'question_type': 'find-error', 'question_text': 'Find the error:',
                 'code_snippet': '.my class {\n  color: blue;\n}',
                 'highlight_line': 1,
                 'options': ['Class names cannot have spaces', 'Missing dot', 'Wrong brackets', 'Nothing wrong'],
                 'correct_answer': 0, 'explanation': 'Class names cannot contain spaces. Use .my-class or .myClass.'},
            ],
            
            # Level 3: Colors and Backgrounds
            3: [
                {'question_type': 'fill-blank', 'question_text': 'Set background color:',
                 'code_snippet': 'body {\n  ____: lightblue;\n}',
                 'options': ['background-color', 'bg-color', 'back-color', 'color-background'],
                 'correct_answer': 0, 'explanation': 'background-color sets the background color of an element.'},
                
                {'question_type': 'output', 'question_text': 'What color is #FF0000?',
                 'code_snippet': 'p { color: #FF0000; }',
                 'options': ['Blue', 'Green', 'Red', 'Black'],
                 'correct_answer': 2, 'explanation': '#FF0000 is red (FF red, 00 green, 00 blue).'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What does rgba(255, 0, 0, 0.5) represent?',
                 'options': ['Solid red', 'Semi-transparent red', 'Dark red', 'Light red'],
                 'correct_answer': 1, 'explanation': 'The 0.5 alpha value makes it 50% transparent.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Add a background image:',
                 'code_snippet': 'div {\n  background-____: url("image.jpg");\n}',
                 'options': ['image', 'img', 'picture', 'src'],
                 'correct_answer': 0, 'explanation': 'background-image sets an image as the background.'},
                
                {'question_type': 'output', 'question_text': 'What is rgb(0, 0, 0)?',
                 'code_snippet': 'p { color: rgb(0, 0, 0); }',
                 'options': ['White', 'Black', 'Gray', 'Transparent'],
                 'correct_answer': 1, 'explanation': 'rgb(0, 0, 0) is black (no red, green, or blue).'},
            ],
            
            # Level 4: Text Styling
            4: [
                {'question_type': 'fill-blank', 'question_text': 'Set font size:',
                 'code_snippet': 'p {\n  font-____: 16px;\n}',
                 'options': ['size', 'height', 'width', 'length'],
                 'correct_answer': 0, 'explanation': 'font-size sets the size of the text.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'Which property makes text bold?',
                 'options': ['font-style: bold', 'font-weight: bold', 'text-style: bold', 'text-weight: bold'],
                 'correct_answer': 1, 'explanation': 'font-weight: bold makes text bold.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Center text horizontally:',
                 'code_snippet': 'h1 {\n  text-____: center;\n}',
                 'options': ['align', 'position', 'center', 'justify'],
                 'correct_answer': 0, 'explanation': 'text-align: center horizontally centers text.'},
                
                {'question_type': 'output', 'question_text': 'What does text-decoration: underline do?',
                 'code_snippet': 'a { text-decoration: underline; }',
                 'options': ['Removes underline', 'Adds underline', 'Makes text italic', 'Makes text bold'],
                 'correct_answer': 1, 'explanation': 'text-decoration: underline adds a line under the text.'},
                
                {'question_type': 'find-error', 'question_text': 'Find the error:',
                 'code_snippet': 'p {\n  font-family: Arial, sans serif;\n}',
                 'highlight_line': 2,
                 'options': ['sans serif should be sans-serif', 'Missing quotes', 'Wrong property', 'Nothing wrong'],
                 'correct_answer': 0, 'explanation': 'Generic font families use hyphens: sans-serif, not sans serif.'},
            ],
            
            # Level 5: Box Model
            5: [
                {'question_type': 'multiple-choice', 'question_text': 'What are the four parts of the CSS box model?',
                 'options': ['Width, Height, Color, Border', 'Content, Padding, Border, Margin', 'Top, Right, Bottom, Left', 'Header, Body, Footer, Sidebar'],
                 'correct_answer': 1, 'explanation': 'The box model consists of content, padding, border, and margin.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Add space inside the border:',
                 'code_snippet': 'div {\n  ____: 20px;\n}',
                 'options': ['padding', 'margin', 'spacing', 'inner'],
                 'correct_answer': 0, 'explanation': 'Padding adds space between content and border.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Add space outside the border:',
                 'code_snippet': 'div {\n  ____: 20px;\n}',
                 'options': ['margin', 'padding', 'spacing', 'outer'],
                 'correct_answer': 0, 'explanation': 'Margin adds space outside the element\'s border.'},
                
                {'question_type': 'output', 'question_text': 'What does padding: 10px 20px mean?',
                 'code_snippet': 'div { padding: 10px 20px; }',
                 'options': ['10px all sides', '10px top/bottom, 20px left/right', '10px left/right, 20px top/bottom', '10px top, 20px bottom'],
                 'correct_answer': 1, 'explanation': 'Two values: first is top/bottom, second is left/right.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What does box-sizing: border-box do?',
                 'options': ['Adds a border', 'Includes padding/border in element width', 'Removes the box model', 'Centers the box'],
                 'correct_answer': 1, 'explanation': 'border-box includes padding and border in the element\'s total width/height.'},
            ],
            
            # Level 6: Display and Visibility
            6: [
                {'question_type': 'fill-blank', 'question_text': 'Hide an element completely:',
                 'code_snippet': '.hidden {\n  display: ____;\n}',
                 'options': ['none', 'hidden', 'invisible', 'off'],
                 'correct_answer': 0, 'explanation': 'display: none removes the element from the layout entirely.'},
                
                {'question_type': 'output', 'question_text': 'What is the difference between display: none and visibility: hidden?',
                 'code_snippet': '.a { display: none; }\n.b { visibility: hidden; }',
                 'options': ['No difference', 'none removes from layout, hidden keeps space', 'hidden removes from layout', 'Both hide content the same way'],
                 'correct_answer': 1, 'explanation': 'display: none removes from layout; visibility: hidden keeps the space.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'Which display value makes elements sit side by side?',
                 'options': ['block', 'inline', 'none', 'hidden'],
                 'correct_answer': 1, 'explanation': 'inline elements sit next to each other horizontally.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Make a block element inline with block features:',
                 'code_snippet': 'span {\n  display: ____;\n}',
                 'options': ['inline-block', 'block-inline', 'inline-flex', 'flex-inline'],
                 'correct_answer': 0, 'explanation': 'inline-block allows width/height while staying inline.'},
                
                {'question_type': 'find-error', 'question_text': 'Why won\'t width work here?',
                 'code_snippet': 'span {\n  display: inline;\n  width: 200px;\n}',
                 'highlight_line': 3,
                 'options': ['Inline elements ignore width', 'Wrong property name', 'Missing unit', 'Nothing wrong'],
                 'correct_answer': 0, 'explanation': 'Inline elements don\'t respect width/height. Use inline-block.'},
            ],
            
            # Level 7: Positioning
            7: [
                {'question_type': 'multiple-choice', 'question_text': 'What is the default position value?',
                 'options': ['absolute', 'relative', 'static', 'fixed'],
                 'correct_answer': 2, 'explanation': 'Elements have position: static by default.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Position relative to viewport:',
                 'code_snippet': '.navbar {\n  position: ____;\n  top: 0;\n}',
                 'options': ['fixed', 'absolute', 'relative', 'static'],
                 'correct_answer': 0, 'explanation': 'position: fixed positions relative to the viewport.'},
                
                {'question_type': 'output', 'question_text': 'What does position: absolute do?',
                 'code_snippet': '.box {\n  position: absolute;\n  top: 50px;\n  left: 100px;\n}',
                 'options': ['Positions relative to viewport', 'Positions relative to nearest positioned ancestor', 'Stays in normal flow', 'Centers the element'],
                 'correct_answer': 1, 'explanation': 'Absolute positioning is relative to the nearest positioned ancestor.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Enable absolute positioning for children:',
                 'code_snippet': '.parent {\n  position: ____;\n}\n.child {\n  position: absolute;\n}',
                 'options': ['relative', 'static', 'inherit', 'initial'],
                 'correct_answer': 0, 'explanation': 'The parent needs position: relative for absolute children to position relative to it.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'Which property controls stacking order?',
                 'options': ['order', 'stack', 'z-index', 'layer'],
                 'correct_answer': 2, 'explanation': 'z-index controls which positioned elements appear on top.'},
            ],
            
            # Level 8: Flexbox Basics
            8: [
                {'question_type': 'fill-blank', 'question_text': 'Enable flexbox:',
                 'code_snippet': '.container {\n  display: ____;\n}',
                 'options': ['flex', 'flexbox', 'flexible', 'flex-container'],
                 'correct_answer': 0, 'explanation': 'display: flex creates a flex container.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Center items horizontally in flexbox:',
                 'code_snippet': '.container {\n  display: flex;\n  ____: center;\n}',
                 'options': ['justify-content', 'align-items', 'text-align', 'horizontal-align'],
                 'correct_answer': 0, 'explanation': 'justify-content aligns items along the main axis (horizontal by default).'},
                
                {'question_type': 'fill-blank', 'question_text': 'Center items vertically in flexbox:',
                 'code_snippet': '.container {\n  display: flex;\n  ____: center;\n}',
                 'options': ['align-items', 'justify-content', 'vertical-align', 'align-content'],
                 'correct_answer': 0, 'explanation': 'align-items aligns items along the cross axis (vertical by default).'},
                
                {'question_type': 'output', 'question_text': 'What does flex-direction: column do?',
                 'code_snippet': '.container {\n  display: flex;\n  flex-direction: column;\n}',
                 'options': ['Items side by side', 'Items stacked vertically', 'Creates columns', 'Reverses order'],
                 'correct_answer': 1, 'explanation': 'flex-direction: column stacks flex items vertically.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What does flex-wrap: wrap do?',
                 'options': ['Wraps text', 'Allows items to wrap to new lines', 'Wraps the container', 'Creates a border'],
                 'correct_answer': 1, 'explanation': 'flex-wrap: wrap allows items to wrap to the next line when needed.'},
            ],
            
            # Level 9: Flexbox Advanced
            9: [
                {'question_type': 'fill-blank', 'question_text': 'Make an item grow to fill space:',
                 'code_snippet': '.item {\n  flex-____: 1;\n}',
                 'options': ['grow', 'expand', 'fill', 'stretch'],
                 'correct_answer': 0, 'explanation': 'flex-grow: 1 allows the item to grow and fill available space.'},
                
                {'question_type': 'output', 'question_text': 'What does flex: 1 mean?',
                 'code_snippet': '.item { flex: 1; }',
                 'options': ['Width of 1px', 'flex-grow: 1, flex-shrink: 1, flex-basis: 0', 'First item only', 'One column'],
                 'correct_answer': 1, 'explanation': 'flex: 1 is shorthand for flex-grow: 1, flex-shrink: 1, flex-basis: 0.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Add space between items:',
                 'code_snippet': '.container {\n  display: flex;\n  ____: 20px;\n}',
                 'options': ['gap', 'spacing', 'space', 'gutter'],
                 'correct_answer': 0, 'explanation': 'gap adds space between flex items.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What does justify-content: space-between do?',
                 'options': ['Centers all items', 'Equal space between items, none at edges', 'Equal space around items', 'Aligns to start'],
                 'correct_answer': 1, 'explanation': 'space-between puts equal space between items with no space at the edges.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Align a single item differently:',
                 'code_snippet': '.special-item {\n  align-____: flex-end;\n}',
                 'options': ['self', 'item', 'single', 'one'],
                 'correct_answer': 0, 'explanation': 'align-self overrides align-items for a specific flex item.'},
            ],
            
            # Level 10: CSS Grid Basics
            10: [
                {'question_type': 'fill-blank', 'question_text': 'Enable CSS Grid:',
                 'code_snippet': '.container {\n  display: ____;\n}',
                 'options': ['grid', 'css-grid', 'grid-container', 'table'],
                 'correct_answer': 0, 'explanation': 'display: grid creates a grid container.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Define three equal columns:',
                 'code_snippet': '.container {\n  display: grid;\n  grid-template-____: 1fr 1fr 1fr;\n}',
                 'options': ['columns', 'cols', 'column', 'width'],
                 'correct_answer': 0, 'explanation': 'grid-template-columns defines column sizes.'},
                
                {'question_type': 'output', 'question_text': 'What does 1fr mean?',
                 'code_snippet': 'grid-template-columns: 1fr 2fr;',
                 'options': ['1 frame', '1 fraction of available space', '1 pixel', '1 percent'],
                 'correct_answer': 1, 'explanation': 'fr is a fractional unit representing a portion of available space.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What does repeat(3, 1fr) do?',
                 'options': ['Repeats content 3 times', 'Creates 3 equal columns', 'Loops 3 times', 'Sets 3px width'],
                 'correct_answer': 1, 'explanation': 'repeat(3, 1fr) is shorthand for 1fr 1fr 1fr.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Add gap between grid items:',
                 'code_snippet': '.container {\n  display: grid;\n  ____: 10px;\n}',
                 'options': ['gap', 'grid-gap', 'spacing', 'gutter'],
                 'correct_answer': 0, 'explanation': 'gap (or grid-gap) adds space between grid items.'},
            ],
            
            # Level 11: Grid Advanced
            11: [
                {'question_type': 'fill-blank', 'question_text': 'Span multiple columns:',
                 'code_snippet': '.item {\n  grid-____: span 2;\n}',
                 'options': ['column', 'col', 'columns', 'span'],
                 'correct_answer': 0, 'explanation': 'grid-column: span 2 makes an item span 2 columns.'},
                
                {'question_type': 'output', 'question_text': 'What does grid-column: 1 / 3 mean?',
                 'code_snippet': '.item { grid-column: 1 / 3; }',
                 'options': ['Columns 1 and 3', 'From line 1 to line 3 (spans 2 columns)', 'Column ratio 1:3', 'First 3 columns'],
                 'correct_answer': 1, 'explanation': 'grid-column: 1 / 3 spans from grid line 1 to grid line 3.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Define named grid areas:',
                 'code_snippet': '.container {\n  display: grid;\n  grid-template-____:\n    "header header"\n    "sidebar main";\n}',
                 'options': ['areas', 'regions', 'zones', 'sections'],
                 'correct_answer': 0, 'explanation': 'grid-template-areas defines named grid regions.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What does auto-fit do in repeat()?',
                 'options': ['Auto sizes all columns', 'Fits as many columns as possible', 'Automatically centers', 'Fits content width'],
                 'correct_answer': 1, 'explanation': 'auto-fit creates as many columns as will fit in the container.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Set minimum and maximum column size:',
                 'code_snippet': 'grid-template-columns: repeat(auto-fit, ____(200px, 1fr));',
                 'options': ['minmax', 'min-max', 'range', 'clamp'],
                 'correct_answer': 0, 'explanation': 'minmax(200px, 1fr) sets minimum 200px and maximum 1fr.'},
            ],
            
            # Level 12: Responsive Design
            12: [
                {'question_type': 'fill-blank', 'question_text': 'Create a media query:',
                 'code_snippet': '@____ (max-width: 768px) {\n  .container { width: 100%; }\n}',
                 'options': ['media', 'screen', 'responsive', 'query'],
                 'correct_answer': 0, 'explanation': '@media creates responsive breakpoints.'},
                
                {'question_type': 'output', 'question_text': 'When does this CSS apply?',
                 'code_snippet': '@media (max-width: 600px) {\n  body { font-size: 14px; }\n}',
                 'options': ['Screens wider than 600px', 'Screens 600px or narrower', 'All screens', 'Print only'],
                 'correct_answer': 1, 'explanation': 'max-width: 600px applies to screens 600px wide or less.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Target screens wider than 768px:',
                 'code_snippet': '@media (____-width: 768px) {\n  .sidebar { display: block; }\n}',
                 'options': ['min', 'max', 'from', 'above'],
                 'correct_answer': 0, 'explanation': 'min-width applies to screens at least that wide.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What does the viewport meta tag do?',
                 'options': ['Creates viewports', 'Controls how page scales on mobile', 'Adds a border', 'Sets background'],
                 'correct_answer': 1, 'explanation': 'The viewport meta tag controls scaling and width on mobile devices.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Use relative font size:',
                 'code_snippet': 'body {\n  font-size: 16px;\n}\nh1 {\n  font-size: 2____;\n}',
                 'options': ['rem', 'px', 'pt', 'em'],
                 'correct_answer': 0, 'explanation': 'rem is relative to root font size, making it responsive.'},
            ],
            
            # Level 13: Transitions and Transforms
            13: [
                {'question_type': 'fill-blank', 'question_text': 'Add a smooth transition:',
                 'code_snippet': '.button {\n  ____: background-color 0.3s ease;\n}',
                 'options': ['transition', 'animation', 'transform', 'smooth'],
                 'correct_answer': 0, 'explanation': 'transition creates smooth changes between property values.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Rotate an element:',
                 'code_snippet': '.icon {\n  ____: rotate(45deg);\n}',
                 'options': ['transform', 'rotation', 'rotate', 'turn'],
                 'correct_answer': 0, 'explanation': 'transform with rotate() rotates elements.'},
                
                {'question_type': 'output', 'question_text': 'What does scale(1.5) do?',
                 'code_snippet': '.box:hover {\n  transform: scale(1.5);\n}',
                 'options': ['Moves element', 'Makes element 150% size', 'Rotates 1.5 degrees', 'Sets opacity to 1.5'],
                 'correct_answer': 1, 'explanation': 'scale(1.5) makes the element 150% of its original size.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What does translate(50px, 100px) do?',
                 'options': ['Rotates element', 'Changes language', 'Moves element 50px right, 100px down', 'Scales element'],
                 'correct_answer': 2, 'explanation': 'translate() moves an element from its current position.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Transition all properties:',
                 'code_snippet': '.card {\n  transition: ____ 0.3s ease;\n}',
                 'options': ['all', 'every', 'any', '*'],
                 'correct_answer': 0, 'explanation': 'transition: all transitions any property that changes.'},
            ],
            
            # Level 14: Animations
            14: [
                {'question_type': 'fill-blank', 'question_text': 'Define a keyframe animation:',
                 'code_snippet': '@____ fadeIn {\n  from { opacity: 0; }\n  to { opacity: 1; }\n}',
                 'options': ['keyframes', 'animation', 'animate', 'frames'],
                 'correct_answer': 0, 'explanation': '@keyframes defines animation sequences.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Apply an animation:',
                 'code_snippet': '.element {\n  ____: fadeIn 1s ease-in-out;\n}',
                 'options': ['animation', 'keyframes', 'animate', 'transition'],
                 'correct_answer': 0, 'explanation': 'The animation property applies keyframe animations.'},
                
                {'question_type': 'output', 'question_text': 'What does animation-iteration-count: infinite do?',
                 'code_snippet': '.spinner {\n  animation: spin 1s linear infinite;\n}',
                 'options': ['Runs once', 'Runs forever', 'Runs very fast', 'Never runs'],
                 'correct_answer': 1, 'explanation': 'infinite makes the animation repeat forever.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What timing function creates a bounce effect?',
                 'options': ['linear', 'ease', 'cubic-bezier', 'step'],
                 'correct_answer': 2, 'explanation': 'cubic-bezier allows custom timing curves including bounce effects.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Pause animation on hover:',
                 'code_snippet': '.animated:hover {\n  animation-play-____: paused;\n}',
                 'options': ['state', 'status', 'mode', 'control'],
                 'correct_answer': 0, 'explanation': 'animation-play-state controls whether animation is running or paused.'},
            ],
            
            # Level 15: Final Boss - Advanced CSS
            15: [
                {'question_type': 'fill-blank', 'question_text': 'Define a CSS variable:',
                 'code_snippet': ':root {\n  ____primary-color: #3498db;\n}',
                 'options': ['--', '$', '@', '%'],
                 'correct_answer': 0, 'explanation': 'CSS custom properties (variables) start with --.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Use a CSS variable:',
                 'code_snippet': '.button {\n  background-color: ____(--primary-color);\n}',
                 'options': ['var', 'get', 'use', '$'],
                 'correct_answer': 0, 'explanation': 'var() retrieves the value of a CSS custom property.'},
                
                {'question_type': 'output', 'question_text': 'What does clamp(1rem, 2.5vw, 2rem) do?',
                 'code_snippet': 'h1 { font-size: clamp(1rem, 2.5vw, 2rem); }',
                 'options': ['Sets fixed size', 'Fluid size between min and max', 'Clamps to viewport', 'Creates columns'],
                 'correct_answer': 1, 'explanation': 'clamp() sets a value that scales between a minimum and maximum.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What does :is(h1, h2, h3) do?',
                 'options': ['Checks if element exists', 'Matches any of the selectors', 'Creates new elements', 'Validates HTML'],
                 'correct_answer': 1, 'explanation': ':is() matches any of the selectors in the list.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Apply styles if feature is supported:',
                 'code_snippet': '@____ (display: grid) {\n  .container { display: grid; }\n}',
                 'options': ['supports', 'if', 'feature', 'check'],
                 'correct_answer': 0, 'explanation': '@supports checks if a CSS feature is supported.'},
            ],
        }
        
        # Seed CSS questions
        self.stdout.write('\nSeeding CSS questions...')
        for level, questions in css_questions.items():
            for order, q in enumerate(questions, 1):
                Question.objects.create(
                    topic=css_topic,
                    level=level,
                    question_type=q['question_type'],
                    question_text=q['question_text'],
                    code_snippet=q.get('code_snippet', ''),
                    highlight_line=q.get('highlight_line'),
                    options=q['options'],
                    correct_answer=q['correct_answer'],
                    explanation=q['explanation'],
                    order=order
                )
            self.stdout.write(f'  Level {level}: {len(questions)} questions')
        
        # ============================================================
        # REACT QUESTIONS (15 Levels × 5 Questions = 75 Questions)
        # ============================================================
        
        react_questions = {
            # Level 1: React Basics
            1: [
                {'question_type': 'multiple-choice', 'question_text': 'What is React?',
                 'options': ['A programming language', 'A JavaScript library for building UIs', 'A database', 'A CSS framework'],
                 'correct_answer': 1, 'explanation': 'React is a JavaScript library for building user interfaces.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Import React in a component:',
                 'code_snippet': "____ React from 'react';",
                 'options': ['import', 'require', 'include', 'use'],
                 'correct_answer': 0, 'explanation': 'import is used to bring React into a component file.'},
                
                {'question_type': 'output', 'question_text': 'What does JSX allow you to do?',
                 'code_snippet': 'const element = <h1>Hello, World!</h1>;',
                 'options': ['Write CSS in JS', 'Write HTML-like syntax in JavaScript', 'Create databases', 'Style components'],
                 'correct_answer': 1, 'explanation': 'JSX lets you write HTML-like syntax that gets compiled to JavaScript.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What is a React component?',
                 'options': ['A CSS class', 'A reusable piece of UI', 'A database table', 'An HTML file'],
                 'correct_answer': 1, 'explanation': 'Components are reusable, independent pieces of UI.'},
                
                {'question_type': 'find-error', 'question_text': 'Find the error:',
                 'code_snippet': 'function App() {\n  return (\n    <h1>Hello</h1>\n    <p>World</p>\n  );\n}',
                 'highlight_line': 3,
                 'options': ['Must have a single parent element', 'Wrong function syntax', 'Missing export', 'Nothing wrong'],
                 'correct_answer': 0, 'explanation': 'JSX must return a single parent element. Use a fragment <> or div.'},
            ],
            
            # Level 2: Components
            2: [
                {'question_type': 'fill-blank', 'question_text': 'Create a functional component:',
                 'code_snippet': '____  Greeting() {\n  return <h1>Hello!</h1>;\n}',
                 'options': ['function', 'component', 'const', 'def'],
                 'correct_answer': 0, 'explanation': 'Functional components are created with the function keyword.'},
                
                {'question_type': 'output', 'question_text': 'How do you use a component?',
                 'code_snippet': 'function App() {\n  return <Greeting />;\n}',
                 'options': ['As a function call', 'As a JSX tag', 'As a string', 'As a variable'],
                 'correct_answer': 1, 'explanation': 'Components are used as JSX tags with angle brackets.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Export a component:',
                 'code_snippet': 'function Button() {\n  return <button>Click</button>;\n}\n\nexport ____ Button;',
                 'options': ['default', 'module', 'component', 'public'],
                 'correct_answer': 0, 'explanation': 'export default exports the component as the default export.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'Component names must start with:',
                 'options': ['Lowercase letter', 'Uppercase letter', 'Number', 'Underscore'],
                 'correct_answer': 1, 'explanation': 'React components must start with an uppercase letter.'},
                
                {'question_type': 'find-error', 'question_text': 'Find the error:',
                 'code_snippet': 'function myComponent() {\n  return <div>Hello</div>;\n}',
                 'highlight_line': 1,
                 'options': ['Component name should be uppercase', 'Wrong return syntax', 'Missing export', 'Nothing wrong'],
                 'correct_answer': 0, 'explanation': 'Component names must start with uppercase: MyComponent.'},
            ],
            
            # Level 3: Props
            3: [
                {'question_type': 'fill-blank', 'question_text': 'Pass a prop to a component:',
                 'code_snippet': 'function App() {\n  return <Greeting ____="Alice" />;\n}',
                 'options': ['name', 'props', 'value', 'data'],
                 'correct_answer': 0, 'explanation': 'Props are passed as attributes in JSX.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Access props in a component:',
                 'code_snippet': 'function Greeting(____) {\n  return <h1>Hello, {props.name}!</h1>;\n}',
                 'options': ['props', 'args', 'params', 'data'],
                 'correct_answer': 0, 'explanation': 'Props are received as the first parameter of functional components.'},
                
                {'question_type': 'output', 'question_text': 'What gets rendered?',
                 'code_snippet': 'function Welcome({ name }) {\n  return <h1>Hi, {name}</h1>;\n}\n<Welcome name="Bob" />',
                 'options': ['Hi, {name}', 'Hi, Bob', 'Hi, undefined', 'Error'],
                 'correct_answer': 1, 'explanation': 'The name prop "Bob" is rendered in the h1.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'Props in React are:',
                 'options': ['Mutable', 'Read-only', 'Optional always', 'Only strings'],
                 'correct_answer': 1, 'explanation': 'Props are read-only and should not be modified.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Destructure props:',
                 'code_snippet': 'function Card({ title, ____ }) {\n  return <div>{title} - {content}</div>;\n}',
                 'options': ['content', 'props.content', 'this.content', 'state.content'],
                 'correct_answer': 0, 'explanation': 'Destructuring extracts specific props directly in the parameter.'},
            ],
            
            # Level 4: State with useState
            4: [
                {'question_type': 'fill-blank', 'question_text': 'Import useState hook:',
                 'code_snippet': "import { ____ } from 'react';",
                 'options': ['useState', 'state', 'State', 'useStateHook'],
                 'correct_answer': 0, 'explanation': 'useState is imported from react to manage component state.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Initialize state:',
                 'code_snippet': 'const [count, setCount] = ____(0);',
                 'options': ['useState', 'state', 'createState', 'initState'],
                 'correct_answer': 0, 'explanation': 'useState(initialValue) returns [state, setState].'},
                
                {'question_type': 'output', 'question_text': 'What does setCount do?',
                 'code_snippet': 'const [count, setCount] = useState(0);\nsetCount(5);',
                 'options': ['Returns 5', 'Updates count to 5', 'Creates new state', 'Nothing'],
                 'correct_answer': 1, 'explanation': 'setCount updates the state value and triggers a re-render.'},
                
                {'question_type': 'find-error', 'question_text': 'Find the error:',
                 'code_snippet': 'const [count, setCount] = useState(0);\ncount = 5;',
                 'highlight_line': 2,
                 'options': ['Cannot directly modify state', 'Wrong syntax', 'Missing import', 'Nothing wrong'],
                 'correct_answer': 0, 'explanation': 'State must be updated using the setter function, not direct assignment.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Update state based on previous value:',
                 'code_snippet': 'setCount(____ => prev + 1);',
                 'options': ['prev', 'count', 'state', 'this'],
                 'correct_answer': 0, 'explanation': 'Using a callback ensures you get the latest state value.'},
            ],
            
            # Level 5: Event Handling
            5: [
                {'question_type': 'fill-blank', 'question_text': 'Handle a click event:',
                 'code_snippet': '<button ____={handleClick}>Click me</button>',
                 'options': ['onClick', 'onclick', 'onPress', 'click'],
                 'correct_answer': 0, 'explanation': 'React uses camelCase event names like onClick.'},
                
                {'question_type': 'output', 'question_text': 'What is e in event handlers?',
                 'code_snippet': 'function handleClick(e) {\n  e.preventDefault();\n}',
                 'options': ['Error object', 'Synthetic event object', 'Element', 'Nothing'],
                 'correct_answer': 1, 'explanation': 'e is a SyntheticEvent that wraps the native browser event.'},
                
                {'question_type': 'find-error', 'question_text': 'Find the error:',
                 'code_snippet': '<button onClick={handleClick()}>Click</button>',
                 'highlight_line': 1,
                 'options': ['Function is called immediately, not on click', 'Wrong event name', 'Missing handler', 'Nothing wrong'],
                 'correct_answer': 0, 'explanation': 'Remove () to pass the function reference, not call it immediately.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Pass arguments to event handler:',
                 'code_snippet': '<button onClick={() => handleDelete(____)}>Delete</button>',
                 'options': ['id', 'event', 'this', 'e'],
                 'correct_answer': 0, 'explanation': 'Use an arrow function to pass additional arguments.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'How do you handle form input changes?',
                 'options': ['onInput', 'onChange', 'onType', 'onUpdate'],
                 'correct_answer': 1, 'explanation': 'onChange fires when the input value changes.'},
            ],
            
            # Level 6: Conditional Rendering
            6: [
                {'question_type': 'fill-blank', 'question_text': 'Conditionally render with &&:',
                 'code_snippet': '{isLoggedIn ____ <WelcomeMessage />}',
                 'options': ['&&', '||', '?', ':'],
                 'correct_answer': 0, 'explanation': '&& renders the right side only if left side is truthy.'},
                
                {'question_type': 'output', 'question_text': 'What renders when show is false?',
                 'code_snippet': '{show && <Modal />}',
                 'options': ['Modal component', 'Nothing', 'false', 'Error'],
                 'correct_answer': 1, 'explanation': 'When show is false, nothing is rendered.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Use ternary for conditional rendering:',
                 'code_snippet': '{isAdmin ____ <AdminPanel /> : <UserPanel />}',
                 'options': ['?', '&&', '||', ':'],
                 'correct_answer': 0, 'explanation': 'Ternary operator: condition ? trueCase : falseCase.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What does returning null do in a component?',
                 'options': ['Throws an error', 'Renders nothing', 'Renders "null"', 'Crashes the app'],
                 'correct_answer': 1, 'explanation': 'Returning null renders nothing to the DOM.'},
                
                {'question_type': 'output', 'question_text': 'What renders?',
                 'code_snippet': 'const count = 0;\n{count && <p>You have items</p>}',
                 'options': ['<p>You have items</p>', 'Nothing', '0', 'false'],
                 'correct_answer': 2, 'explanation': '0 is falsy but rendered. Use count > 0 && instead.'},
            ],
            
            # Level 7: Lists and Keys
            7: [
                {'question_type': 'fill-blank', 'question_text': 'Render a list:',
                 'code_snippet': '{items.____(item => <li key={item.id}>{item.name}</li>)}',
                 'options': ['map', 'forEach', 'filter', 'reduce'],
                 'correct_answer': 0, 'explanation': 'map() transforms each item into a React element.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Add a unique identifier:',
                 'code_snippet': '<li ____={item.id}>{item.name}</li>',
                 'options': ['key', 'id', 'index', 'ref'],
                 'correct_answer': 0, 'explanation': 'key helps React identify which items changed.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'Why are keys important in lists?',
                 'options': ['For styling', 'For React to efficiently update the DOM', 'For sorting', 'They are optional'],
                 'correct_answer': 1, 'explanation': 'Keys help React identify which items changed, were added, or removed.'},
                
                {'question_type': 'find-error', 'question_text': 'What is wrong with using index as key?',
                 'code_snippet': '{items.map((item, index) => <li key={index}>{item}</li>)}',
                 'highlight_line': 1,
                 'options': ['Can cause issues when list order changes', 'Syntax error', 'Missing import', 'Nothing wrong'],
                 'correct_answer': 0, 'explanation': 'Using index as key can cause issues when items are reordered or deleted.'},
                
                {'question_type': 'output', 'question_text': 'What does filter + map do?',
                 'code_snippet': '{users.filter(u => u.active).map(u => <User key={u.id} {...u} />)}',
                 'options': ['Renders all users', 'Renders only active users', 'Filters then maps separately', 'Error'],
                 'correct_answer': 1, 'explanation': 'filter removes inactive users, then map renders the rest.'},
            ],
            
            # Level 8: useEffect Hook
            8: [
                {'question_type': 'fill-blank', 'question_text': 'Import useEffect:',
                 'code_snippet': "import { useState, ____ } from 'react';",
                 'options': ['useEffect', 'effect', 'sideEffect', 'useEffectHook'],
                 'correct_answer': 0, 'explanation': 'useEffect is imported from react for side effects.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Run effect on every render:',
                 'code_snippet': 'useEffect(() => {\n  console.log("Rendered");\n}____);',
                 'options': ['', ', []', ', [count]', ', null'],
                 'correct_answer': 0, 'explanation': 'Without a dependency array, effect runs after every render.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Run effect only on mount:',
                 'code_snippet': 'useEffect(() => {\n  fetchData();\n}, ____);',
                 'options': ['[]', '[data]', 'null', '{}'],
                 'correct_answer': 0, 'explanation': 'Empty array [] means run only once when component mounts.'},
                
                {'question_type': 'output', 'question_text': 'When does this effect run?',
                 'code_snippet': 'useEffect(() => {\n  console.log(count);\n}, [count]);',
                 'options': ['Every render', 'Only on mount', 'When count changes', 'Never'],
                 'correct_answer': 2, 'explanation': 'Effect runs when count changes (and on initial mount).'},
                
                {'question_type': 'fill-blank', 'question_text': 'Cleanup in useEffect:',
                 'code_snippet': 'useEffect(() => {\n  const timer = setInterval(tick, 1000);\n  ____ () => clearInterval(timer);\n}, []);',
                 'options': ['return', 'cleanup', 'finally', 'done'],
                 'correct_answer': 0, 'explanation': 'Return a function from useEffect for cleanup.'},
            ],
            
            # Level 9: Forms
            9: [
                {'question_type': 'fill-blank', 'question_text': 'Controlled input:',
                 'code_snippet': '<input ____={name} onChange={e => setName(e.target.value)} />',
                 'options': ['value', 'text', 'data', 'content'],
                 'correct_answer': 0, 'explanation': 'value makes it a controlled component tied to state.'},
                
                {'question_type': 'output', 'question_text': 'What is a controlled component?',
                 'code_snippet': '<input value={name} onChange={handleChange} />',
                 'options': ['Input with no value', 'Input controlled by React state', 'Input with default value', 'Disabled input'],
                 'correct_answer': 1, 'explanation': 'Controlled components have their value controlled by React state.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Handle form submission:',
                 'code_snippet': '<form ____={handleSubmit}>\n  <button type="submit">Submit</button>\n</form>',
                 'options': ['onSubmit', 'onClick', 'onSend', 'action'],
                 'correct_answer': 0, 'explanation': 'onSubmit handles form submission events.'},
                
                {'question_type': 'find-error', 'question_text': 'Why does the page refresh?',
                 'code_snippet': 'function handleSubmit(e) {\n  console.log("Submitted");\n}',
                 'highlight_line': 2,
                 'options': ['Missing e.preventDefault()', 'Wrong event', 'Missing state', 'Nothing wrong'],
                 'correct_answer': 0, 'explanation': 'Forms refresh the page by default. Use e.preventDefault().'},
                
                {'question_type': 'fill-blank', 'question_text': 'Get input value on change:',
                 'code_snippet': 'onChange={e => setName(e.____.____)}}',
                 'options': ['target.value', 'current.text', 'input.data', 'value.text'],
                 'correct_answer': 0, 'explanation': 'e.target.value contains the current input value.'},
            ],
            
            # Level 10: Context API
            10: [
                {'question_type': 'fill-blank', 'question_text': 'Create a context:',
                 'code_snippet': 'const ThemeContext = React.____();',
                 'options': ['createContext', 'newContext', 'Context', 'makeContext'],
                 'correct_answer': 0, 'explanation': 'createContext creates a new context object.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Provide context value:',
                 'code_snippet': '<ThemeContext.____ value="dark">\n  <App />\n</ThemeContext.Provider>',
                 'options': ['Provider', 'Consumer', 'Context', 'Wrapper'],
                 'correct_answer': 0, 'explanation': 'Provider makes the context value available to descendants.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Consume context with hook:',
                 'code_snippet': 'const theme = ____(ThemeContext);',
                 'options': ['useContext', 'getContext', 'consumeContext', 'context'],
                 'correct_answer': 0, 'explanation': 'useContext hook reads the current context value.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'When should you use Context?',
                 'options': ['For all state', 'For global/shared state', 'Never', 'Only for themes'],
                 'correct_answer': 1, 'explanation': 'Context is best for global state that many components need.'},
                
                {'question_type': 'output', 'question_text': 'What happens without a Provider?',
                 'code_snippet': 'const ThemeContext = createContext("light");\nconst theme = useContext(ThemeContext);',
                 'options': ['Error', 'undefined', 'Default value "light"', 'null'],
                 'correct_answer': 2, 'explanation': 'Without a Provider, useContext returns the default value.'},
            ],
            
            # Level 11: Custom Hooks
            11: [
                {'question_type': 'fill-blank', 'question_text': 'Custom hook naming convention:',
                 'code_snippet': 'function ____Counter() {\n  const [count, setCount] = useState(0);\n  return { count, increment: () => setCount(c => c + 1) };\n}',
                 'options': ['use', 'custom', 'hook', 'my'],
                 'correct_answer': 0, 'explanation': 'Custom hooks must start with "use" prefix.'},
                
                {'question_type': 'output', 'question_text': 'Why create custom hooks?',
                 'code_snippet': 'function useWindowSize() { /* ... */ }',
                 'options': ['For styling', 'To reuse stateful logic', 'To create components', 'For optimization'],
                 'correct_answer': 1, 'explanation': 'Custom hooks extract and reuse stateful logic across components.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'Can custom hooks call other hooks?',
                 'options': ['No', 'Yes', 'Only useState', 'Only useEffect'],
                 'correct_answer': 1, 'explanation': 'Custom hooks can call any hooks including other custom hooks.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Use a custom hook:',
                 'code_snippet': 'function App() {\n  const { data, loading } = ____("/api/users");\n}',
                 'options': ['useFetch', 'fetch', 'getData', 'useData'],
                 'correct_answer': 0, 'explanation': 'Custom hooks are called like regular hooks in components.'},
                
                {'question_type': 'find-error', 'question_text': 'Why does this fail?',
                 'code_snippet': 'function getUser() {\n  const [user, setUser] = useState(null);\n  return user;\n}',
                 'highlight_line': 1,
                 'options': ['Not a valid hook name (missing "use")', 'Wrong return', 'Missing useEffect', 'Nothing wrong'],
                 'correct_answer': 0, 'explanation': 'Function using hooks must start with "use" to be a valid hook.'},
            ],
            
            # Level 12: useRef and DOM
            12: [
                {'question_type': 'fill-blank', 'question_text': 'Create a ref:',
                 'code_snippet': 'const inputRef = ____();',
                 'options': ['useRef', 'createRef', 'ref', 'useReference'],
                 'correct_answer': 0, 'explanation': 'useRef creates a mutable ref object.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Attach ref to element:',
                 'code_snippet': '<input ____={inputRef} />',
                 'options': ['ref', 'useRef', 'reference', 'bind'],
                 'correct_answer': 0, 'explanation': 'ref attribute attaches the ref to a DOM element.'},
                
                {'question_type': 'output', 'question_text': 'How do you access the DOM element?',
                 'code_snippet': 'const inputRef = useRef();\n// After render:\ninputRef.____',
                 'options': ['value', 'current', 'element', 'dom'],
                 'correct_answer': 1, 'explanation': 'ref.current contains the DOM element or value.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'Does changing ref.current trigger a re-render?',
                 'options': ['Yes', 'No', 'Only with useEffect', 'Depends on the value'],
                 'correct_answer': 1, 'explanation': 'Refs are mutable and don\'t trigger re-renders when changed.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Focus an input on mount:',
                 'code_snippet': 'useEffect(() => {\n  inputRef.current.____();\n}, []);',
                 'options': ['focus', 'select', 'click', 'activate'],
                 'correct_answer': 0, 'explanation': 'Calling focus() on the DOM element focuses it.'},
            ],
            
            # Level 13: Performance Optimization
            13: [
                {'question_type': 'fill-blank', 'question_text': 'Memoize a component:',
                 'code_snippet': 'const MemoizedComponent = React.____(MyComponent);',
                 'options': ['memo', 'memoize', 'cache', 'pure'],
                 'correct_answer': 0, 'explanation': 'React.memo prevents re-renders if props haven\'t changed.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Memoize a computed value:',
                 'code_snippet': 'const sorted = ____(\\n  () => items.sort(),\\n  [items]\\n);',
                 'options': ['useMemo', 'useCallback', 'memo', 'useComputed'],
                 'correct_answer': 0, 'explanation': 'useMemo memoizes expensive calculations.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Memoize a callback function:',
                 'code_snippet': 'const handleClick = ____(\\n  () => console.log(id),\\n  [id]\\n);',
                 'options': ['useCallback', 'useMemo', 'memo', 'useFunction'],
                 'correct_answer': 0, 'explanation': 'useCallback memoizes function references.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'When should you use useMemo?',
                 'options': ['For all calculations', 'For expensive calculations', 'Never', 'Only with arrays'],
                 'correct_answer': 1, 'explanation': 'useMemo is for expensive calculations that shouldn\'t run every render.'},
                
                {'question_type': 'output', 'question_text': 'What is the difference between useMemo and useCallback?',
                 'code_snippet': 'useMemo(() => value)\nuseCallback(() => {})',
                 'options': ['No difference', 'useMemo returns value, useCallback returns function', 'useCallback is faster', 'useMemo is for arrays'],
                 'correct_answer': 1, 'explanation': 'useMemo memoizes values; useCallback memoizes functions.'},
            ],
            
            # Level 14: Error Boundaries and Suspense
            14: [
                {'question_type': 'multiple-choice', 'question_text': 'What catches JavaScript errors in components?',
                 'options': ['try/catch', 'Error boundaries', 'useError hook', 'React.catch'],
                 'correct_answer': 1, 'explanation': 'Error boundaries are components that catch errors in their children.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Lazy load a component:',
                 'code_snippet': "const LazyComponent = React.____(\\n  () => import('./HeavyComponent')\\n);",
                 'options': ['lazy', 'load', 'defer', 'async'],
                 'correct_answer': 0, 'explanation': 'React.lazy enables code splitting with dynamic imports.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Show loading state for lazy component:',
                 'code_snippet': '<React.____ fallback={<Loading />}>\\n  <LazyComponent />\\n</React.Suspense>',
                 'options': ['Suspense', 'Loading', 'Lazy', 'Await'],
                 'correct_answer': 0, 'explanation': 'Suspense shows a fallback while lazy component loads.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'Error boundaries must be:',
                 'options': ['Functional components', 'Class components', 'Hooks', 'Context providers'],
                 'correct_answer': 1, 'explanation': 'Error boundaries must be class components with specific lifecycle methods.'},
                
                {'question_type': 'output', 'question_text': 'What does Suspense\'s fallback prop do?',
                 'code_snippet': '<Suspense fallback={<Spinner />}>',
                 'options': ['Handles errors', 'Shows while loading', 'Provides data', 'Nothing'],
                 'correct_answer': 1, 'explanation': 'fallback is rendered while the child component is loading.'},
            ],
            
            # Level 15: Final Boss - Advanced React
            15: [
                {'question_type': 'fill-blank', 'question_text': 'Use reducer for complex state:',
                 'code_snippet': 'const [state, dispatch] = ____(reducer, initialState);',
                 'options': ['useReducer', 'useState', 'useDispatch', 'createReducer'],
                 'correct_answer': 0, 'explanation': 'useReducer is for complex state logic with actions.'},
                
                {'question_type': 'output', 'question_text': 'What is the purpose of dispatch?',
                 'code_snippet': 'dispatch({ type: "INCREMENT" })',
                 'options': ['Updates state directly', 'Sends action to reducer', 'Creates new state', 'Resets state'],
                 'correct_answer': 1, 'explanation': 'dispatch sends an action to the reducer to update state.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Forward a ref to a child:',
                 'code_snippet': 'const FancyInput = React.____(\\n  (props, ref) => <input ref={ref} {...props} />\\n);',
                 'options': ['forwardRef', 'useRef', 'createRef', 'passRef'],
                 'correct_answer': 0, 'explanation': 'forwardRef passes a ref through a component to a child.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What is React Server Components (RSC)?',
                 'options': ['Components that run only on client', 'Components that render on the server', 'Testing utilities', 'State management'],
                 'correct_answer': 1, 'explanation': 'Server Components render on the server, reducing client bundle size.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Create a portal to render outside parent:',
                 'code_snippet': 'ReactDOM.____(\n  <Modal />,\n  document.getElementById("modal-root")\n);',
                 'options': ['createPortal', 'render', 'portal', 'mount'],
                 'correct_answer': 0, 'explanation': 'createPortal renders children into a different DOM node.'},
            ],
        }
        
        # Seed React questions
        self.stdout.write('\nSeeding React questions...')
        for level, questions in react_questions.items():
            for order, q in enumerate(questions, 1):
                Question.objects.create(
                    topic=react_topic,
                    level=level,
                    question_type=q['question_type'],
                    question_text=q['question_text'],
                    code_snippet=q.get('code_snippet', ''),
                    highlight_line=q.get('highlight_line'),
                    options=q['options'],
                    correct_answer=q['correct_answer'],
                    explanation=q['explanation'],
                    order=order
                )
            self.stdout.write(f'  Level {level}: {len(questions)} questions')
        
        # ============================================================
        # JAVA QUESTIONS (15 Levels × 5 Questions = 75 Questions)
        # ============================================================
        
        java_questions = {
            # Level 1: Java Basics
            1: [
                {'question_type': 'multiple-choice', 'question_text': 'What is Java?',
                 'options': ['A scripting language', 'A compiled, object-oriented language', 'A markup language', 'A database'],
                 'correct_answer': 1, 'explanation': 'Java is a compiled, object-oriented programming language that runs on the JVM.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Print to console:',
                 'code_snippet': 'System.out.____("Hello, World!");',
                 'options': ['println', 'print', 'write', 'output'],
                 'correct_answer': 0, 'explanation': 'System.out.println() prints text with a newline to the console.'},
                
                {'question_type': 'output', 'question_text': 'What does this print?',
                 'code_snippet': 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Java");\n  }\n}',
                 'options': ['Main', 'Java', 'args', 'Nothing'],
                 'correct_answer': 1, 'explanation': 'The program prints "Java" to the console.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What is the entry point of a Java program?',
                 'options': ['start() method', 'main() method', 'run() method', 'init() method'],
                 'correct_answer': 1, 'explanation': 'The main() method is the entry point where Java program execution begins.'},
                
                {'question_type': 'find-error', 'question_text': 'Find the error:',
                 'code_snippet': 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello")\n  }\n}',
                 'highlight_line': 3,
                 'options': ['Missing semicolon', 'Wrong method name', 'Missing class', 'Nothing wrong'],
                 'correct_answer': 0, 'explanation': 'Java statements must end with a semicolon.'},
            ],
            
            # Level 2: Variables and Data Types
            2: [
                {'question_type': 'fill-blank', 'question_text': 'Declare an integer:',
                 'code_snippet': '____ age = 25;',
                 'options': ['int', 'integer', 'Integer', 'num'],
                 'correct_answer': 0, 'explanation': 'int is the primitive type for integers in Java.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Declare a decimal number:',
                 'code_snippet': '____ price = 19.99;',
                 'options': ['double', 'float', 'decimal', 'number'],
                 'correct_answer': 0, 'explanation': 'double is the default type for decimal numbers in Java.'},
                
                {'question_type': 'output', 'question_text': 'What is the value of x?',
                 'code_snippet': 'int x = 10;\nx = x + 5;',
                 'options': ['10', '15', '5', 'Error'],
                 'correct_answer': 1, 'explanation': 'x starts at 10 and 5 is added, making it 15.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'Which is a valid variable name?',
                 'options': ['2count', 'my-var', '_total', 'class'],
                 'correct_answer': 2, 'explanation': 'Variable names can start with underscore but not numbers or hyphens, and cannot be reserved words.'},
                
                {'question_type': 'find-error', 'question_text': 'Find the error:',
                 'code_snippet': 'String name = "John";\nname = 42;',
                 'highlight_line': 2,
                 'options': ['Type mismatch - cannot assign int to String', 'Missing semicolon', 'Invalid variable name', 'Nothing wrong'],
                 'correct_answer': 0, 'explanation': 'Java is strongly typed. You cannot assign an int to a String variable.'},
            ],
            
            # Level 3: Operators
            3: [
                {'question_type': 'output', 'question_text': 'What is the result?',
                 'code_snippet': 'int a = 10;\nint b = 3;\nSystem.out.println(a / b);',
                 'options': ['3.33', '3', '4', '10'],
                 'correct_answer': 1, 'explanation': 'Integer division in Java truncates the decimal part. 10/3 = 3.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Get the remainder:',
                 'code_snippet': 'int remainder = 17 ____ 5;',
                 'options': ['%', '/', 'mod', 'rem'],
                 'correct_answer': 0, 'explanation': 'The modulo operator % returns the remainder of division.'},
                
                {'question_type': 'output', 'question_text': 'What does this print?',
                 'code_snippet': 'int x = 5;\nSystem.out.println(++x);',
                 'options': ['5', '6', '4', 'Error'],
                 'correct_answer': 1, 'explanation': 'Pre-increment ++x increments first, then returns the value (6).'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What does && represent?',
                 'options': ['Bitwise AND', 'Logical AND', 'Assignment', 'Comparison'],
                 'correct_answer': 1, 'explanation': '&& is the logical AND operator - both conditions must be true.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Check if two strings are equal:',
                 'code_snippet': 'String a = "hello";\nString b = "hello";\nboolean same = a.____(b);',
                 'options': ['equals', '==', 'compare', 'match'],
                 'correct_answer': 0, 'explanation': 'Use .equals() to compare String content, not == which compares references.'},
            ],
            
            # Level 4: Strings
            4: [
                {'question_type': 'fill-blank', 'question_text': 'Get string length:',
                 'code_snippet': 'String name = "Java";\nint len = name.____();',
                 'options': ['length', 'size', 'count', 'len'],
                 'correct_answer': 0, 'explanation': 'The length() method returns the number of characters in a String.'},
                
                {'question_type': 'output', 'question_text': 'What does this return?',
                 'code_snippet': 'String s = "Hello";\nSystem.out.println(s.charAt(1));',
                 'options': ['H', 'e', 'l', 'Error'],
                 'correct_answer': 1, 'explanation': 'charAt(1) returns the character at index 1, which is "e" (0-indexed).'},
                
                {'question_type': 'fill-blank', 'question_text': 'Convert to uppercase:',
                 'code_snippet': 'String s = "hello";\nString upper = s.____();',
                 'options': ['toUpperCase', 'upper', 'uppercase', 'toUpper'],
                 'correct_answer': 0, 'explanation': 'toUpperCase() returns a new String with all uppercase letters.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'Are Strings mutable in Java?',
                 'options': ['Yes', 'No', 'Only with StringBuilder', 'Depends on the JVM'],
                 'correct_answer': 1, 'explanation': 'Strings are immutable in Java. Operations return new String objects.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Concatenate strings:',
                 'code_snippet': 'String greeting = "Hello" ____ " World";',
                 'options': ['+', '.', '&', ','],
                 'correct_answer': 0, 'explanation': 'The + operator concatenates strings in Java.'},
            ],
            
            # Level 5: Arrays
            5: [
                {'question_type': 'fill-blank', 'question_text': 'Declare an integer array:',
                 'code_snippet': 'int____ numbers = {1, 2, 3, 4, 5};',
                 'options': ['[]', '()', '{}', '<>'],
                 'correct_answer': 0, 'explanation': 'Square brackets [] denote an array type in Java.'},
                
                {'question_type': 'output', 'question_text': 'What does this print?',
                 'code_snippet': 'int[] arr = {10, 20, 30};\nSystem.out.println(arr[1]);',
                 'options': ['10', '20', '30', 'Error'],
                 'correct_answer': 1, 'explanation': 'Array indices start at 0, so arr[1] is 20.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Get array length:',
                 'code_snippet': 'int[] arr = {1, 2, 3};\nint size = arr.____;',
                 'options': ['length', 'size', 'count', 'length()'],
                 'correct_answer': 0, 'explanation': 'Arrays have a length property (not a method) to get their size.'},
                
                {'question_type': 'find-error', 'question_text': 'Find the error:',
                 'code_snippet': 'int[] arr = new int[3];\narr[3] = 10;',
                 'highlight_line': 2,
                 'options': ['Index out of bounds', 'Wrong syntax', 'Missing type', 'Nothing wrong'],
                 'correct_answer': 0, 'explanation': 'Array of size 3 has indices 0, 1, 2. Index 3 is out of bounds.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Create array with size:',
                 'code_snippet': 'int[] numbers = ____ int[5];',
                 'options': ['new', 'create', 'make', 'init'],
                 'correct_answer': 0, 'explanation': 'The new keyword creates a new array instance.'},
            ],
            
            # Level 6: Control Flow
            6: [
                {'question_type': 'fill-blank', 'question_text': 'If-else statement:',
                 'code_snippet': '____ (score >= 60) {\n  System.out.println("Pass");\n} else {\n  System.out.println("Fail");\n}',
                 'options': ['if', 'when', 'check', 'test'],
                 'correct_answer': 0, 'explanation': 'The if keyword starts a conditional statement.'},
                
                {'question_type': 'output', 'question_text': 'What does this print?',
                 'code_snippet': 'int x = 5;\nif (x > 3 && x < 10) {\n  System.out.println("Yes");\n} else {\n  System.out.println("No");\n}',
                 'options': ['Yes', 'No', 'Error', 'Nothing'],
                 'correct_answer': 0, 'explanation': '5 is greater than 3 AND less than 10, so "Yes" is printed.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Switch statement:',
                 'code_snippet': 'switch (day) {\n  ____ 1:\n    System.out.println("Monday");\n    break;\n}',
                 'options': ['case', 'when', 'if', 'match'],
                 'correct_answer': 0, 'explanation': 'The case keyword defines a branch in a switch statement.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What happens without break in switch?',
                 'options': ['Error', 'Fall-through to next case', 'Nothing', 'Loop continues'],
                 'correct_answer': 1, 'explanation': 'Without break, execution falls through to the next case.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Ternary operator:',
                 'code_snippet': 'String result = (age >= 18) ____ "Adult" : "Minor";',
                 'options': ['?', ':', '&&', '||'],
                 'correct_answer': 0, 'explanation': 'The ternary operator uses ? and : for condition ? trueValue : falseValue.'},
            ],
            
            # Level 7: Loops
            7: [
                {'question_type': 'fill-blank', 'question_text': 'For loop:',
                 'code_snippet': '____ (int i = 0; i < 5; i++) {\n  System.out.println(i);\n}',
                 'options': ['for', 'loop', 'while', 'repeat'],
                 'correct_answer': 0, 'explanation': 'The for keyword creates a loop with initialization, condition, and increment.'},
                
                {'question_type': 'output', 'question_text': 'How many times does this loop run?',
                 'code_snippet': 'for (int i = 1; i <= 3; i++) {\n  System.out.println(i);\n}',
                 'options': ['2', '3', '4', '0'],
                 'correct_answer': 1, 'explanation': 'The loop runs for i = 1, 2, 3 (3 iterations).'},
                
                {'question_type': 'fill-blank', 'question_text': 'While loop:',
                 'code_snippet': 'int count = 0;\n____ (count < 5) {\n  count++;\n}',
                 'options': ['while', 'for', 'loop', 'until'],
                 'correct_answer': 0, 'explanation': 'The while keyword creates a loop that runs while the condition is true.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Enhanced for loop:',
                 'code_snippet': 'int[] nums = {1, 2, 3};\nfor (int n ____ nums) {\n  System.out.println(n);\n}',
                 'options': [':', 'in', 'of', '->'],
                 'correct_answer': 0, 'explanation': 'The enhanced for loop uses : to iterate over arrays/collections.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What does break do in a loop?',
                 'options': ['Pauses the loop', 'Exits the loop', 'Skips to next iteration', 'Restarts the loop'],
                 'correct_answer': 1, 'explanation': 'break exits the loop immediately.'},
            ],
            
            # Level 8: Methods
            8: [
                {'question_type': 'fill-blank', 'question_text': 'Define a method that returns int:',
                 'code_snippet': 'public static ____ add(int a, int b) {\n  return a + b;\n}',
                 'options': ['int', 'void', 'Integer', 'return'],
                 'correct_answer': 0, 'explanation': 'The return type must match what the method returns.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Method with no return value:',
                 'code_snippet': 'public static ____ printMessage(String msg) {\n  System.out.println(msg);\n}',
                 'options': ['void', 'null', 'none', 'empty'],
                 'correct_answer': 0, 'explanation': 'void indicates the method does not return a value.'},
                
                {'question_type': 'output', 'question_text': 'What does this return?',
                 'code_snippet': 'public static int square(int n) {\n  return n * n;\n}\nSystem.out.println(square(4));',
                 'options': ['4', '8', '16', 'Error'],
                 'correct_answer': 2, 'explanation': 'square(4) returns 4 * 4 = 16.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What is method overloading?',
                 'options': ['Methods with same name but different parameters', 'Methods that override parent methods', 'Methods that are too long', 'Methods with no parameters'],
                 'correct_answer': 0, 'explanation': 'Method overloading allows multiple methods with the same name but different parameter lists.'},
                
                {'question_type': 'find-error', 'question_text': 'Find the error:',
                 'code_snippet': 'public static int getValue() {\n  System.out.println("Getting value");\n}',
                 'highlight_line': 2,
                 'options': ['Missing return statement', 'Wrong method name', 'Missing parameters', 'Nothing wrong'],
                 'correct_answer': 0, 'explanation': 'Methods with non-void return type must return a value.'},
            ],
            
            # Level 9: Object-Oriented Basics
            9: [
                {'question_type': 'fill-blank', 'question_text': 'Define a class:',
                 'code_snippet': 'public ____ Person {\n  String name;\n  int age;\n}',
                 'options': ['class', 'object', 'struct', 'type'],
                 'correct_answer': 0, 'explanation': 'The class keyword defines a new class in Java.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Create an object:',
                 'code_snippet': 'Person person = ____ Person();',
                 'options': ['new', 'create', 'make', 'init'],
                 'correct_answer': 0, 'explanation': 'The new keyword creates a new instance of a class.'},
                
                {'question_type': 'output', 'question_text': 'What is printed?',
                 'code_snippet': 'class Dog {\n  String name = "Buddy";\n}\nDog d = new Dog();\nSystem.out.println(d.name);',
                 'options': ['Dog', 'Buddy', 'null', 'Error'],
                 'correct_answer': 1, 'explanation': 'The object d has name field set to "Buddy".'},
                
                {'question_type': 'fill-blank', 'question_text': 'Constructor:',
                 'code_snippet': 'public class Car {\n  String model;\n  public ____(String m) {\n    model = m;\n  }\n}',
                 'options': ['Car', 'constructor', 'init', 'new'],
                 'correct_answer': 0, 'explanation': 'Constructor has the same name as the class.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What does "this" refer to?',
                 'options': ['The class', 'The current object', 'The parent class', 'The main method'],
                 'correct_answer': 1, 'explanation': '"this" refers to the current instance of the class.'},
            ],
            
            # Level 10: Inheritance
            10: [
                {'question_type': 'fill-blank', 'question_text': 'Inherit from a class:',
                 'code_snippet': 'public class Dog ____ Animal {\n}',
                 'options': ['extends', 'inherits', 'implements', ':'],
                 'correct_answer': 0, 'explanation': 'The extends keyword creates an inheritance relationship.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Call parent constructor:',
                 'code_snippet': 'public Dog(String name) {\n  ____(name);\n}',
                 'options': ['super', 'parent', 'base', 'this'],
                 'correct_answer': 0, 'explanation': 'super() calls the parent class constructor.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'Can a class extend multiple classes in Java?',
                 'options': ['Yes', 'No', 'Only abstract classes', 'Only interfaces'],
                 'correct_answer': 1, 'explanation': 'Java does not support multiple inheritance with classes.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Override a method:',
                 'code_snippet': '____\npublic void speak() {\n  System.out.println("Woof!");\n}',
                 'options': ['@Override', '@override', 'override', '#Override'],
                 'correct_answer': 0, 'explanation': '@Override annotation indicates the method overrides a parent method.'},
                
                {'question_type': 'output', 'question_text': 'What concept is shown?',
                 'code_snippet': 'Animal a = new Dog();\na.speak(); // prints "Woof!"',
                 'options': ['Encapsulation', 'Polymorphism', 'Abstraction', 'Composition'],
                 'correct_answer': 1, 'explanation': 'Polymorphism allows a parent reference to hold child objects.'},
            ],
            
            # Level 11: Interfaces and Abstract Classes
            11: [
                {'question_type': 'fill-blank', 'question_text': 'Define an interface:',
                 'code_snippet': 'public ____ Drawable {\n  void draw();\n}',
                 'options': ['interface', 'abstract', 'class', 'type'],
                 'correct_answer': 0, 'explanation': 'The interface keyword defines a contract for classes to implement.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Implement an interface:',
                 'code_snippet': 'public class Circle ____ Drawable {\n  public void draw() { }\n}',
                 'options': ['implements', 'extends', 'uses', 'inherits'],
                 'correct_answer': 0, 'explanation': 'The implements keyword indicates a class implements an interface.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'Can a class implement multiple interfaces?',
                 'options': ['No', 'Yes', 'Only two', 'Only with abstract classes'],
                 'correct_answer': 1, 'explanation': 'A class can implement multiple interfaces, separated by commas.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Define abstract class:',
                 'code_snippet': 'public ____ class Shape {\n  abstract void draw();\n}',
                 'options': ['abstract', 'interface', 'virtual', 'base'],
                 'correct_answer': 0, 'explanation': 'The abstract keyword creates a class that cannot be instantiated.'},
                
                {'question_type': 'find-error', 'question_text': 'Find the error:',
                 'code_snippet': 'interface Runnable {\n  void run() {\n    System.out.println("Running");\n  }\n}',
                 'highlight_line': 2,
                 'options': ['Interface methods cannot have body (before Java 8)', 'Wrong syntax', 'Missing return type', 'Nothing wrong'],
                 'correct_answer': 0, 'explanation': 'Traditional interface methods are abstract and have no body.'},
            ],
            
            # Level 12: Exception Handling
            12: [
                {'question_type': 'fill-blank', 'question_text': 'Handle exceptions:',
                 'code_snippet': '____ {\n  int result = 10 / 0;\n} catch (ArithmeticException e) {\n  System.out.println("Error!");\n}',
                 'options': ['try', 'attempt', 'do', 'test'],
                 'correct_answer': 0, 'explanation': 'The try block contains code that might throw an exception.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Throw an exception:',
                 'code_snippet': 'if (age < 0) {\n  ____ new IllegalArgumentException("Invalid age");\n}',
                 'options': ['throw', 'throws', 'raise', 'error'],
                 'correct_answer': 0, 'explanation': 'The throw keyword throws an exception.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What is the difference between throw and throws?',
                 'options': ['Same thing', 'throw is used in method body, throws in signature', 'throws is deprecated', 'throw is for checked exceptions only'],
                 'correct_answer': 1, 'explanation': 'throw raises an exception; throws declares possible exceptions in method signature.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Code that always runs:',
                 'code_snippet': 'try {\n  file.read();\n} catch (Exception e) {\n  log(e);\n} ____ {\n  file.close();\n}',
                 'options': ['finally', 'always', 'end', 'cleanup'],
                 'correct_answer': 0, 'explanation': 'The finally block always executes, regardless of exceptions.'},
                
                {'question_type': 'output', 'question_text': 'What is printed?',
                 'code_snippet': 'try {\n  System.out.println("Try");\n  throw new Exception();\n} catch (Exception e) {\n  System.out.println("Catch");\n} finally {\n  System.out.println("Finally");\n}',
                 'options': ['Try', 'Try Catch', 'Try Catch Finally', 'Catch Finally'],
                 'correct_answer': 2, 'explanation': 'Try executes, exception is caught, and finally always runs.'},
            ],
            
            # Level 13: Collections
            13: [
                {'question_type': 'fill-blank', 'question_text': 'Create an ArrayList:',
                 'code_snippet': '____<String> names = new ArrayList<>();',
                 'options': ['ArrayList', 'List', 'Array', 'Collection'],
                 'correct_answer': 0, 'explanation': 'ArrayList is a resizable array implementation.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Add to ArrayList:',
                 'code_snippet': 'ArrayList<String> list = new ArrayList<>();\nlist.____(\"Java\");',
                 'options': ['add', 'push', 'insert', 'append'],
                 'correct_answer': 0, 'explanation': 'The add() method adds an element to the ArrayList.'},
                
                {'question_type': 'output', 'question_text': 'What does this print?',
                 'code_snippet': 'ArrayList<Integer> nums = new ArrayList<>();\nnums.add(1);\nnums.add(2);\nSystem.out.println(nums.size());',
                 'options': ['1', '2', '3', '0'],
                 'correct_answer': 1, 'explanation': 'Two elements were added, so size() returns 2.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Create a HashMap:',
                 'code_snippet': '____<String, Integer> map = new HashMap<>();',
                 'options': ['HashMap', 'Map', 'Dictionary', 'HashTable'],
                 'correct_answer': 0, 'explanation': 'HashMap stores key-value pairs.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Get value from HashMap:',
                 'code_snippet': 'HashMap<String, Integer> ages = new HashMap<>();\nages.put("John", 25);\nint age = ages.____(\"John\");',
                 'options': ['get', 'find', 'fetch', 'retrieve'],
                 'correct_answer': 0, 'explanation': 'The get() method retrieves a value by its key.'},
            ],
            
            # Level 14: Generics and Lambdas
            14: [
                {'question_type': 'fill-blank', 'question_text': 'Generic class:',
                 'code_snippet': 'public class Box<____> {\n  private T item;\n}',
                 'options': ['T', 'Type', 'Generic', 'E'],
                 'correct_answer': 0, 'explanation': 'T is a common type parameter name for generics.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Lambda expression:',
                 'code_snippet': 'List<Integer> nums = Arrays.asList(1, 2, 3);\nnums.forEach(n ____ System.out.println(n));',
                 'options': ['->', '=>', '::', '->:'],
                 'correct_answer': 0, 'explanation': 'The arrow -> separates parameters from lambda body.'},
                
                {'question_type': 'output', 'question_text': 'What does this print?',
                 'code_snippet': 'List<Integer> nums = Arrays.asList(1, 2, 3, 4);\nnums.stream().filter(n -> n > 2).forEach(System.out::println);',
                 'options': ['1 2', '3 4', '1 2 3 4', 'Error'],
                 'correct_answer': 1, 'explanation': 'filter keeps only numbers greater than 2 (3 and 4).'},
                
                {'question_type': 'fill-blank', 'question_text': 'Method reference:',
                 'code_snippet': 'list.forEach(System.out____println);',
                 'options': ['::', '.', '->', '->'],
                 'correct_answer': 0, 'explanation': ':: is the method reference operator.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What is a functional interface?',
                 'options': ['Interface with multiple methods', 'Interface with exactly one abstract method', 'Interface with no methods', 'Deprecated interface'],
                 'correct_answer': 1, 'explanation': 'A functional interface has exactly one abstract method and can be used with lambdas.'},
            ],
            
            # Level 15: Final Boss - Advanced Java
            15: [
                {'question_type': 'fill-blank', 'question_text': 'Create a stream:',
                 'code_snippet': 'List<String> names = Arrays.asList("a", "b", "c");\nnames.____().map(String::toUpperCase).collect(Collectors.toList());',
                 'options': ['stream', 'flow', 'pipe', 'process'],
                 'correct_answer': 0, 'explanation': 'stream() creates a Stream from a collection for functional operations.'},
                
                {'question_type': 'output', 'question_text': 'What does Optional help prevent?',
                 'code_snippet': 'Optional<String> name = Optional.ofNullable(getName());',
                 'options': ['Memory leaks', 'NullPointerException', 'Type errors', 'Compilation errors'],
                 'correct_answer': 1, 'explanation': 'Optional helps handle potentially null values safely.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Create a record (Java 14+):',
                 'code_snippet': 'public ____ Person(String name, int age) {}',
                 'options': ['record', 'data', 'struct', 'class'],
                 'correct_answer': 0, 'explanation': 'record creates an immutable data class with auto-generated methods.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What is the purpose of synchronized?',
                 'options': ['Speed up code', 'Thread safety', 'Type checking', 'Memory management'],
                 'correct_answer': 1, 'explanation': 'synchronized ensures only one thread can access a block of code at a time.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Pattern matching (Java 16+):',
                 'code_snippet': 'if (obj ____ String s) {\n  System.out.println(s.length());\n}',
                 'options': ['instanceof', 'is', 'matches', 'as'],
                 'correct_answer': 0, 'explanation': 'Pattern matching with instanceof automatically casts the variable.'},
            ],
        }
        
        # Seed Java questions
        self.stdout.write('\nSeeding Java questions...')
        for level, questions in java_questions.items():
            for order, q in enumerate(questions, 1):
                Question.objects.create(
                    topic=java_topic,
                    level=level,
                    question_type=q['question_type'],
                    question_text=q['question_text'],
                    code_snippet=q.get('code_snippet', ''),
                    highlight_line=q.get('highlight_line'),
                    options=q['options'],
                    correct_answer=q['correct_answer'],
                    explanation=q['explanation'],
                    order=order
                )
            self.stdout.write(f'  Level {level}: {len(questions)} questions')
        
        # ============================================================
        # C++ QUESTIONS (15 Levels × 5 Questions = 75 Questions)
        # ============================================================
        
        cpp_questions = {
            # Level 1: C++ Basics
            1: [
                {'question_type': 'multiple-choice', 'question_text': 'What is C++?',
                 'options': ['A scripting language', 'An extension of C with OOP features', 'A markup language', 'A database query language'],
                 'correct_answer': 1, 'explanation': 'C++ is an extension of C that adds object-oriented programming features.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Print to console:',
                 'code_snippet': '#include <iostream>\nusing namespace std;\nint main() {\n  ____ << "Hello, World!" << endl;\n  return 0;\n}',
                 'options': ['cout', 'print', 'printf', 'output'],
                 'correct_answer': 0, 'explanation': 'cout is the standard output stream in C++.'},
                
                {'question_type': 'output', 'question_text': 'What does this print?',
                 'code_snippet': '#include <iostream>\nusing namespace std;\nint main() {\n  cout << "C++" << endl;\n  return 0;\n}',
                 'options': ['iostream', 'C++', 'main', 'Nothing'],
                 'correct_answer': 1, 'explanation': 'The program prints "C++" to the console.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Include input/output library:',
                 'code_snippet': '#include <____>',
                 'options': ['iostream', 'stdio', 'io', 'stream'],
                 'correct_answer': 0, 'explanation': 'iostream provides input/output stream functionality.'},
                
                {'question_type': 'find-error', 'question_text': 'Find the error:',
                 'code_snippet': '#include <iostream>\nusing namespace std;\nint main() {\n  cout << "Hello"\n  return 0;\n}',
                 'highlight_line': 4,
                 'options': ['Missing semicolon', 'Wrong include', 'Missing endl', 'Nothing wrong'],
                 'correct_answer': 0, 'explanation': 'C++ statements must end with a semicolon.'},
            ],
            
            # Level 2: Variables and Data Types
            2: [
                {'question_type': 'fill-blank', 'question_text': 'Declare an integer:',
                 'code_snippet': '____ age = 25;',
                 'options': ['int', 'integer', 'Integer', 'num'],
                 'correct_answer': 0, 'explanation': 'int is the integer data type in C++.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Declare a decimal number:',
                 'code_snippet': '____ price = 19.99;',
                 'options': ['double', 'float', 'decimal', 'real'],
                 'correct_answer': 0, 'explanation': 'double is commonly used for decimal numbers in C++.'},
                
                {'question_type': 'output', 'question_text': 'What is the value of x?',
                 'code_snippet': 'int x = 10;\nx += 5;',
                 'options': ['10', '15', '5', '50'],
                 'correct_answer': 1, 'explanation': 'x += 5 is equivalent to x = x + 5, so x becomes 15.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What is the size of int typically?',
                 'options': ['1 byte', '2 bytes', '4 bytes', '8 bytes'],
                 'correct_answer': 2, 'explanation': 'On most modern systems, int is 4 bytes (32 bits).'},
                
                {'question_type': 'fill-blank', 'question_text': 'Declare a constant:',
                 'code_snippet': '____ double PI = 3.14159;',
                 'options': ['const', 'constant', 'final', 'static'],
                 'correct_answer': 0, 'explanation': 'const declares a constant that cannot be modified.'},
            ],
            
            # Level 3: Operators and Expressions
            3: [
                {'question_type': 'output', 'question_text': 'What is the result?',
                 'code_snippet': 'int a = 10;\nint b = 3;\ncout << a / b;',
                 'options': ['3.33', '3', '4', '10'],
                 'correct_answer': 1, 'explanation': 'Integer division truncates the decimal. 10/3 = 3.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Get the remainder:',
                 'code_snippet': 'int remainder = 17 ____ 5;',
                 'options': ['%', '/', 'mod', '\\\\'],
                 'correct_answer': 0, 'explanation': 'The modulo operator % returns the remainder.'},
                
                {'question_type': 'output', 'question_text': 'What does this print?',
                 'code_snippet': 'int x = 5;\ncout << x++;',
                 'options': ['5', '6', '4', 'Error'],
                 'correct_answer': 0, 'explanation': 'Post-increment x++ returns the original value (5), then increments.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What does == do?',
                 'options': ['Assignment', 'Equality comparison', 'Declaration', 'Increment'],
                 'correct_answer': 1, 'explanation': '== compares two values for equality.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Logical AND operator:',
                 'code_snippet': 'if (x > 0 ____ x < 10) {\n  cout << "Valid";\n}',
                 'options': ['&&', 'and', '&', '||'],
                 'correct_answer': 0, 'explanation': '&& is the logical AND operator.'},
            ],
            
            # Level 4: Strings
            4: [
                {'question_type': 'fill-blank', 'question_text': 'Include string library:',
                 'code_snippet': '#include <____>',
                 'options': ['string', 'String', 'strings', 'cstring'],
                 'correct_answer': 0, 'explanation': 'The string header provides the string class.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Get string length:',
                 'code_snippet': 'string name = "C++";\nint len = name.____();',
                 'options': ['length', 'size', 'count', 'len'],
                 'correct_answer': 0, 'explanation': 'length() returns the number of characters. size() also works.'},
                
                {'question_type': 'output', 'question_text': 'What does this print?',
                 'code_snippet': 'string s = "Hello";\ncout << s[1];',
                 'options': ['H', 'e', 'l', 'Error'],
                 'correct_answer': 1, 'explanation': 's[1] accesses the character at index 1, which is "e".'},
                
                {'question_type': 'fill-blank', 'question_text': 'Concatenate strings:',
                 'code_snippet': 'string a = "Hello";\nstring b = " World";\nstring c = a ____ b;',
                 'options': ['+', '.', '&', ','],
                 'correct_answer': 0, 'explanation': 'The + operator concatenates strings in C++.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Get substring:',
                 'code_snippet': 'string s = "Hello World";\nstring sub = s.____(0, 5);',
                 'options': ['substr', 'substring', 'slice', 'cut'],
                 'correct_answer': 0, 'explanation': 'substr(pos, len) extracts a substring.'},
            ],
            
            # Level 5: Arrays and Vectors
            5: [
                {'question_type': 'fill-blank', 'question_text': 'Declare an array:',
                 'code_snippet': 'int numbers____5] = {1, 2, 3, 4, 5};',
                 'options': ['[', '(', '{', '<'],
                 'correct_answer': 0, 'explanation': 'Square brackets declare array size in C++.'},
                
                {'question_type': 'output', 'question_text': 'What does this print?',
                 'code_snippet': 'int arr[3] = {10, 20, 30};\ncout << arr[2];',
                 'options': ['10', '20', '30', 'Error'],
                 'correct_answer': 2, 'explanation': 'arr[2] is the third element (index 2), which is 30.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Include vector library:',
                 'code_snippet': '#include <____>',
                 'options': ['vector', 'Vector', 'array', 'list'],
                 'correct_answer': 0, 'explanation': 'The vector header provides the dynamic array class.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Add to vector:',
                 'code_snippet': 'vector<int> nums;\nnums.____(10);',
                 'options': ['push_back', 'add', 'append', 'insert'],
                 'correct_answer': 0, 'explanation': 'push_back() adds an element to the end of the vector.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Get vector size:',
                 'code_snippet': 'vector<int> nums = {1, 2, 3};\nint s = nums.____();',
                 'options': ['size', 'length', 'count', 'len'],
                 'correct_answer': 0, 'explanation': 'size() returns the number of elements in the vector.'},
            ],
            
            # Level 6: Control Flow
            6: [
                {'question_type': 'fill-blank', 'question_text': 'If statement:',
                 'code_snippet': '____ (score >= 60) {\n  cout << "Pass";\n}',
                 'options': ['if', 'when', 'check', 'test'],
                 'correct_answer': 0, 'explanation': 'The if keyword starts a conditional statement.'},
                
                {'question_type': 'output', 'question_text': 'What does this print?',
                 'code_snippet': 'int x = 7;\nif (x > 5) {\n  cout << "Big";\n} else {\n  cout << "Small";\n}',
                 'options': ['Big', 'Small', 'Error', 'Nothing'],
                 'correct_answer': 0, 'explanation': '7 > 5 is true, so "Big" is printed.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Switch statement:',
                 'code_snippet': 'switch (choice) {\n  ____ 1:\n    cout << "One";\n    break;\n}',
                 'options': ['case', 'when', 'option', 'value'],
                 'correct_answer': 0, 'explanation': 'case defines a branch in a switch statement.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What does break do in switch?',
                 'options': ['Continues to next case', 'Exits the switch', 'Causes error', 'Restarts switch'],
                 'correct_answer': 1, 'explanation': 'break exits the switch statement.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Ternary operator:',
                 'code_snippet': 'string result = (age >= 18) ____ "Adult" : "Minor";',
                 'options': ['?', ':', '&&', '||'],
                 'correct_answer': 0, 'explanation': 'The ternary operator: condition ? trueValue : falseValue.'},
            ],
            
            # Level 7: Loops
            7: [
                {'question_type': 'fill-blank', 'question_text': 'For loop:',
                 'code_snippet': '____ (int i = 0; i < 5; i++) {\n  cout << i;\n}',
                 'options': ['for', 'loop', 'while', 'repeat'],
                 'correct_answer': 0, 'explanation': 'for creates a loop with initialization, condition, and increment.'},
                
                {'question_type': 'output', 'question_text': 'What numbers are printed?',
                 'code_snippet': 'for (int i = 1; i <= 3; i++) {\n  cout << i << " ";\n}',
                 'options': ['0 1 2', '1 2 3', '1 2 3 4', '0 1 2 3'],
                 'correct_answer': 1, 'explanation': 'Loop runs for i = 1, 2, 3, printing "1 2 3".'},
                
                {'question_type': 'fill-blank', 'question_text': 'While loop:',
                 'code_snippet': 'int count = 0;\n____ (count < 5) {\n  count++;\n}',
                 'options': ['while', 'for', 'loop', 'until'],
                 'correct_answer': 0, 'explanation': 'while loops while the condition is true.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Range-based for loop:',
                 'code_snippet': 'vector<int> nums = {1, 2, 3};\nfor (int n ____ nums) {\n  cout << n;\n}',
                 'options': [':', 'in', 'of', '->'],
                 'correct_answer': 0, 'explanation': 'The colon : is used in range-based for loops.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What does continue do?',
                 'options': ['Exits loop', 'Skips to next iteration', 'Pauses loop', 'Restarts loop'],
                 'correct_answer': 1, 'explanation': 'continue skips the rest of the current iteration.'},
            ],
            
            # Level 8: Functions
            8: [
                {'question_type': 'fill-blank', 'question_text': 'Function that returns int:',
                 'code_snippet': '____ add(int a, int b) {\n  return a + b;\n}',
                 'options': ['int', 'void', 'function', 'def'],
                 'correct_answer': 0, 'explanation': 'The return type comes before the function name.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Function with no return:',
                 'code_snippet': '____ printMessage(string msg) {\n  cout << msg;\n}',
                 'options': ['void', 'null', 'none', 'empty'],
                 'correct_answer': 0, 'explanation': 'void indicates the function returns nothing.'},
                
                {'question_type': 'output', 'question_text': 'What is returned?',
                 'code_snippet': 'int square(int n) {\n  return n * n;\n}\ncout << square(5);',
                 'options': ['5', '10', '25', 'Error'],
                 'correct_answer': 2, 'explanation': 'square(5) returns 5 * 5 = 25.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Pass by reference:',
                 'code_snippet': 'void increment(int ____ x) {\n  x++;\n}',
                 'options': ['&', '*', '**', '@'],
                 'correct_answer': 0, 'explanation': '& creates a reference parameter that modifies the original.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What is function overloading?',
                 'options': ['Same name, different parameters', 'Functions that are too long', 'Recursive functions', 'Inline functions'],
                 'correct_answer': 0, 'explanation': 'Overloading allows multiple functions with same name but different parameters.'},
            ],
            
            # Level 9: Pointers
            9: [
                {'question_type': 'fill-blank', 'question_text': 'Declare a pointer:',
                 'code_snippet': 'int x = 10;\nint____ ptr = &x;',
                 'options': ['*', '&', '@', '^'],
                 'correct_answer': 0, 'explanation': '* declares a pointer variable.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Get address of variable:',
                 'code_snippet': 'int x = 10;\nint* ptr = ____x;',
                 'options': ['&', '*', '@', '#'],
                 'correct_answer': 0, 'explanation': '& returns the memory address of a variable.'},
                
                {'question_type': 'output', 'question_text': 'What does this print?',
                 'code_snippet': 'int x = 10;\nint* ptr = &x;\ncout << *ptr;',
                 'options': ['Memory address', '10', 'ptr', 'Error'],
                 'correct_answer': 1, 'explanation': '*ptr dereferences the pointer to get the value (10).'},
                
                {'question_type': 'fill-blank', 'question_text': 'Null pointer:',
                 'code_snippet': 'int* ptr = ____;',
                 'options': ['nullptr', 'NULL', 'null', '0'],
                 'correct_answer': 0, 'explanation': 'nullptr is the modern C++ null pointer constant.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What is * called when used with a pointer?',
                 'options': ['Address operator', 'Dereference operator', 'Multiplication', 'Pointer symbol'],
                 'correct_answer': 1, 'explanation': '* dereferences a pointer to access the pointed value.'},
            ],
            
            # Level 10: Classes and Objects
            10: [
                {'question_type': 'fill-blank', 'question_text': 'Define a class:',
                 'code_snippet': '____ Person {\npublic:\n  string name;\n  int age;\n};',
                 'options': ['class', 'struct', 'object', 'type'],
                 'correct_answer': 0, 'explanation': 'class defines a new class type in C++.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Public access specifier:',
                 'code_snippet': 'class Car {\n____:\n  string model;\n};',
                 'options': ['public', 'private', 'protected', 'open'],
                 'correct_answer': 0, 'explanation': 'public makes members accessible from outside the class.'},
                
                {'question_type': 'output', 'question_text': 'What is printed?',
                 'code_snippet': 'class Dog {\npublic:\n  string name = "Buddy";\n};\nDog d;\ncout << d.name;',
                 'options': ['Dog', 'Buddy', 'name', 'Error'],
                 'correct_answer': 1, 'explanation': 'The Dog object d has name set to "Buddy".'},
                
                {'question_type': 'fill-blank', 'question_text': 'Constructor:',
                 'code_snippet': 'class Car {\npublic:\n  string model;\n  ____(string m) : model(m) {}\n};',
                 'options': ['Car', 'constructor', 'init', 'new'],
                 'correct_answer': 0, 'explanation': 'Constructor has the same name as the class.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What is the default access in a class?',
                 'options': ['public', 'private', 'protected', 'none'],
                 'correct_answer': 1, 'explanation': 'Class members are private by default in C++.'},
            ],
            
            # Level 11: Inheritance
            11: [
                {'question_type': 'fill-blank', 'question_text': 'Inherit from a class:',
                 'code_snippet': 'class Dog ____ public Animal {\n};',
                 'options': [':', 'extends', 'inherits', '->'],
                 'correct_answer': 0, 'explanation': 'The colon : indicates inheritance in C++.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Call base class constructor:',
                 'code_snippet': 'class Dog : public Animal {\npublic:\n  Dog(string n) : ____(n) {}\n};',
                 'options': ['Animal', 'base', 'super', 'parent'],
                 'correct_answer': 0, 'explanation': 'Use the base class name to call its constructor.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'Does C++ support multiple inheritance?',
                 'options': ['No', 'Yes', 'Only with interfaces', 'Only for structs'],
                 'correct_answer': 1, 'explanation': 'C++ supports multiple inheritance (a class can have multiple base classes).'},
                
                {'question_type': 'fill-blank', 'question_text': 'Virtual function for polymorphism:',
                 'code_snippet': 'class Animal {\npublic:\n  ____ void speak() { cout << "Sound"; }\n};',
                 'options': ['virtual', 'override', 'abstract', 'poly'],
                 'correct_answer': 0, 'explanation': 'virtual enables runtime polymorphism for derived classes.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Override in derived class:',
                 'code_snippet': 'class Dog : public Animal {\npublic:\n  void speak() ____ { cout << "Woof"; }\n};',
                 'options': ['override', 'virtual', 'new', 'super'],
                 'correct_answer': 0, 'explanation': 'override keyword ensures we are overriding a virtual function.'},
            ],
            
            # Level 12: Memory Management
            12: [
                {'question_type': 'fill-blank', 'question_text': 'Allocate memory dynamically:',
                 'code_snippet': 'int* ptr = ____ int;',
                 'options': ['new', 'malloc', 'alloc', 'create'],
                 'correct_answer': 0, 'explanation': 'new allocates memory on the heap.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Free allocated memory:',
                 'code_snippet': 'int* ptr = new int;\n____ ptr;',
                 'options': ['delete', 'free', 'remove', 'destroy'],
                 'correct_answer': 0, 'explanation': 'delete frees memory allocated with new.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Allocate array dynamically:',
                 'code_snippet': 'int* arr = new int____10];',
                 'options': ['[', '(', '{', '<'],
                 'correct_answer': 0, 'explanation': 'new int[10] allocates an array of 10 integers.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Delete dynamic array:',
                 'code_snippet': 'int* arr = new int[10];\n____[] arr;',
                 'options': ['delete', 'free', 'remove', 'destroy'],
                 'correct_answer': 0, 'explanation': 'delete[] frees arrays allocated with new[].'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What is a memory leak?',
                 'options': ['Memory overflow', 'Allocated memory not freed', 'Stack corruption', 'Pointer error'],
                 'correct_answer': 1, 'explanation': 'Memory leak occurs when allocated memory is never freed.'},
            ],
            
            # Level 13: Smart Pointers
            13: [
                {'question_type': 'fill-blank', 'question_text': 'Include smart pointer header:',
                 'code_snippet': '#include <____>',
                 'options': ['memory', 'smartptr', 'pointer', 'smart'],
                 'correct_answer': 0, 'explanation': 'The memory header provides smart pointers.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Create unique pointer:',
                 'code_snippet': '____<int> ptr = make_unique<int>(42);',
                 'options': ['unique_ptr', 'UniquePtr', 'unique', 'ptr'],
                 'correct_answer': 0, 'explanation': 'unique_ptr is a smart pointer with sole ownership.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Create shared pointer:',
                 'code_snippet': '____<int> ptr = make_shared<int>(42);',
                 'options': ['shared_ptr', 'SharedPtr', 'shared', 'sharedptr'],
                 'correct_answer': 0, 'explanation': 'shared_ptr allows multiple pointers to share ownership.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What does unique_ptr do when it goes out of scope?',
                 'options': ['Nothing', 'Automatically deletes the object', 'Throws an error', 'Creates a copy'],
                 'correct_answer': 1, 'explanation': 'unique_ptr automatically deletes its object when destroyed.'},
                
                {'question_type': 'output', 'question_text': 'What is the benefit of smart pointers?',
                 'code_snippet': 'auto ptr = make_unique<int>(10);',
                 'options': ['Faster execution', 'Automatic memory management', 'More memory', 'Better syntax'],
                 'correct_answer': 1, 'explanation': 'Smart pointers automatically manage memory, preventing leaks.'},
            ],
            
            # Level 14: Templates
            14: [
                {'question_type': 'fill-blank', 'question_text': 'Define a template function:',
                 'code_snippet': '____<typename T>\nT maximum(T a, T b) {\n  return (a > b) ? a : b;\n}',
                 'options': ['template', 'generic', 'type', 'def'],
                 'correct_answer': 0, 'explanation': 'template keyword defines a generic function or class.'},
                
                {'question_type': 'output', 'question_text': 'What does this return?',
                 'code_snippet': 'template<typename T>\nT add(T a, T b) { return a + b; }\ncout << add(3, 5);',
                 'options': ['35', '8', 'Error', 'T'],
                 'correct_answer': 1, 'explanation': 'add(3, 5) uses int type and returns 3 + 5 = 8.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Template class:',
                 'code_snippet': 'template<typename ____>\nclass Box {\n  T value;\n};',
                 'options': ['T', 'Type', 'Generic', 'E'],
                 'correct_answer': 0, 'explanation': 'T is a common name for the type parameter.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Use template class:',
                 'code_snippet': 'Box____int> intBox;',
                 'options': ['<', '(', '[', '{'],
                 'correct_answer': 0, 'explanation': 'Angle brackets specify the template argument.'},
                
                {'question_type': 'multiple-choice', 'question_text': 'What are templates used for?',
                 'options': ['Creating HTML', 'Generic programming', 'Memory management', 'File I/O'],
                 'correct_answer': 1, 'explanation': 'Templates enable generic programming with type-independent code.'},
            ],
            
            # Level 15: Final Boss - Modern C++
            15: [
                {'question_type': 'fill-blank', 'question_text': 'Auto type deduction:',
                 'code_snippet': '____ x = 10;  // x is int',
                 'options': ['auto', 'var', 'let', 'any'],
                 'correct_answer': 0, 'explanation': 'auto automatically deduces the type from the initializer.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Lambda expression:',
                 'code_snippet': 'auto add = [](int a, int b) ____ { return a + b; };',
                 'options': ['->', '=>', '::', '->'],
                 'correct_answer': 0, 'explanation': '-> specifies the return type in a lambda (optional with single return).'},
                
                {'question_type': 'output', 'question_text': 'What does this lambda return?',
                 'code_snippet': 'auto square = [](int x) { return x * x; };\ncout << square(4);',
                 'options': ['4', '8', '16', 'Error'],
                 'correct_answer': 2, 'explanation': 'The lambda squares 4, returning 16.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Move semantics:',
                 'code_snippet': 'string s1 = "Hello";\nstring s2 = ____(s1);  // s1 is now empty',
                 'options': ['move', 'copy', 'transfer', 'swap'],
                 'correct_answer': 0, 'explanation': 'std::move enables move semantics, transferring ownership.'},
                
                {'question_type': 'fill-blank', 'question_text': 'Structured binding (C++17):',
                 'code_snippet': 'pair<int, string> p = {1, "one"};\nauto [num, ____] = p;',
                 'options': ['str', 'text', 'name', 'value'],
                 'correct_answer': 0, 'explanation': 'Structured bindings unpack tuple-like objects into variables.'},
            ],
        }
        
        # Seed C++ questions
        self.stdout.write('\nSeeding C++ questions...')
        for level, questions in cpp_questions.items():
            for order, q in enumerate(questions, 1):
                Question.objects.create(
                    topic=cpp_topic,
                    level=level,
                    question_type=q['question_type'],
                    question_text=q['question_text'],
                    code_snippet=q.get('code_snippet', ''),
                    highlight_line=q.get('highlight_line'),
                    options=q['options'],
                    correct_answer=q['correct_answer'],
                    explanation=q['explanation'],
                    order=order
                )
            self.stdout.write(f'  Level {level}: {len(questions)} questions')
        
        # Summary
        total_html = sum(len(q) for q in html_questions.values())
        total_python = sum(len(q) for q in python_questions.values())
        total_js = sum(len(q) for q in js_questions.values())
        total_sql = sum(len(q) for q in sql_questions.values())
        total_bash = sum(len(q) for q in bash_questions.values())
        total_css = sum(len(q) for q in css_questions.values())
        total_react = sum(len(q) for q in react_questions.values())
        total_java = sum(len(q) for q in java_questions.values())
        total_cpp = sum(len(q) for q in cpp_questions.values())
        
        self.stdout.write(self.style.SUCCESS(f'\n✓ Successfully seeded {total_html} HTML questions (15 levels)'))
        self.stdout.write(self.style.SUCCESS(f'✓ Successfully seeded {total_js} JavaScript questions (15 levels)'))
        self.stdout.write(self.style.SUCCESS(f'✓ Successfully seeded {total_css} CSS questions (15 levels)'))
        self.stdout.write(self.style.SUCCESS(f'✓ Successfully seeded {total_react} React questions (15 levels)'))
        self.stdout.write(self.style.SUCCESS(f'✓ Successfully seeded {total_python} Python questions (15 levels)'))
        self.stdout.write(self.style.SUCCESS(f'✓ Successfully seeded {total_java} Java questions (15 levels)'))
        self.stdout.write(self.style.SUCCESS(f'✓ Successfully seeded {total_cpp} C++ questions (15 levels)'))
        self.stdout.write(self.style.SUCCESS(f'✓ Successfully seeded {total_sql} SQL questions (15 levels)'))
        self.stdout.write(self.style.SUCCESS(f'✓ Successfully seeded {total_bash} Bash questions (15 levels)'))
        self.stdout.write(self.style.SUCCESS(f'\nTotal: {total_html + total_python + total_js + total_sql + total_bash + total_css + total_react + total_java + total_cpp} questions'))
