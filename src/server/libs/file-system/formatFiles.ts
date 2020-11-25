import { Dirent } from 'fs-extra';
import { extname } from "path";

import { File } from '../../models/file.model';

export const formatFiles = (file: Dirent): File => {
    return {
        name: file.name.slice(0, file.name.lastIndexOf(extname(file.name))),
        type: file.isDirectory()
            ? 'folder'
            : file.isFile()
                ? 'file'
                : 'other',
        extension: file.isFile() ? extname(file.name) : ""
    };
};
