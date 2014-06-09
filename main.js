#!/usr/bin/env node

var fs = require("fs"),
    rss = require("rss"),
    mustache = require("mustache"),
    chalk = require("chalk"),
    ncp = require("ncp"),
    prompt = require("prompt"),
    optp = require("nomnom").script("shock");


var success = chalk.green,
    failure = chalk.red;


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

            // Create RSS feed
            var feed = new rss({
                title: index.title,
                description: index.description,
                site_url: index.url,
                author: index.author,
                language: index.lang || "en",
            });

            var items = index.posts.sort(function(d) {
                return -new Date(d.date).getTime();
            });
            items.forEach(function(item) {
                feed.item({
                    title: item.title,
                    description: item.description,
                    url: index.url + "/" + item.file,
                    date: item.date,
                    author: item.author || index.author
                });

                var view = {
                    title: item.title,
                    description: item.description,
                    date: item.date,
                    author: item.author,
                    header: header,
                    footer: footer,
                    content: fs.readFileSync("content/" + item.file).toString()
                }
                fs.writeFile(item.file, mustache.render(postpage, view), function() {
                    console.log(success("Created " + item.file));
                });


            });


            fs.writeFile("feed.xml", feed.xml("    "), function() {
                console.log(success("Created RSS feed."));
            });
            fs.writeFile("index.html", mustache.render(home, {
                header: header,
                footer: footer,
                posts: items
            }), function() {
                console.log(success("Created homepage."));
            })
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
                ['title', 'author*', 'description', 'file', 'date*'],
                function(err, data) {
                    if (err) {
                        console.log(failure("Aborted."));
                        process.exit();
                    }
                    data.author = data.author || index.author;
                    data.date = data.date || Date.now();
                    index.posts.push(data);

                    fs.writeFile("index.json", JSON.stringify(index, null, 4), function(err) {
                        console.log(success("Post created."));
                    });
                });
        })
    });

var opts = optp.parse();
