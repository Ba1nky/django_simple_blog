from django.contrib.auth import views as auth_views
from django.urls import path
from .views import UserRegistrationView


urlpatterns = [
    path('login/', auth_views.LoginView.as_view(template_name='login.html'), name='login'),
    path('registration/', UserRegistrationView.as_view(), name='registration'),
    path('logout/', auth_views.LogoutView.as_view(template_name='logged_out.html'), name='logout'),
]