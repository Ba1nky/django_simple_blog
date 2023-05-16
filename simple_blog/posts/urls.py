from django.urls import path
from .views import PostListView, PostCreate, PostUpdateView, PostDeleteView


urlpatterns = [
    path('', PostListView.as_view(), name='post_list'),
    path('create/',  PostCreate.as_view(), name='post_create'),
    path('edit/<int:pk>', PostUpdateView.as_view(), name='post_edit'),
    path('delete/<int:pk>', PostDeleteView.as_view(), name='post_delete'),
]