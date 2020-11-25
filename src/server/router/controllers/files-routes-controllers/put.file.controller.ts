import { rename } from 'fs';
import { join } from 'path';
import { Request, Response } from 'express';
import { filesRoot } from '../../../app';

import { securePath } from '../../../libs/file-system/securePath';
import { findFile } from "../../../libs/file-system/findFile";
import { IncomingForm } from 'formidable';

export const putFileController = async (req: Request, res: Response) => {
    let resourcePath: string,
        resourcePathDest: string,
        form = new IncomingForm();

    form.parse(req, (err, { dir_a, dir_b, old_name, new_name, type, ext }) => {
        if (err) return res.status(500).json(err);
        dir_a = dir_a?.toString().trim();
        dir_b = dir_b?.toString().trim();
        old_name = old_name?.toString().trim();
        new_name = new_name?.toString().trim();
        type = type?.toString().trim();
        ext = ext?.toString().trim();


        if (!dir_a || !dir_b || !old_name || !new_name || !type) return res.status(400).json({ code: "INVALID_DATA" });

        if (type == "folder") {

            resourcePath = join(filesRoot, securePath(dir_a), securePath(old_name));
            resourcePathDest = join(filesRoot, securePath(dir_b), securePath(new_name));
            console.log(resourcePath);
            
        } else if (type == "file" && ext) {

            resourcePath = join(filesRoot, securePath(dir_a), securePath(old_name) + ext);
            resourcePathDest = join(filesRoot, securePath(dir_b), securePath(new_name) + ext);

        } else return res.status(400).json({ code: "INVALID_DATA" });

        if (resourcePath == resourcePathDest) return res.status(400).json({ code: "INVALID_DATA" });

        if (resourcePath == join(filesRoot, '/')) return res.json({ code: "UNAUTHORIZED" });

        findFile(resourcePath).then(async (pathResolve) => {
            if (pathResolve) {
                findFile(resourcePathDest).then(pathDest => {
                    if (!pathDest) rename(resourcePath, resourcePathDest, (err) => {
                        if (err) return res.status(500).json({ err });

                        return res.status(201).json({ moved: true });
                    });
                    else return res.status(400).json({ code: "DEST_FILE_MATCHES" })

                }).catch(err => {
                    if (err.code == "NO_DIR") return res.status(400).json({ code: "NO_DEST_DIRECTORY" });
                    return res.status(500).json({err, stack: 1})
                })
            } else return res.status(400).json({ code: "NO_ORIGIN_FILE" })
        }).catch((err) => {
            if (err.code == "NO_DIR") return res.status(400).json({ code: "NO_ORIGIN_DIRECTORY" });
            return res.json({err, stack: 2});
        });
    })
};
