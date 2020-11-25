import { opendir } from 'fs';
import { join } from 'path';

import { Request, Response } from 'express';
import { filesRoot } from '../../../app';

import { File } from '../../../models/file.model';
import { formatFiles } from '../../../libs/file-system/formatFiles';
import { securePath } from '../../../libs/file-system/securePath';

export const getDirectoryController = async (req: Request, res: Response) => {
    let files: File[] = [],
        dir = req.query.dir?.toString().trim() || "/",
        resourcePath = join(filesRoot, securePath(dir));

    opendir(resourcePath, async (err, data) => {
        if (err) return res.status(400).json({ code: "NO_ORIGIN_DIRECTORY" });

        let folder = data[Symbol.asyncIterator]();

        for await (let item of folder) files.push(formatFiles(item));

        if (files.length > 0) files = files.map(f => {
                f.path = join(securePath(dir), f.name);
                return f;
            })

        return res.json({
            count: files.length,
            files
        })
    });
};
