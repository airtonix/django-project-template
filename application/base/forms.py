# Code chunks borrowed from Django Comments Framework.
# Rather than using three tier inheritance, Contactme uses two, one for
# security fields and the form data on. No check for duplicates.

import time
import datetime

from django import forms
from django.forms.util import ErrorDict
from django.utils.crypto import salted_hmac, constant_time_compare
from django.utils.translation import ugettext_lazy as _


class ContactMsgSecurityForm(forms.Form):

    """
    Handles the security aspects (anti-spoofing) for contact forms.
    """
    timestamp = forms.IntegerField(widget=forms.HiddenInput)
    security_hash = forms.CharField(min_length=40, max_length=40, widget=forms.HiddenInput)
    honeypot = forms.CharField(required=False, help_text=_("keep it empty"))

    def __init__(self, data=None, initial=None, **kwargs):
        if initial is None:
            initial = {}
        initial.update(self.generate_security_data())
        super(ContactMsgSecurityForm, self).__init__(
            data=data, initial=initial)

    def security_errors(self):
        """Return just those errors associated with security"""
        errors = ErrorDict()
        for f in ["honeypot", "timestamp", "security_hash"]:
            if f in self.errors:
                errors[f] = self.errors[f]
        return errors

    def clean_timestamp(self):
        """Make sure the timestamp isn't too far (> 2 hours) in the past."""
        ts = self.cleaned_data["timestamp"]
        if time.time() - ts > (2 * 60 * 60):
            raise forms.ValidationError("Timestamp check failed")
        return ts

    def clean_security_hash(self):
        """Check the security hash."""
        timestamp = self.data.get("timestamp", "")
        expected_hash = self.generate_security_hash(timestamp)
        actual_hash = self.cleaned_data["security_hash"]
        if not constant_time_compare(expected_hash, actual_hash):
            raise forms.ValidationError("Security hash check failed.")
        return actual_hash

    def clean_honeypot(self):
        """Check that nothing's been entered into the honeypot."""
        value = self.cleaned_data["honeypot"]
        if value:
            raise forms.ValidationError(self.fields["honeypot"].label)
        return value

    def generate_security_data(self):
        """Generate a dict of security data for "initial" data."""
        timestamp = int(time.time())
        security_dict = {
            'timestamp': str(timestamp),
            'security_hash': self.generate_security_hash(timestamp),
        }
        return security_dict

    def generate_security_hash(self, timestamp):
        """Generate a HMAC security hash from the timestamp."""
        key_salt = "Es war einmal una princesa que vivia in a beautiful castle"
        return salted_hmac(key_salt, str(timestamp)).hexdigest()


class ContactForm(ContactMsgSecurityForm):

    name = forms.CharField(label=_("Name"), max_length=100,
                           widget=forms.TextInput(attrs={"maxlength": 100}))
    email = forms.EmailField(label=_("Email address"), max_length=200,
                             widget=forms.TextInput(attrs={"maxlength": 200}),
                             help_text=_("Required for verification"))
    message = forms.CharField(label=_('Message'),
                              widget=forms.Textarea())

    def get_instance_data(self):
        """
        Returns the dict of data to be used to create a contact message.
        """
        return dict(
            name=self.cleaned_data["name"],
            email=self.cleaned_data["email"],
            message=self.cleaned_data["message"],
            submit_date=datetime.datetime.now(),
        )
