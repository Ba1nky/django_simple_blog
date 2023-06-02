from django.views.generic import ListView
from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse, HttpResponseForbidden, HttpResponseBadRequest
from django.shortcuts import get_object_or_404
from .models import Post
from .forms import PostForm
import json


class BlogView(LoginRequiredMixin, ListView):
    model = Post
    template_name = 'blog.html'
    context_object_name = 'posts'
    form = PostForm()

    def get_queryset(self):
        posts = super().get_queryset()
        return posts.filter(author=self.request.user)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['form'] = PostForm()
        return context


class PostAjaxView(LoginRequiredMixin, View):
    @staticmethod
    def check_ajax(request):
        if not request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return HttpResponseBadRequest()

    @staticmethod
    def check_author(request, post):
        if post.author != request.user:
            return HttpResponseForbidden()

    @staticmethod
    def create_response(data=None, message=None, message_detail=None, status=200):
        response_data = {
            'data': data,
            'message': message,
            'messageDetail': message_detail,
        }
        return JsonResponse(response_data, status=status)

    @staticmethod
    def serialize_post(post):
        return {
            'id': post.id,
            'author': post.author.username,
            'title': post.title,
            'content': post.content,
        }

    def post(self, request):
        self.check_ajax(request)

        form = PostForm(request.POST)

        if form.is_valid():
            post = form.save(commit=False)
            post.author = request.user
            post.save()
            serialized_post = self.serialize_post(post)
            return self.create_response(data={'post': serialized_post})

        errors = form.errors.get_json_data(escape_html=True)
        return self.create_response(message="Invalid form", message_detail=errors, status=400)

    def put(self, request, post_id):
        self.check_ajax(request)

        post = get_object_or_404(Post, id=post_id)
        self.check_author(request, post)

        form = PostForm(json.loads(request.body.decode('utf-8')))

        if form.is_valid():
            post.title = form.data['title']
            post.content = form.data['content']
            post.save()
            serialized_post = self.serialize_post(post)
            return self.create_response(data={'post': serialized_post})

        errors = form.errors.get_json_data(escape_html=True)
        return self.create_response(message="Invalid form", message_detail=errors, status=400)

    def delete(self, request, post_id):
        self.check_ajax(request)

        post = get_object_or_404(Post, id=post_id)
        self.check_author(request, post)

        post.delete()
        return self.create_response(status=204)
