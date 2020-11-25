import { Router } from 'express';
import {
    getDirectoryController,
    delDirectoryController,
    postFileController,
    putFileController
} from '../controllers/files.routes.controllers';

const router = Router();

router.get('/', getDirectoryController);
router.delete('/:name/:ext/:type', delDirectoryController);
router.post('/', postFileController);
router.put('/', putFileController);

export default router;
