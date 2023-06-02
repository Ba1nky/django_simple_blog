from django.urls import path
from .views import BlogView, PostAjaxView


urlpatterns = [
    path('', BlogView.as_view(), name='post_list'),
    path('ajax/', PostAjaxView.as_view(), name='post_ajax'),
    path('ajax/<int:post_id>', PostAjaxView.as_view(), name='post_ajax'),
]