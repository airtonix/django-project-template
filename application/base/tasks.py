import celery
from post_office import mail


@celery.task
def send_queued_emails():
    mail.send_queued()


@celery.task
def async_send_mail(*args, **kwargs):
    kwargs['priority'] = 'now'
    return mail.send(*args, **kwargs)

