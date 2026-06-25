import { Request, Response } from 'express';
import { Review } from '../models/review.model';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const reviewSchema = z.object({
  bookingId: z.string().optional(),
  atvId: z.string().optional(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(10)
});

export const submitReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const parsed = reviewSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid review data.', errors: parsed.error.format() });
      return;
    }

    const review = await Review.create({
      customerId: req.user._id,
      ...parsed.data
    });

    res.status(201).json({ message: 'Review submitted successfully', review });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit review.', error: (error as Error).message });
  }
};

export const getPublicReviews = async (_req: Request, res: Response): Promise<void> => {
  try {
    const reviews = await Review.find({ status: 'approved' })
      .populate('customerId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(20);
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reviews.', error: (error as Error).message });
  }
};

export const getAdminReviews = async (_req: Request, res: Response): Promise<void> => {
  try {
    const reviews = await Review.find()
      .populate('customerId', 'firstName lastName email')
      .sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reviews.', error: (error as Error).message });
  }
};

export const updateReviewStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      res.status(400).json({ message: 'Invalid status' });
      return;
    }

    const review = await Review.findByIdAndUpdate(id, { status }, { new: true });
    if (!review) {
      res.status(404).json({ message: 'Review not found' });
      return;
    }

    res.status(200).json({ message: 'Review status updated', review });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update review status.', error: (error as Error).message });
  }
};
