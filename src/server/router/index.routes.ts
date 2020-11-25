import { Router } from 'express';
import fileRoutes from './routes/files.routes';

const router = Router();

router.use('/files', fileRoutes);
//End Point: "/files/"
export default router;
