---
title: Blog
nav_order: 3
lang: en
layout: default
permalink: blog/
---
Here are the current blog posts:
{% for post in site.posts %}
* [{{post.title}}]({{post.url}}) *on* {{post.date | date_to_string}}
{% endfor %}
