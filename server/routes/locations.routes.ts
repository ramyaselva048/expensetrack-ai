import { Router } from 'express';
import { 
  getLocations, 
  getLocationById, 
  createLocation, 
  updateLocation, 
  deleteLocation 
} from '../controllers/locations.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

// All location routes are protected by JWT authentication
router.use(authenticateJWT);

router.get('/', getLocations);
router.post('/', createLocation);
router.get('/:id', getLocationById);
router.put('/:id', updateLocation);
router.delete('/:id', deleteLocation);

export default router;
