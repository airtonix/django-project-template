from django.conf import settings
from django.views.generic import FormView, TemplateView
from django.core.urlresolvers import reverse_lazy
from django.contrib.sites.models import get_current_site
from post_office import mail

from .. import forms


class async_send_mail:
    def delay(self, *args, **kwargs):
        pass

try:
    from ..tasks import async_send_mail
except:
    pass


class ContactFormView(FormView):
    template_name = "contact/form.html"
    email_template_name = "contact/email.body.txt"
    success_url = reverse_lazy('contact:thanks')
    form_class = forms.ContactForm

    def form_valid(self, form, **kwargs):
        """
        Post a contact message.
        """
        context = form.get_instance_data()
        context.update({"site": get_current_site(self.request)})

        notify_to = [email for _, email in settings.ADMINS]
        from_email = context.get('email')

        async_send_mail.delay(
            notify_to, from_email,
            template='contact_message',
            context=context,
            headers={'Reply-to': from_email},
        )

        return super(ContactFormView, self).form_valid(form, **kwargs)


class MessageSentView(TemplateView):
    template_name = "contact/thanks.html"
