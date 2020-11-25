import { rmdir, unlink } from 'fs';
import { join, basename } from 'path';

import { Request, Response } from 'express';

import { filesRoot } from '../../../app';
import { securePath } from '../../../libs/file-system/securePath';
import { findFile } from '../../../libs/file-system/findFile';

export const delDirectoryController = async (req: Request, res: Response) => {
    let
        dir = req.query.dir?.toString().trim(),
        type = req.params.type?.toString().trim(),
        name = req.params.name?.toString().trim(),
        ext = req.params.ext?.toString().trim() == "null" ? null : req.params.ext?.toString().trim(),
        resourcePath: string;

    if (!dir || !type || !name) return res.status(400).json({code: "INVALID_DATA"});

    if (type == "folder" || type == "file") {
        if (type == "file" && !ext) return res.status(400).json({code: "INVALID_DATA"});
    } else return res.json({
        message: 'Invalid data or not data provider',
        code: 400,
        stack: 3
    });

    resourcePath = type == "file"
        ? join(filesRoot, securePath(dir), securePath(name + ext))
        : join(filesRoot, securePath(dir), securePath(name));

    if (resourcePath == join(filesRoot, '/')) return res.status(401).json({code: 'UNAUTHORIZED'});

    findFile(resourcePath).then((pathResolve) => {
        if (pathResolve) {
            if (pathResolve.type == "folder") rmdir(pathResolve.resolved_path, { recursive: true }, (err) => {
                if (err) return res.status(400).json({code: "ERROR_DIR", err});
                return res.json({ deleted: true })
            });
            else if (pathResolve.type == "file") unlink(pathResolve.resolved_path, (err) => {
                if (err) return res.status(400).json({code: "ERROR_DIR", err});
                return res.json({ deleted: true })
            })
        }else return res.status(400).json({ code: "NO_ORIGIN_FILE" })
    }).catch((err) => {
        if (err.code == "NO_DIR") return res.status(400).json({ code: "NO_ORIGIN_DIRECTORY" });
        return res.json({err, stack: 2});
    });
};