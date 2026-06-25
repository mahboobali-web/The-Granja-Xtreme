import { Counter } from '../models/counter.model';

type SequenceType = 'booking' | 'invoice' | 'receipt' | 'contract';

const PREFIXES: Record<SequenceType, string> = {
  booking: 'TGX-B-',
  invoice: 'TGX-I-',
  receipt: 'TGX-R-',
  contract: 'TGX-C-'
};

export const getNextTgxNumber = async (sequenceName: SequenceType): Promise<string> => {
  const counter = await Counter.findByIdAndUpdate(
    sequenceName,
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true }
  );

  const prefix = PREFIXES[sequenceName];
  const numberPadded = counter.sequence_value.toString().padStart(4, '0');
  return `${prefix}${numberPadded}`;
};
