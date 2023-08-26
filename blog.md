---
title: Blog
nav_order: 3
lang: en
layout: default
permalink: blog/
---
This is just a space for blog posts on topics I think are interesting and want to share.
Currently, any writing here will be rough and any updates will be irregular.
If you have questions or comments on any posts, you may contact me using the email address in my CV.

{% for post in site.posts %}
* [{{post.title}}]({{post.url}}) *on* {{post.date | date_to_string}}
{% endfor %}
