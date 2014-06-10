Shock
=====

Shock is a simple static blog compiler.

Usage
-----

1. **Begin:** (Install `node` and `npm`, then) run `npm install -g shock`
2. **Write:** Save content under `/content` as HTML or Markdown. Run `shock newpost` to register that post in `index.json`.
3. **Publish:** Run `shock compile` to compile a static website, which you can then host on anything that serves static files.
4. **Customize:** Edit files under `/templates` to customize your blog.
5. **Facepalm:** Quickly unregister a post with `shock rm *name*`.

Basic Structure (reference)
---------------------------

A Shock blog consists of the following simple directory structure:

    .
    ├── content
    │   ├── post1.html
    │   └── post2.html
    ├── index.json
    ├── static
    │   ├── some.css
    │   └── more.js
    └── templates
        ├── 404.html    # 404 page
        ├── footer.html # footer (convenient for copyright...)
        ├── header.html # header
        ├── home.html   # index.html = homepage (list posts here)
        └── post.html   # actual post page

This can be generated automagically using `shock init`.

Hints
-----
- In `shock newpost`, leave `author` and `date` blank for reasonable defaults to be filled in.
