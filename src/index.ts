//const fs = require('fs');
import * as fs from 'fs';
const commandLineArgs = require('command-line-args');

const optionDefinitions = [
    { name: 'input', type: String, multiple: false, defaultOption: true },
    { name: 'output', type: String, multiple: false },
    { name: 'minimumTweets', type: Number, multiple: false },
    { name: 'tweetLimit', type: Number, multiple: false },
    { name: 'maximumTweets', type: Number, multiple: false },
];

const fileRegex = /^([0-9]+)\.json$/;

const OUTDIR = "out";
const MINIMUM_TWEETS = 1000;

interface Tweet {
    created_at: string,
    id_str: string,
    text: string,
    user: {
        id_str: string
    },
    retweeted: boolean,
    lang: string,
}

function main(options) {
    if (options.input === undefined) {
        console.error("Input folder is needed.");
        process.exit(1);
        return;
    }

    let input = options.input;
    let output = OUTDIR;
    let minimumTweets = MINIMUM_TWEETS;
    let tweetLimit;
    if (options.output) {
        output = options.output;
    }
    if (options.minimumTweets) {
        minimumTweets = options.minimumTweets;
    }
    if (options.tweetLimit) {
        tweetLimit = options.tweetLimit;
    }

    filterData(input, output, minimumTweets, tweetLimit, options.maximumTweets);
}

function filterData(inputFolder: string, outputFolder: string, minimumTweets: number, tweetLimit?: number, maximumTweets?: number) {
    if (!fs.existsSync(outputFolder)) {
        fs.mkdirSync(outputFolder);
    }  

    let files = fs.readdirSync(inputFolder);

    for (let file of files) {
        let match = fileRegex.exec(file);

        if (match && match.length > 1) {
            let userid = match[1];

            // Test if dataset has enough tweets first
            let allTweets = getTweets(inputFolder, userid);

            if (allTweets.length >= 2*minimumTweets && allTweets.length <= 2*maximumTweets) {
                let tweets = getTweets(inputFolder, userid, tweetLimit);
                
                writeSample(`${outputFolder}/${userid}.json`, tweets);
            }
        }
    }
}

function getTweets(foldername: string, userid: string, count?: number): Tweet[] {
    let filename = `${foldername}/${userid}.json`;

    let tweets: Tweet[] = JSON.parse(fs.readFileSync(filename, "utf-8"));

    if (count === undefined) {
        return tweets;
    } else {
        let indices = [];

        // Make sure to not attempt to take more tweets than available
        count = Math.min(tweets.length, count);

        // Take authors tweets
        for (let i = 0; i < count; i++) {
            let rand = -1;
            do {
                rand = Math.floor(Math.random() * tweets.length);
            } while (indices.indexOf(rand) >= 0 || tweets[rand].user.id_str !== userid);

            indices.push(rand);
        }

        // Take random tweets
        for (let i = 0; i < count; i++) {
            let rand = -1;
            do {
                rand = Math.floor(Math.random() * tweets.length);
            } while (indices.indexOf(rand) >= 0 || tweets[rand].user.id_str === userid);

            indices.push(rand);
        }

        return tweets.filter((value, index) => indices.indexOf(index) >= 0);
    }
}

function writeSample(filename: string, tweets: Tweet[]) {
    fs.writeFileSync(filename, JSON.stringify(tweets, null, 2));
}

main(commandLineArgs(optionDefinitions))