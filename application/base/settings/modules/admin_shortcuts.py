_ = lambda x: x

ADMIN_SHORTCUTS = [
    {
        'shortcuts': [
            {
                'url': '/',
                'open_new_window': True,
            },
        ]
    },

    {
        'title': 'Content',
        'shortcuts': [
            {
                'url_name': 'admin:base_extendedflatpage_changelist',
                'title': _('Pages'),
                'count': 'base.counters.total_pages',
            },
        ]
    },

]

ADMIN_SHORTCUTS_SETTINGS = {
    'hide_app_list': False,
    'open_new_window': False,
}
