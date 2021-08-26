"use strict";
const fs = require('fs');
const yargs = require('yargs');
const readline = require('readline');

//////// ARGUMENTS ////////
const argv = yargs
    .option('input', {
        alias: 'i',
        description: 'Input file path',
        type: 'string',
    })
    .option('output', {
        alias: 'o',
        description: 'Output file path (default current dir)',
        type: 'string',
    })
    .help()
    .alias('help', 'h')
    .argv;

function checkArgs(input, output) {
    if(typeof input === "undefined") {
        throw 'No input file specified';
    }
    if(typeof output === "undefined") {
        argv.output = 'out.txt';
    }
}
try {
    checkArgs(argv.input, argv.output);
    main(argv.input, argv.output);
}
catch(err) {
    console.error(err)
}

//////// MAIN ////////
function main(input, output) {
    let inTag = false;
    let tagNameWritten = false;
    let newString = '';
    let createNewStringPromise = new Promise(((resolve, reject) => {
        fs.readFile(input, 'utf-8', (err, data) => {
            if (err) throw err;
            for (let i = 0; i < data.length; i++) {
                if (data[i] === '<') {
                    // Loop trova l'inizio di un tag '<'
                    inTag = true;
                } else if (data[i] === '>') {
                    // Loop trova fine di un tag '>' e resetta le variabili
                    inTag = false;
                    tagNameWritten = false;
                }
                if (inTag) {
                    if (data[i] === ' ') {
                        // Nome del tag es 'p', 'span' scritto, tutto ciò che segue viene ignorato
                        tagNameWritten = true;
                    }
                    if (!tagNameWritten) {
                        newString += data[i];
                    }
                }
                else {
                    // Tutto ciò che non è all'interno di un tag viene scritto
                    newString += data[i];
                }
            }
            resolve(newString);
        });
    }));

    fs.stat(output, (err, stats) => {
        if (err) return;
        fs.unlink(output, (err) => {
            if(err) throw err;
            console.log('File already exists! Overwriting..');
        });
    });

    createNewStringPromise.then(resolve => {
        fs.writeFile(output, resolve, (err) => {
            if (err) return console.error(err);
            console.log('Done, file saved in %s!', output)
        })
    });
}