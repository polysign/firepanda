---
layout: page
title: Introduction
permalink: /intro
nav_order: 0
---

# Introduction

**Firepanda** is an opinionated framework, mixed with an *ORM* for **Firebase** services and some **Google Cloud** services.
It's main goal is to simplify the development of **Firebase** web applications. **Firepanda** comes preequipped with an ORM-like interface to simplify developments of **Firestore** collections, mixed with opinionated and best-practice features.


## Collections

**Firestore** collections are defined using a custom schema. The schema is a loose representation of the data within the collection. As for most NoSQL database engines, **Firestore** has no strict schema for the data it holds. **Firepanda** just defines a schema to simplify working with the data (validation, life-cycle-hooks, ...).


{% assign pages = site.pages | sort:"nav_order" %}

<ul>
{% for page in pages %}
  {% if page.parent == "Collections" %}
    <li><a href="{{ page.url }}">{{ page.title }}</a></li>
  {% endif %}
{% endfor %}
</ul>