import { mkdir, rename, unlink, stat } from 'fs';
import { join } from 'path';

import { Request, Response } from 'express';
import formidable from 'formidable';
import { filesRoot, filesTemp } from '../../../app';

import { securePath } from '../../../libs/file-system/securePath';

export const postFileController = async (req: Request, res: Response) => {
    let pathResource: string,
        dirResource: string,
        form = new formidable.IncomingForm();

    form.uploadDir = filesTemp;

    form.parse(req, async (err, { type, name, dir }, { file }) => {

        if (err) return res.json({ err })

        type = type.toString().trim();
        name = name?.toString().trim();
        dir = dir.toString().trim();

        if (type == "folder" && file) return unlink(file.path, () => res.status(400).json({ code: "INVALID_DATA" }))

        if (!type || !dir) return res.status(400).json({ code: "INVALID_DATA" });

        if (type != "folder" && type != "file") return res.status(400).json({ code: "INVALID_DATA" });

        dirResource = join(filesRoot, securePath(dir));

        if (type == 'folder') {
            if (!name) return res.status(400).json({ code: "INVALID_DATA" });

            pathResource = join(dirResource, securePath(name))

            return mkdir(pathResource, (err) => {
                if (err) return res.status(400).json({ err });

                return res.status(201).json({ created: true });
            });

        } else if (type == "file") {

            if (!file || file?.size == 0)
                return res.status(400).json({ code: "NO_ORIGIN_FILE" });

            pathResource = join(dirResource, securePath(file.name));

            stat(pathResource, (err, stats) => {
                if (err && err.code != 'ENOENT') return res.json({ err });
                else if (err && err.code == 'ENOENT') {
                    rename(file.path, pathResource, (err) => {
                        if (err) unlink(file.path, error => {

                            if (error) return res.json({ error })

                            err.code == "ENOENT"
                                ? res.status(400).json({ code: "NO_DEST_DIRECTORY" })
                                : res.json({ err });

                        })
                        else return res.json({ uploaded: true });
                    })
                } else if (stats) return unlink(file.path, () => {
                    return res.status(400).json({ code: "DEST_FILE_MATCHES" })
                })
            })
        }

    })
};
