import { Request, Response } from 'express';
import { Maintenance } from '../models/maintenance.model';
import { Atv } from '../models/atv.model';

export const scheduleMaintenance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { atvId, description, mechanicName, estimatedCost, scheduledDate } = req.body;
    
    const atv = await Atv.findById(atvId);
    if (!atv) {
      res.status(404).json({ message: 'ATV not found' });
      return;
    }

    const maintenance = await Maintenance.create({
      atvId,
      description,
      mechanicName,
      estimatedCost,
      scheduledDate,
      status: 'Scheduled'
    });

    // Optionally update ATV status to Maintenance if date is today
    if (new Date(scheduledDate).toDateString() === new Date().toDateString()) {
      atv.status = 'MAINTENANCE';
      await atv.save();
    }

    res.status(201).json(maintenance);
  } catch (error) {
    res.status(500).json({ message: 'Failed to schedule maintenance' });
  }
};
