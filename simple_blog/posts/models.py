from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinLengthValidator


class Post(models.Model):
    title = models.CharField(validators=[MinLengthValidator(3)], max_length=100)
    content = models.TextField(validators=[MinLengthValidator(30)])
    author = models.ForeignKey(User, related_name='blog_posts', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
