"""
Management command to update certificate titles and descriptions with proper defaults.
"""

from django.core.management.base import BaseCommand
from game.models import Certificate


class Command(BaseCommand):
    help = 'Update certificate titles and descriptions with proper defaults'

    def handle(self, *args, **options):
        certificates = Certificate.objects.select_related('topic').all()

        # Default descriptions for different topic types
        descriptions = {
            'javascript': 'For mastering JavaScript fundamentals, DOM manipulation, asynchronous programming, and modern ES6+ features through hands-on coding challenges.',
            'python': 'For mastering Python programming, including data structures, object-oriented programming, file handling, and practical applications.',
            'html': 'For mastering HTML5 semantic markup, accessibility standards, and modern web development practices.',
            'css': 'For mastering CSS3 styling, responsive design, animations, and modern layout techniques including Flexbox and Grid.',
            'react': 'For mastering React.js, including components, state management, hooks, and building interactive user interfaces.',
            'sql': 'For mastering SQL database design, complex queries, data manipulation, and database administration principles.',
            'bash': 'For mastering Bash scripting, command-line tools, automation, and Linux system administration.',
            'java': 'For mastering Java programming, object-oriented design, data structures, and enterprise application development.',
            'cpp': 'For mastering C++ programming, memory management, performance optimization, and system-level development.',
        }

        updated_count = 0
        for cert in certificates:
            topic_name = cert.topic.name.lower()

            # Set title if empty
            if not cert.title:
                cert.title = f"{cert.topic.name} Mastery"
                self.stdout.write(f"  Set title for {cert.topic.name}: {cert.title}")

            # Set description if empty
            if not cert.description:
                # Try to match by topic name or slug
                description = None
                for key, desc in descriptions.items():
                    if key in topic_name or key in cert.topic.slug:
                        description = desc
                        break

                # Fallback description
                if not description:
                    description = f"For successfully completing the {cert.topic.name} course at CodeLogic Academy, demonstrating proficiency in {cert.topic.category.name.lower()} development."

                cert.description = description
                self.stdout.write(f"  Set description for {cert.topic.name}")

            cert.save()
            updated_count += 1

        self.stdout.write(
            self.style.SUCCESS(f'\n✓ Updated {updated_count} certificates with proper titles and descriptions!')
        )