#!/usr/bin/env node

var fs = require("fs"),
    rss = require("rss"),
    mustache = require("mustache"),
    chalk = require("chalk"),
    ncp = require("ncp"),
    prompt = require("prompt"),
    dateFormat = require("dateformat"),
    marked = require("marked"),
    optp = require("nomnom").script("shock"),
    wordcount = require('wordcount');

marked.setOptions({
    smartypants: true
});

var success = chalk.green,
    failure = chalk.red;

function isMarkdown(name) {
    return name.split(".")[name.split(".").length-1] === "md";
}
function ensureHTML(name) {
    return isMarkdown(name) ? name.replace(/\.md$/, ".html") : name;
}


prompt.message = "(shock)";

optp.command("init")
    .callback(function() {
        prompt.start();
        prompt.get(['title', 'author', 'description', 'url'], function(err, x) {
            if (err) {
                console.log(failure("Aborted."));
                process.exit();
            }
            ncp(__dirname+"/init", ".", function(err) {
                if (err) {
                    console.log(failure("Failed to create directory structure. Hmph."));
                    process.exit();
                }
                fs.readFile("index.json", function(err, data) {
                    var index = JSON.parse(data);
                    index.title = x.title;
                    index.author = x.author;
                    index.description = x.description;
                    index.url = x.url;
                    fs.writeFile("index.json", JSON.stringify(index, null, 4), function(err) {
                        console.log(success("Minimal shock site initialized."));
                    });
                });
            });
        });
    });

optp.command("compile")
    .callback(function() {
        fs.readFile("index.json", function(err, data) {
            if (err) {
                throw err;
            }
            var index;
            try {
                index = JSON.parse(data);
            } catch(e) {
                console.log(failure("index.json failed to parse (it has to be honest json, not a js object literal!)"));
                process.exit();
            }

            var header = fs.readFileSync("templates/" + index.templates.header).toString();
            var footer = fs.readFileSync("templates/" + index.templates.footer).toString();
            var postpage = fs.readFileSync("templates/" + index.templates.postpage).toString();
            var home = fs.readFileSync("templates/" + index.templates.home).toString();
            var notfound = fs.readFileSync("templates/" + index.templates["404"]).toString();

            // Create RSS feed
            var feed = new rss({
                title: index.title,
                description: index.description,
                site_url: index.url,
                feed_url: index.url+"/feed.xml",
                image_url: index.img,
                author: index.author,
                language: index.lang || "en",
            });

            var items = index.posts.sort(function(a, b) {
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            });
            items.forEach(function(item) {
                var content = fs.readFileSync("content/" + item.file).toString();
                feed.item({
                    title: item.title,
                    description: marked(item.description) + "\n\n" + (item.markdown ? marked(content) : content),
                    url: index.url + "/" + ensureHTML(item.file),
                    date: item.date,
                    author: item.author || index.author
                });

                var view = {
                    title: item.title,
                    description: marked(item.description),
                    date: dateFormat(new Date(item.date), "fullDate"),
                    author: item.author,
                    header: header,
                    footer: footer,
                    content: item.markdown ? marked(content) : content,
                    file: item.file,
                    time: Math.ceil(wordcount(content) / 5.5 / 60)
                }
                fs.writeFile(ensureHTML(item.file), mustache.render(postpage, view), function() {
                    console.log(success("Created " + item.file));
                });


            });


            fs.writeFile("feed.xml", feed.xml("    "), function() {
                console.log(success("Created RSS feed."));
            });
            fs.writeFile("404.html", mustache.render(notfound, {
                header: header,
                footer: footer,
            }), function() {
                console.log(success("Created 404.html"));
            });

            fs.writeFile("index.html", mustache.render(home, {
                header: header,
                footer: footer,
                posts: items.map(function(i) {
                    i.file = ensureHTML(i.file);
                    i.date = dateFormat(new Date(i.date), "shortDate");
                    return i;
                })
            }), function() {
                console.log(success("Created homepage."));
            });
        });
    });

optp.command("newpost")
    .callback(function() {
        fs.readFile("index.json", function(err, data) {
            if (err) {
                console.log(failure("Couldn't read index.json."));
                process.exit();
            }
            var index = JSON.parse(data);
            prompt.start();
            prompt.get(
                ['title', 'author', 'description', 'file', 'date'],
                function(err, data) {
                    if (err) {
                        console.log(failure("Aborted."));
                        process.exit();
                    }
                    if (isMarkdown(data.file)) {
                        data.markdown = true;
                    }
                    data.author = data.author || index.author;
                    data.date = data.date || dateFormat(Date.now(), "shortDate");
                    index.posts.push(data);

                    fs.writeFile("index.json", JSON.stringify(index, null, 4), function(err) {
                        console.log(success("Post created."));
                    });
                });
        })
    });

optp.command("rm")
    .option("name", {
        position: 1,
        required: true
    })
    .callback(function() {
        fs.readFile("index.json", function(err, data) {
            if (err) {
                console.log(failure("Couldn't read index.json."));
                process.exit();
            }
            var index = JSON.parse(data);

            for (var i=0; i<index.posts.length; i++) {
                if (index.posts[i].file === opts.name) {
                    index.posts.splice(i, 1);
                    console.log(success("Deleted."));
                    break;
                }
            }
            if (i === index.posts.length) {
                console.log(failure("Nothing deleted."));
            }

            fs.writeFile("index.json", JSON.stringify(index, null, 4), function(err) {
                console.log(success("Updated index."));
            });

        })
    });

var opts = optp.parse();
