const fs = require('fs');
const readline = require('readline');

const dataFolder = "../TwitterData/dataset3";
const indexFile = "index.json";
const outputFolder = "out";

interface DataIndexEntry {
    userId: string;
    tweetId: string;
    tweetText: string;
    mentionedUserIds: string[];
}

type DataIndex = DataIndexEntry[];

enum Decision {
    no,
    sender,
    mention
}

function* indexIterator(filePath: string) {
    if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const indexEntries: DataIndex = JSON.parse(fileContent);
        for (let entry of indexEntries) {
            yield entry;
        }
    } else {
        return;
    }
}

function promptForDecision(text: string): Promise<Decision> {
    return new Promise((resolve, reject) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question(`${text}\n<N(o), m(ention), s(ender)>: `, (answer: string) => {
            let result = Decision.no;
            switch (answer.toLowerCase()) {
                case Decision.sender.toString(): // 1
                case "s":
                case "sender": result = Decision.sender;
                    break;
                case Decision.mention.toString(): // 2
                case "m": 
                case "mention": result = Decision.mention;
                    break;
            }

            rl.close();

            resolve(result);
        });
    });
}

function copyFile(sourcePath: string, targetPath: string) {
    fs.createReadStream(sourcePath).pipe(fs.createWriteStream(targetPath));
}

async function main() {
    for (let entry of indexIterator(`${dataFolder}/${indexFile}`)) {
        let decision = await promptForDecision(entry.tweetText);
        
        if (decision == Decision.sender) {
            let sourcePath = `${dataFolder}/${entry.userId}.json`;
            let targetPath = `${outputFolder}/${entry.userId}.json`;
            if (fs.existsSync(sourcePath)) {
                copyFile(sourcePath, targetPath);
            }
        } else if (decision == Decision.mention) {
            if (entry.mentionedUserIds.length > 0) {
                let sourcePath = `${dataFolder}/${entry.mentionedUserIds[0]}.json`;
                let targetPath = `${outputFolder}/${entry.mentionedUserIds[0]}.json`;

                if (fs.existsSync(sourcePath)) {
                    copyFile(sourcePath, targetPath);
                }
            }
        }
    }
}

main();
