import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Location } from '../../location/location.schema';
import { Period } from '../../period/period.schema';

export class Commentary {
  @Prop({ required: true })
  severity: number;

  @Prop({ required: true })
  direction: string;

  @Prop({ required: true })
  behavior: string;

  @Prop({ type: [String], default: [] })
  updates: string[];
}
export class MeetingNotes{
    @Prop()
    date:boolean

    @Prop()
    persons_attending:boolean

    @Prop()
    notes:boolean
}

export class Meeting {
  @Prop()
  haveDate: boolean;

  @Prop()
  date?: Date;

  @Prop()
  havePersons: boolean;

  @Prop()
  persons?: string;

  @Prop()
  haveNotes: boolean;

  @Prop()
  notes?: string;
}

@Schema({ timestamps: true })
export class Safeguard extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  student: User | Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  staff: User | Types.ObjectId;

  @Prop({ default: false })
  status: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Location', required: true })
  location: Location | Types.ObjectId;

  @Prop({ type: Date, required: true })
  dateAndTime: Date;

  @Prop({ type: Types.ObjectId, ref: 'Period', required: true })
  period: Period | Types.ObjectId;

  @Prop()
  description?: string;

  @Prop({ type: Commentary, required: false })
  commentary?: Commentary;

  @Prop()
  type?:string[]

  @Prop()
  your_account?:string[]

  @Prop({default:false})
  body_mapping?:boolean

  @Prop()
  early_help?:string[]

  @Prop()
  referral_type?:string[]

  @Prop({type:MeetingNotes,required:false})
  meeting_notes?: MeetingNotes

  @Prop()
  outcome?:boolean

  @Prop({ type: [Meeting], required: false })
  meetings?: Meeting[];

  @Prop({ type: [String], required: false })
  conclusion?: string[];

  @Prop({ required: false })
  fileName: string;

  @Prop({ required: false })
  filePath: string;

  @Prop({ required: false })
  fileType: string;

  @Prop({ required: false })
  fileSize: number;
}

export type SafeguardDocument = Safeguard & Document;
export const SafeguardSchema = SchemaFactory.createForClass(Safeguard); 