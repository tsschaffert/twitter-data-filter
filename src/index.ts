//const fs = require('fs');
import * as fs from 'fs';
const commandLineArgs = require('command-line-args');

const optionDefinitions = [
  { name: 'input', type: String, multiple: false, defaultOption: true },
  { name: 'output', type: String, multiple: false, defaultOption: false }
];

const fileRegex = /^([0-9]+)\.json$/;

const OUTDIR = "out";

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
    if (options.output) {
        output = options.output;
    }

    filterData(input, output, 1000);
}

function filterData(inputFolder: string, outputFolder: string, minimumTweets: number) {
    if (!fs.existsSync(outputFolder)) {
        fs.mkdirSync(outputFolder);
    }  

    let files = fs.readdirSync(inputFolder);

    for (let file of files) {
        let match = fileRegex.exec(file);

        if (match && match.length > 1) {
            let userid = match[1];

            let tweets = getUserTweets(inputFolder, userid);

            if (tweets.length >= minimumTweets) {
                writeSample(`${outputFolder}/${userid}.json`, tweets);
            }
        }
    }
}

function getUserTweets(foldername: string, userid: string, count?: number): Tweet[] {
    let filename = `${foldername}/${userid}.json`;

    let tweets: Tweet[] = JSON.parse(fs.readFileSync(filename, "utf-8"));

    if (count === undefined) {
        return tweets;
    } else {
        let indices = [];

        // Make sure to not attempt to take more tweets than available
        count = Math.min(tweets.length, count);

        for (let i = 0; i < count; i++) {
            let rand = -1;
            do {
                rand = Math.floor(Math.random() * tweets.length);
            } while (indices.indexOf(rand) >= 0);

            indices.push(rand);
        }

        return tweets.filter((value, index) => indices.indexOf(index) >= 0);
    }
}

function writeSample(filename: string, tweets: Tweet[]) {
    fs.writeFileSync(filename, JSON.stringify(tweets, null, 2));
}

main(commandLineArgs(optionDefinitions))