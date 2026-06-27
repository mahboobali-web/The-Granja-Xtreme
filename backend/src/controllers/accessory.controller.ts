import { Request, Response } from 'express';
import { Accessory } from '../models/accessory.model';

export const getAccessories = async (req: Request, res: Response): Promise<void> => {
  try {
    const accessories = await Accessory.find().sort({ name: 1 });
    res.status(200).json(accessories);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch accessories', error: (error as Error).message });
  }
};

export const getAccessoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const accessory = await Accessory.findById(id);
    if (!accessory) {
      res.status(404).json({ message: 'Accessory not found' });
      return;
    }
    res.status(200).json(accessory);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch accessory', error: (error as Error).message });
  }
};

export const createAccessory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, nameEs, description, descriptionEs, price, quantity, images } = req.body;
    const newAccessory = await Accessory.create({
      name,
      nameEs,
      description,
      descriptionEs,
      price,
      quantity,
      images
    });
    res.status(201).json(newAccessory);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create accessory', error: (error as Error).message });
  }
};

export const updateAccessory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const accessory = await Accessory.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    
    if (!accessory) {
      res.status(404).json({ message: 'Accessory not found' });
      return;
    }
    res.status(200).json(accessory);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update accessory', error: (error as Error).message });
  }
};

export const deleteAccessory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const accessory = await Accessory.findByIdAndDelete(id);
    
    if (!accessory) {
      res.status(404).json({ message: 'Accessory not found' });
      return;
    }
    res.status(200).json({ message: 'Accessory deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete accessory', error: (error as Error).message });
  }
};
