import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type EngagementDocument = Engagement & Document;

export enum Session {
  BREAKFAST_CLUB = 'breakfast club',
  SESSION1 = 'session1',
  BREAK = 'break',
  SESSION2 = 'session2',
  LUNCH = 'lunch',
  SESSION3 = 'session3',
}

export enum Behaviour {
  UNMARKED = 'Unmarked',
  GOOD = 'Good',
  FAIR = 'Fair',
  AVERAGE = 'Average',
  POOR = 'Poor',
}

@Schema({ timestamps: true })
export class Engagement {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Class', required: true })
  class: MongooseSchema.Types.ObjectId;

  @Prop({ 
    type: String, 
    enum: Object.values(Session), 
    required: true 
  })
  session: Session;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Student', required: true })
  student: MongooseSchema.Types.ObjectId;

  @Prop({ type: Boolean, required: true })
  attendance: boolean;

  @Prop({ 
    type: String, 
    enum: Object.values(Behaviour), 
    required: true 
  })
  behaviour: Behaviour;

  @Prop({ type: String, trim: true })
  comment?: string;

  @Prop({ type: Date, required: true })
  engagementDate: Date;

  @Prop({ type: Boolean, default: false })
  submitted?: boolean;
}

export const EngagementSchema = SchemaFactory.createForClass(Engagement);

// Index for better query performance
EngagementSchema.index({ class: 1 });
EngagementSchema.index({ student: 1 });
EngagementSchema.index({ session: 1 });
EngagementSchema.index({ attendance: 1 });
EngagementSchema.index({ behaviour: 1 });
EngagementSchema.index({ createdAt: -1 });

