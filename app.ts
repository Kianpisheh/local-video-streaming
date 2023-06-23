import express, { Request, Response } from "express";
import fs from "fs";
const cors = require("cors");

const app = express();
const port = 8000;
let corsOptions = {
    origin: "http://localhost:3000",
};

const videosFolderPath = "/media/kian/889A3B4B9A3B3552/Epic_Kitchen_100";
app.use(cors());
app.use(cors(corsOptions));
app.use("/videos", express.static(videosFolderPath));

app.get("/", (req: Request, res: Response) => {
    res.send("Hello World!");
});

app.use((req, res, next) => {
    res.setHeader("Keep-Alive", "timeout=600");
    next();
});

app.get("/videos", (req: Request, res: Response) => {
    const range = req.headers.range;
    if (!range) {
        res.status(400).send("Requires Range header");
    }

    const videoPath = req.query.videoid;
    const videoSize = fs.statSync(videosFolderPath + "/" + videoPath).size;

    const CHUNK_SIZE = 10 ** 6; // 1MB
    if (range) {
        const start = Number(range.replace(/\D/g, ""));
        const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
        const contentLength = end - start + 1;
        const headers = {
            "Content-Range": `bytes ${start}-${end}/${videoSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": contentLength,
            "Content-Type": "video/mp4",
        };
        res.writeHead(206, headers);
        const videoStream = fs.createReadStream(videosFolderPath + "/" + videoPath, { start, end });
        videoStream.pipe(res);
    }
});

app.listen(port, () => {
    console.log(`web-server is listening at http://localhost:${port}`);
});
