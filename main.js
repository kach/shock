#!/usr/bin/env node

var fs = require("fs"),
    rss = require("rss"),
    mustache = require("mustache"),
    optp = require("nomnom")
        .script("shock");

optp.command("init")
    .callback(function() {
        console.log("Noooo.");
    });

optp.command("compile")
    .callback(function() {
        fs.readFile("index.json", function(err, data) {
            if (err) {
                throw err;
            }
            var index = JSON.parse(data);

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
                return new Date(d.date).getTime();
            });
            items.forEach(function(item) {
                feed.item({
                    title: item.title,
                    description: item.description,
                    url: index.url + "/" + item.content,
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
                    content: fs.readFileSync("content/" + item.content).toString()
                }
                fs.writeFile(item.content, mustache.render(postpage, view), function() {
                    console.log("Created " + item.content);
                });


            });


            fs.writeFile("feed.xml", feed.xml("    "), function() {
                console.log("Created RSS feed.");
            });
            fs.writeFile("index.html", mustache.render(home, {
                header: header,
                footer: footer,
                posts: items
            }), function() {
                console.log("Created homepage.");
            })
        });
    });

var opts = optp.parse();
