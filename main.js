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


            });


            fs.writeFile("feed.xml", feed.xml("    "), function() {
                console.log("Created RSS feed.");
            });
        });
    });

var opts = optp.parse();
