"""
Custom password validators registered in AUTH_PASSWORD_VALIDATORS.

The rules here mirror the realtime checklist on the signup page
(see frontend/src/app/register/page.tsx -> passwordRequirements). Any
change here MUST be mirrored there so the user's UI feedback matches
what the backend enforces.
"""

import re

from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


class StrongPasswordValidator:
    """
    Enforce: at least one lowercase, one uppercase, one digit, one
    special character (from the set shown in the UI) and at least 12
    characters total. Raises a single ValidationError listing every
    rule the candidate password fails.
    """

    SPECIAL_CHARS = r"@$!%*#?&_^()\-"
    SPECIAL_RE = re.compile(r"[" + SPECIAL_CHARS + r"]")
    MIN_LENGTH = 12

    def validate(self, password, user=None):
        errors = []
        if len(password) < self.MIN_LENGTH:
            errors.append(_("at least %d characters") % self.MIN_LENGTH)
        if not re.search(r"[a-z]", password):
            errors.append(_("at least one lowercase letter"))
        if not re.search(r"[A-Z]", password):
            errors.append(_("at least one uppercase letter"))
        if not re.search(r"\d", password):
            errors.append(_("at least one number"))
        if not self.SPECIAL_RE.search(password):
            errors.append(
                _("at least one special character (e.g. @ $ ! % * # ? & _ ^ ( ) -)")
            )

        if errors:
            raise ValidationError(
                _("Password must contain: %(reqs)s.") % {"reqs": ", ".join(str(e) for e in errors)},
                code="password_too_weak",
            )

    def get_help_text(self):
        return _(
            "Your password must be at least %(n)d characters long and contain "
            "at least one lowercase letter, one uppercase letter, one number, "
            "and one special character (e.g. @ $ ! %% * # ? & _ ^ ( ) -)."
        ) % {"n": self.MIN_LENGTH}
