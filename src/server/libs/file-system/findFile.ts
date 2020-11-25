import { join, basename, dirname, extname } from 'path';
import { Dirent, opendir } from 'fs';

export const findFile = (path: string): Promise<{ resolved_path: string; type: string; extension: string | null; } | null> => {
    return new Promise((res, rej) => {
        let base = basename(path),
            dir = dirname(path),
            result: { resolved_path: string; type: string; extension: string | null; };

            opendir(dir, async (err, data) => {
                if (err) return rej({code: "NO_DIR"});

                let gen = data[Symbol.asyncIterator](),
                    direntArr: Dirent[] = [];

                for await (const i of gen) direntArr.push(i)

                if (direntArr.length == 0) return res(null);

                direntArr.forEach((f) => {
                    let f_n = f.name,
                        f_t :string,
                        f_e :string | null;

                    if (f.isFile()) {
                        f_e = extname(f.name);
                        f_t = 'file';
                    } else if (f.isDirectory()) {
                        f_e = null;
                        f_t = 'folder';
                    } else {
                        return;
                    }

                    if (f_n == base) result = {
                        resolved_path: join(dir, f.name),
                        extension: f_e,
                        type: f_t
                    }; 
                });

                if (result) return res(result);

                return res(null);
            });
    });
};
