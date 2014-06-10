Shock
=====

Shock is a simple static blog compiler.

Usage
-----

1. **Begin:** (Install `node` and `npm`, then) run `npm install -g shock`
2. **Write:** Save content under `/content`. Run `shock newpost` to register that post in `index.json`.
3. **Publish:** Run `shock compile` to compile a static website, which you can then host on anything that serves static files.
4. **Customize:** Edit files under `/templates` to customize your blog.

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
        ├── 404.html
        ├── footer.html
        ├── header.html
        ├── home.html
        └── post.html

This can be generated automagically using `shock init`.
