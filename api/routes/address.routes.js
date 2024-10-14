import express from 'express'
import { verifyToken } from "../utils/verifyUser.js";
import { addAddress, deleteAddress, editAddress, fetchAddress } from '../controllers/address.controller.js';


const router = express.Router();

router.post('/add-address', verifyToken, addAddress )
router.get("/:userId", verifyToken, fetchAddress);
router.put('/edit-address/:userId/:addressId', verifyToken, editAddress )
router.delete('/delete-address/:userId/:addressId', verifyToken, deleteAddress )

export default router;
