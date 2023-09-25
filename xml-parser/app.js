const fs = require("fs");
const { createClient } = require("redis");
const xmlConverter = require("xml-js");
const yargs = require("yargs");

const argv = yargs
    .options({
        filePath: {
            alias: "f",
            description: "The path of the XML file being parsed",
            demandOption: true,
            type: "string"
        },
        verbose: {
            alias: "v",
            description: "Verbose logging",
            type: "boolean"
        }
    })
    .argv;

const xmlPath = argv?.filePath;
const verboseLoggingEnabled = argv?.verbose;

const main = async () => {
    console.debug("Parsing XML file.")

    const xmlData = fs.readFileSync(xmlPath, "utf-8");
    const parsedData = JSON.parse(
        xmlConverter.xml2json(xmlData, { compact: true, spaces: 4 })
    );

    const redisClient = await createClient({
        url: "redis://redis:6379"
    })
    .on("error", (err) => console.error(`Failed to connect to redis: ${err}`))
    .connect();

    let subdomains = [];
    parsedData?.config?.subdomains?.subdomain?.forEach(r => {
        subdomains.push(r?._text);
    });

    await redisClient.rPush("subdomains", subdomains)
    .then(() => {
        if (verboseLoggingEnabled) {
            console.log(`"subdomain" key saved to Redis server.`)
        }
    });

    parsedData?.config?.cookies?.cookie?.forEach(r => {
        const key = `cookie:${r?._attributes?.name}:${r?._attributes?.host}`
        const value = r?._text;

        redisClient.set(key, value)
        .then(() => {
            if (verboseLoggingEnabled) {
                console.log(`${key} key saved to Redis server.`)
            }
        });
    })

    redisClient.quit()
    .then(() => console.debug("Parsing completed."));
};

main();

