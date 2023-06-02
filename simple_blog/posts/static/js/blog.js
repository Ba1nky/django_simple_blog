const posts = document.querySelectorAll('.post');
let currentEditingPost = null;
cachedTitle = null
cachedContent = null

posts.forEach(post => {
  initializePost(post)
})

if (posts.length === 0){
      let blog__message = document.querySelector('.blog__message');
      blog__message.style.display = 'block';
}

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          if (cookie.substring(0, name.length + 1) === (name + '=')) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
              break;
          }
      }
  }
  return cookieValue;
}

function clearErrors(form){
  let errorList = form.querySelector('.form__errors');
  errorList.innerHTML = '';
}

function showErrors(form, errorsData){
  let errorList = form.querySelector('.form__errors');

  for (var field in errorsData) {
      if (errorsData.hasOwnProperty(field)) {
          var fieldErrors = errorsData[field];
          for (var i = 0; i < fieldErrors.length; i++) {
              var error = document.createElement('li');
              error.textContent = fieldErrors[i].message;
              errorList.appendChild(error);
          }
      }
  }
}

function enterEditMode(post){
  currentEditingPost = post;

  let titleElement = currentEditingPost.querySelector('.post__title');
  let contentElement = currentEditingPost.querySelector('.post__body');

  let postButtons = currentEditingPost.querySelector('.post__buttons:not(.post-edit-mode)');
  let postEditModeButtons = currentEditingPost.querySelector('.post__buttons.post-edit-mode');

  postButtons.style.display = 'none';
  postEditModeButtons.style.display = 'flex';

  titleElement.contentEditable = true;
  contentElement.contentEditable = true;

  cachedTitle = titleElement.textContent;
  cachedContent = contentElement.textContent;
}

function exitEditMode(title, content) {
  let titleElement = currentEditingPost.querySelector('.post__title');
  let contentElement = currentEditingPost.querySelector('.post__body');

  let postButtons = currentEditingPost.querySelector('.post__buttons:not(.post-edit-mode)');
  let postEditModeButtons = currentEditingPost.querySelector('.post__buttons.post-edit-mode');

  postButtons.style.display = 'flex';
  postEditModeButtons.style.display = 'none';

  titleElement.textContent = title;
  contentElement.textContent = content;

  titleElement.contentEditable = false;
  contentElement.contentEditable = false;

  clearErrors(currentEditingPost);
  currentEditingPost = null;
}

function handleDeleteButtonClick(button) {
  button.addEventListener('click', async function(event) {
    event.preventDefault();

    const postUrl = this.getAttribute('href');
    const response = await fetch(postUrl, {
      method: 'DELETE',
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        'X-CSRFToken': getCookie('csrftoken')
      }
    });

    if (response.ok) {
      const postElement = button.closest('.post');
      postElement.remove();
      const posts = document.querySelectorAll('.post');
      if (posts.length === 0){
          let blog__message = document.querySelector('.blog__message');
          blog__message.style.display = 'block';
      }
    } else {
      console.log('Помилка видалення поста');
    }
  });
}

function handleEditButtonClick(button, post) {
  button.addEventListener('click', function(event) {
    event.preventDefault();
    if (currentEditingPost) {
      exitEditMode(cachedTitle, cachedContent)
    }

    enterEditMode(post);
  });
}

function handleSaveButtonClick(button, post){
  button.addEventListener('click',async function(event) {
    event.preventDefault();

    let titleElement = post.querySelector('.post__title');
    let contentElement = post.querySelector('.post__body');

    const updatedTitle = titleElement.textContent;
    const updatedBody = contentElement.textContent;
    const postUrl = this.getAttribute('href');

    const response = await fetch(postUrl, {
        method: 'PUT',
        headers: {
            "X-Requested-With": "XMLHttpRequest",
            'X-CSRFToken': getCookie('csrftoken'),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: updatedTitle,
            content: updatedBody
        })
    });

    if (response.ok) {
      exitEditMode(updatedTitle, updatedBody)
    } else {
      response.json().then(function(data) {
        showErrors(post, data.messageDetail);
      });
    }

  });
}

function handleCancelButtonClick(button){
  button.addEventListener('click', function(event) {
    event.preventDefault();
    exitEditMode(cachedTitle, cachedContent)
});
}

function initializePost(post) {
    var editButton = post.querySelector('.post-edit__button');
    var saveButton = post.querySelector('.post-save__button');
    var cancelButton = post.querySelector('.post-cancel__button');
    var deleteButton = post.querySelector('.post-delete__button');

    handleEditButtonClick(editButton, post);
    handleSaveButtonClick(saveButton, post);
    handleCancelButtonClick(cancelButton);
    handleDeleteButtonClick(deleteButton);

    let postEditModeButtons = post.querySelector('.post__buttons.post-edit-mode');
    postEditModeButtons.style.display = 'none';

    console.log(posts.length);
}


function addNewPostElement(postData){
    var postList = document.querySelector('.blog__body');

    post_element = document.createElement('div');
    post_element.className = 'post';
    post_element.innerHTML =
    `
      <ul class="form__errors"></ul>
      <div class="post__header">
          <h3 class="post__title">${postData.title}</h3>
          <p class="post__author">${postData.author}</p>
      </div>
      <div class="post__body">${postData.content}</div>
      <div class="post__buttons">
        <a class="post__button post-edit__button btn" href="#">Редагувати</a>
        <a class="post__button post-delete__button btn btn-danger" href="/posts/ajax/${postData.id}">Видалити</a>
      </div>
      <div class="post__buttons post-edit-mode">
            <a class="post__button post-save__button btn" href="/posts/ajax/${postData.id}">Зберегти</a>
            <a class="post__button post-cancel__button btn btn-danger" href="#">Відмінити</a>
      </div>
    `

    initializePost(post_element);
    postList.appendChild(post_element);
}

function toggleCreatePostForm(form, toggleButton){
  form.style.display = 'none';

  toggleButton.addEventListener('click', function(event) {
      event.preventDefault();

      if (form.style.display === 'none') {
          form.style.display = 'block';
      } else {
          form.style.display = 'none';
      }
  });
}

function handleCreatePostFormSubmit(form){
  form.addEventListener('submit',async function(event) {
    event.preventDefault();

    var formData = new FormData(form);

    const response = await fetch(form.action, {
        method: form.method,
        body: formData,
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          'X-CSRFToken': getCookie('csrftoken')
        }
    })

    if (response.ok) {
      response.json().then(function(response) {
          addNewPostElement(response.data.post)
          clearErrors(form);
          form.reset();
          const posts = document.querySelectorAll('.post');
          if (posts.length !== 0){
            let blog__message = document.querySelector('.blog__message');
            blog__message.style.display = 'none';
          }
      });
    } else {
      response.json().then(function(data) {
        showErrors(form, data.messageDetail);
      });
    }

  });
}

document.addEventListener('DOMContentLoaded', function() {
    var postCreateBlock = document.querySelector('.post-create');
    var toggleButton = postCreateBlock.querySelector('.blog__button');
    var form = postCreateBlock.querySelector('.form');

    toggleCreatePostForm(form, toggleButton);
    handleCreatePostFormSubmit(form);
});