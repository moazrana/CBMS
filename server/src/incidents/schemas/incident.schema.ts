import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Student } from '../../students/schemas/student.schema';
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
export class Incident extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Student', required: true })
  student: Student | Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  staff: User | Types.ObjectId;

  @Prop({ default: false })
  status: boolean;

  @Prop({ type: String, required: true })
  location: string;

  @Prop({ type: Date, required: true })
  dateAndTime: Date;

  @Prop({ type: Types.ObjectId, ref: 'Period', required: false })
  period?: Period | Types.ObjectId;

  @Prop()
  description?: string;

  @Prop({ type: [String], default: [] })
  directedToward?: string[];

  @Prop({ default: false })
  physicalInterventionUsed?: boolean;

  @Prop()
  restrainDescription?: string;

  @Prop({ type: Object, default: {} })
  bodyMapFrontMarkers?: Record<string, number>;

  @Prop({ type: Object, default: {} })
  bodyMapBackMarkers?: Record<string, number>;

  @Prop({ type: [String], default: [] })
  action?: string[];

  @Prop()
  actionDescription?: string;

  @Prop({ type: [String], default: [] })
  exclusion?: string[];

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

  @Prop({ type: [{ fileName: String, filePath: String, fileType: String, fileSize: Number }], default: [] })
  descriptionFiles?: { fileName: string; filePath: string; fileType: string; fileSize: number }[];

  @Prop({ type: [{ fileName: String, filePath: String, fileType: String, fileSize: Number }], default: [] })
  restrainFiles?: { fileName: string; filePath: string; fileType: string; fileSize: number }[];
}

export type IncidentDocument = Incident & Document;
export const IncidentSchema = SchemaFactory.createForClass(Incident); 